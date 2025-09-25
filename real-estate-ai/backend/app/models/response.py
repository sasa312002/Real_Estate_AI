from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base

class Response(Base):
    __tablename__ = "responses"
    
    id = Column(Integer, primary_key=True, index=True)
    query_id = Column(Integer, ForeignKey("queries.id"), nullable=False)
    estimated_price = Column(Float, nullable=True)
    location_score = Column(Float, nullable=True)
    deal_verdict = Column(String, nullable=False)  # "Good Deal", "Fair", "Overpriced"
    why = Column(Text, nullable=False)
    confidence = Column(Float, nullable=False)
    provenance = Column(JSON, nullable=True)  # Store as JSON array
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    query = relationship("Query", back_populates="responses")
    feedback = relationship("Feedback", back_populates="response")

