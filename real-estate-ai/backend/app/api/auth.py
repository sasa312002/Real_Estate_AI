from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Dict
from datetime import datetime
from app.models.mongodb_models import User
from app.core.security import verify_password, get_password_hash, create_access_token, verify_token
from app.core.config import settings
from app.db.mongodb import mongodb
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["authentication"])
security = HTTPBearer()

# Pydantic models
class UserSignup(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    is_active: bool
    plan: str
    analyses_used: int
    analyses_limit: int
    analyses_remaining: int
    can_purchase_new_plan: bool
    is_subscription_active: bool

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    plan: str
    analyses_limit: int
    analyses_remaining: int


# Plan configuration
PLAN_LIMITS = {
    "free": 5,
    "standard": 50,
    "premium": 500,
}

# Helper function to get current user
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    token = credentials.credentials
    payload = verify_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Find user by ObjectId
    try:
        user = await User.get(ObjectId(user_id))
    except Exception:
        user = None
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

@router.post("/signup", response_model=TokenResponse)
async def signup(user_data: UserSignup):
    """Create a new user account"""
    try:
        # Check if MongoDB is connected
        if not mongodb.client:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database service is not available. Please install and start MongoDB."
            )
        # Check if user already exists
        existing_user = await User.find_one(
            {"$or": [
                {"email": user_data.email},
                {"username": user_data.username}
            ]}
        )
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email or username already exists"
            )
        
        # Validate password length
        if len(user_data.password) < settings.min_password_length:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Password must be at least {settings.min_password_length} characters long"
            )
        
        # Create new user
        hashed_password = get_password_hash(user_data.password)
        new_user = User(
            email=user_data.email,
            username=user_data.username,
            hashed_password=hashed_password
        )
        
        await new_user.insert()
        
        # Generate access token
        access_token = create_access_token(data={"sub": str(new_user.id)})
        
        logger.info(f"New user created: {new_user.email}")
        
        limit = PLAN_LIMITS.get(new_user.plan, 0)
        return TokenResponse(
            access_token=access_token,
            plan=new_user.plan,
            analyses_limit=limit,
            analyses_remaining=max(limit - new_user.analyses_used, 0)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in user signup: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during signup"
        )

@router.post("/login", response_model=TokenResponse)
async def login(user_data: UserLogin):
    """Authenticate user and return access token"""
    try:
        # Check if MongoDB is connected
        if not mongodb.client:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database service is not available. Please install and start MongoDB."
            )
        # Find user by email
        user = await User.find_one({"email": user_data.email})
        
        if not user or not verify_password(user_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User account is deactivated"
            )
        
        # Generate access token
        access_token = create_access_token(data={"sub": str(user.id)})
        
        logger.info(f"User logged in: {user.email}")
        
        limit = PLAN_LIMITS.get(user.plan, 0)
        return TokenResponse(
            access_token=access_token,
            plan=user.plan,
            analyses_limit=limit,
            analyses_remaining=max(limit - user.analyses_used, 0)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in user login: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during login"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    limit = PLAN_LIMITS.get(current_user.plan, 0)
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        username=current_user.username,
        is_active=current_user.is_active,
        plan=current_user.plan,
        analyses_used=current_user.analyses_used,
        analyses_limit=limit,
        analyses_remaining=max(limit - current_user.analyses_used, 0),
        can_purchase_new_plan=current_user.can_purchase_plan(PLAN_LIMITS),
        is_subscription_active=getattr(current_user, 'is_subscription_active', False)
    )


class UpgradePlanRequest(BaseModel):
    plan: str  # expected: free | standard | premium

class UpgradePlanResponse(BaseModel):
    plan: str
    analyses_limit: int
    analyses_used: int
    analyses_remaining: int

class PlansResponse(BaseModel):
    plans: Dict[str, Dict[str, int | str]]

@router.post("/upgrade", response_model=UpgradePlanResponse)
async def upgrade_plan(req: UpgradePlanRequest, current_user: User = Depends(get_current_user)):
    """Upgrade (or downgrade) the user's plan. For paid plans, user must exhaust current limit first.
    If moving to a lower plan and usage exceeds limit, further analyses blocked until new cycle (future logic).
    """
    plan = req.plan.lower()
    if plan not in PLAN_LIMITS:
        raise HTTPException(status_code=400, detail="Invalid plan selected")
    
    # For paid plans, check if user can purchase (limit must be exhausted)
    if plan in ("standard", "premium") and not current_user.can_purchase_plan(PLAN_LIMITS):
        limit = PLAN_LIMITS.get(current_user.plan, 0)
        remaining = max(limit - current_user.analyses_used, 0)
        raise HTTPException(
            status_code=400, 
            detail=f"You can only purchase a new plan after exhausting your current {current_user.plan} plan limit. You have {remaining} analyses remaining."
        )
    
    # Reset subscription if purchasing a paid plan
    if plan in ("standard", "premium"):
        current_user.reset_subscription(plan, PLAN_LIMITS)
    else:
        # For free plan, just update the plan
        current_user.plan = plan
        current_user.updated_at = datetime.utcnow()
    
    await current_user.save()
    limit = PLAN_LIMITS[plan]
    return UpgradePlanResponse(
        plan=plan,
        analyses_limit=limit,
        analyses_used=current_user.analyses_used,
        analyses_remaining=max(limit - current_user.analyses_used, 0)
    )

@router.get("/plans", response_model=PlansResponse)
async def list_plans():
    """List available plans with limits and prices in LKR."""
    prices = {
        "free": 0,
        "standard": 2500,  # example price LKR
        "premium": 15000,  # example price LKR
    }
    data: Dict[str, Dict[str, int | str]] = {}
    for name, limit in PLAN_LIMITS.items():
        data[name] = {
            "limit": limit,
            "price_LKR": prices.get(name, 0),
            "currency": "LKR"
        }
    return PlansResponse(plans=data)
