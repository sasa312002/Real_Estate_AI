from beanie import Document, Indexed
from typing import Annotated
from pydantic import Field, EmailStr, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId

class User(Document):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    email: Annotated[EmailStr, Indexed(unique=True)]
    username: Annotated[str, Indexed(unique=True)]
    hashed_password: str
    is_active: bool = True
    # Subscription / package plan: free | standard | premium
    plan: str = "free"
    # Number of analyses performed under current plan
    analyses_used: int = 0
    # Subscription tracking
    subscription_start_date: Optional[datetime] = None
    subscription_end_date: Optional[datetime] = None
    is_subscription_active: bool = False
    can_purchase_new_plan: bool = True  # Can only purchase when limit is exhausted
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    class Settings:
        name = "users"
        indexes = [
            "email",
            "username",
        ]
    
    def is_limit_exhausted(self, plan_limits: dict) -> bool:
        """Check if the user has exhausted their current plan's limit"""
        limit = plan_limits.get(self.plan, 0)
        return self.analyses_used >= limit
    
    def can_purchase_plan(self, plan_limits: dict) -> bool:
        """Check if user can purchase a new plan (only when limit is exhausted)"""
        if self.plan == "free":
            return True  # Free users can always purchase
        return self.is_limit_exhausted(plan_limits)
    
    def reset_subscription(self, new_plan: str, plan_limits: dict):
        """Reset subscription when purchasing a new plan"""
        self.plan = new_plan
        self.analyses_used = 0  # Reset analyses count
        self.subscription_start_date = datetime.utcnow()
        self.is_subscription_active = True
        self.can_purchase_new_plan = False  # Cannot purchase until limit exhausted
        self.updated_at = datetime.utcnow()

class Query(Document):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    user_id: ObjectId
    query_text: str
    # Optional semantic tags (amenities / features) selected by user and derived from description
    tags: Optional[List[str]] = None
    city: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None
    beds: Optional[int] = None
    baths: Optional[int] = None
    area: Optional[float] = None
    year_built: Optional[int] = None
    asking_price: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "queries"
        indexes = [
            "user_id",
            "city",
            "created_at",
        ]

class Response(Document):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    query_id: ObjectId
    estimated_price: Optional[float] = None
    location_score: Optional[float] = None
    # Full analyze_location output when available (risk, nearby, facility_summary, etc.)
    analyze_location: Optional[Dict[str, Any]] = None
    deal_verdict: str  # "Good Deal", "Fair", "Overpriced"
    why: str
    confidence: float
    provenance: Optional[List[Dict[str, Any]]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "responses"
        indexes = [
            "query_id",
            "deal_verdict",
            "created_at",
        ]

class Feedback(Document):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    user_id: ObjectId
    response_id: ObjectId
    is_positive: bool
    comment: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "feedback"
        indexes = [
            "user_id",
            "response_id",
            "is_positive",
        ]

class Payment(Document):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    user_id: ObjectId
    stripe_session_id: str
    stripe_payment_intent_id: Optional[str] = None
    plan: str  # 'standard' | 'premium'
    amount: int  # Amount in cents (LKR)
    currency: str = "lkr"
    status: str  # 'pending' | 'completed' | 'failed' | 'canceled'
    payment_method: Optional[str] = None  # 'card', 'bank_transfer', etc.
    customer_email: Optional[str] = None
    customer_name: Optional[str] = None
    billing_address: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    class Settings:
        name = "payments"
        indexes = [
            "user_id",
            "stripe_session_id",
            "stripe_payment_intent_id",
            "status",
            "created_at",
        ]