from beanie import Document, Indexed
from pydantic import Field, EmailStr, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId

class User(Document):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    email: Indexed(EmailStr, unique=True)
    username: Indexed(str, unique=True)
    hashed_password: str
    is_active: bool = True
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
