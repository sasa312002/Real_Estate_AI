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
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    class Settings:
        name = "users"
        indexes = [
            "email",
            "username",
        ]

class Query(Document):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    user_id: ObjectId
    query_text: str
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
    deal_verdict: str  # "Good Deal", "Fair", "Overpriced"
    why: str
    confidence: float
    provenance: Optional[List[Dict[str, Any]]] = None
    # Extended AI enrichment fields (optional - may be null for legacy records)
    market_low: Optional[float] = None
    market_high: Optional[float] = None
    market_range_rationale: Optional[str] = None
    location_factor: Optional[float] = None
    location_rationale: Optional[str] = None
    llm_explanation: Optional[str] = None
    deal_key_metrics: Optional[Dict[str, Any]] = None
    deal_risk_flags: Optional[List[str]] = None
    deal_recommendation: Optional[str] = None
    entities: Optional[List[Dict[str, str]]] = None
    query_summary: Optional[str] = None
    retrieved_context: Optional[List[Dict[str, Any]]] = None
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
