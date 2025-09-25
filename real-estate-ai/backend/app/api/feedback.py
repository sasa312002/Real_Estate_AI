from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.models.mongodb_models import User, Response, Feedback
from app.api.auth import get_current_user
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/feedback", tags=["feedback"])

# Pydantic models
class FeedbackRequest(BaseModel):
    response_id: str
    is_positive: bool

class FeedbackResponse(BaseModel):
    id: str
    response_id: str
    is_positive: bool
    created_at: str

@router.post("/", response_model=FeedbackResponse)
async def submit_feedback(
    feedback_data: FeedbackRequest,
    current_user: User = Depends(get_current_user)
):
    """Submit feedback for a property analysis response"""
    try:
        # Check if response exists
        response = await Response.get(ObjectId(feedback_data.response_id))
        
        if not response:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Response not found"
            )
        
        # Check if user already provided feedback for this response
        existing_feedback = await Feedback.find_one({
            "response_id": ObjectId(feedback_data.response_id),
            "user_id": current_user.id
        })
        
        if existing_feedback:
            # Update existing feedback
            existing_feedback.is_positive = feedback_data.is_positive
            await existing_feedback.save()
            
            logger.info(f"Feedback updated for response {feedback_data.response_id} by user {current_user.id}")
            
            return FeedbackResponse(
                id=str(existing_feedback.id),
                response_id=str(existing_feedback.response_id),
                is_positive=existing_feedback.is_positive,
                created_at=existing_feedback.created_at.isoformat()
            )
        else:
            # Create new feedback
            new_feedback = Feedback(
                response_id=ObjectId(feedback_data.response_id),
                user_id=current_user.id,
                is_positive=feedback_data.is_positive
            )
            
            await new_feedback.insert()
            
            logger.info(f"New feedback submitted for response {feedback_data.response_id} by user {current_user.id}")
            
            return FeedbackResponse(
                id=str(new_feedback.id),
                response_id=str(new_feedback.response_id),
                is_positive=new_feedback.is_positive,
                created_at=new_feedback.created_at.isoformat()
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error submitting feedback: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error submitting feedback"
        )

@router.get("/response/{response_id}")
async def get_response_feedback(
    response_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get feedback statistics for a specific response"""
    try:
        # Check if response exists
        response = await Response.get(ObjectId(response_id))
        
        if not response:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Response not found"
            )
        
        # Get feedback statistics
        total_feedback = await Feedback.find({"response_id": ObjectId(response_id)}).count()
        positive_feedback = await Feedback.find({
            "response_id": ObjectId(response_id),
            "is_positive": True
        }).count()
        
        # Get user's feedback if any
        user_feedback = await Feedback.find_one({
            "response_id": ObjectId(response_id),
            "user_id": current_user.id
        })
        
        return {
            "response_id": response_id,
            "total_feedback": total_feedback,
            "positive_feedback": positive_feedback,
            "negative_feedback": total_feedback - positive_feedback,
            "user_feedback": user_feedback.is_positive if user_feedback else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching response feedback: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error fetching feedback"
        )
