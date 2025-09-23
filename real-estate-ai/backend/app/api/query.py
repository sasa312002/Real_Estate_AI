from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from app.models.mongodb_models import User, Query, Response
from app.api.auth import get_current_user
from app.agents.price_agent import PriceAgent
from app.agents.location_agent import LocationAgent
from app.agents.deal_agent import DealAgent
from app.agents.security_agent import SecurityAgent
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/property", tags=["property analysis"])
security_agent = SecurityAgent()
price_agent = PriceAgent()
location_agent = LocationAgent()
deal_agent = DealAgent()

# Pydantic models
class PropertyQuery(BaseModel):
    query: str
    features: Dict[str, Any]

class PropertyResponse(BaseModel):
    estimated_price: float
    location_score: float
    deal_verdict: str
    why: str
    provenance: List[Dict[str, Any]]
    confidence: float
    query_id: str
    response_id: str
    land_details: Optional[Dict[str, Any]] = None
    currency: str = "LKR"
    price_per_sqft: Optional[float] = None

class QueryHistory(BaseModel):
    id: str
    query_text: str
    created_at: str
    has_response: bool

@router.post("/query", response_model=PropertyResponse)
async def analyze_property(
    property_query: PropertyQuery,
    current_user: User = Depends(get_current_user)
):
    """Analyze a property using AI agents including land details"""
    try:
        # Security validation and sanitization
        validation_result = security_agent.validate_query_features(property_query.features)
        if not validation_result['is_valid']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid features: {'; '.join(validation_result['errors'])}"
            )
        
        sanitized_features = validation_result['sanitized_features']
        sanitized_query = security_agent.sanitize_input(property_query.query)
        
        # Store query in database
        db_query = Query(
            user_id=current_user.id,
            query_text=sanitized_query,
            city=sanitized_features.get('city'),
            lat=sanitized_features.get('lat'),
            lon=sanitized_features.get('lon'),
            beds=sanitized_features.get('beds'),
            baths=sanitized_features.get('baths'),
            area=sanitized_features.get('area'),
            year_built=sanitized_features.get('year_built'),
            asking_price=sanitized_features.get('asking_price')
        )
        
        await db_query.insert()
        
        # Run AI analysis pipeline including land details
        analysis_result = await _run_analysis_pipeline(sanitized_features, sanitized_query)
        
        # Store response in database
        db_response = Response(
            query_id=db_query.id,
            estimated_price=analysis_result['estimated_price'],
            location_score=analysis_result['location_score'],
            deal_verdict=analysis_result['deal_verdict'],
            why=analysis_result['why'],
            confidence=analysis_result['confidence'],
            provenance=analysis_result['provenance']
        )
        
        await db_response.insert()
        
        # Filter output for security
        filtered_result = security_agent.filter_output(analysis_result)
        
        return PropertyResponse(
            estimated_price=filtered_result['estimated_price'],
            location_score=filtered_result['location_score'],
            deal_verdict=filtered_result['deal_verdict'],
            why=filtered_result['why'],
            provenance=filtered_result['provenance'],
            confidence=filtered_result['confidence'],
            query_id=str(db_query.id),
            response_id=str(db_response.id),
            land_details=filtered_result.get('land_details'),
            currency=filtered_result.get('currency', 'LKR'),
            price_per_sqft=filtered_result.get('price_per_sqft')
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in property analysis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during property analysis"
        )

@router.get("/history", response_model=List[QueryHistory])
async def get_query_history(
    current_user: User = Depends(get_current_user),
    limit: int = 10
):
    """Get user's query history"""
    try:
        # Get user's queries
        queries = await Query.find(
            {"user_id": current_user.id}
        ).sort([("created_at", -1)]).limit(limit).to_list()
        
        history = []
        for query in queries:
            # Check if query has a response
            response = await Response.find_one({"query_id": query.id})
            has_response = response is not None
            
            history.append(QueryHistory(
                id=str(query.id),
                query_text=query.query_text,
                created_at=query.created_at.isoformat(),
                has_response=has_response
            ))
        
        return history
        
    except Exception as e:
        logger.error(f"Error fetching query history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error fetching query history"
        )

async def _run_analysis_pipeline(features: Dict[str, Any], query_text: str) -> Dict[str, Any]:
    """Run the complete AI analysis pipeline including land details"""
    try:
        # 1. Price estimation
        price_result = price_agent.estimate_price(features)
        estimated_price = price_result['estimated_price']
        
        # 2. Location analysis
        location_result = location_agent.analyze_location(
            features.get('lat'),
            features.get('lon'),
            features.get('city'),
            features.get('district')
        )
        location_score = location_result['score']
        
        # 3. Deal evaluation
        asking_price = features.get('asking_price', 0)
        deal_result = deal_agent.evaluate_deal(asking_price, estimated_price, location_score)
        
        # 4. Land details analysis using Gemini AI
        land_details = deal_agent.analyze_land_details(
            features, location_result, asking_price, estimated_price
        )
        
        # 5. Combine results
        result = {
            'estimated_price': estimated_price,
            'location_score': location_score,
            'deal_verdict': deal_result['verdict'],
            'why': deal_result['why'],
            'confidence': min(price_result['confidence'], deal_result['confidence']),
            'provenance': location_result['provenance'],
            'land_details': land_details,
            'currency': 'LKR',
            'price_per_sqft': price_result.get('price_per_sqft', 0)
        }
        
        # 6. Try to get LLM explanation if available
        if asking_price > 0 and estimated_price > 0:
            llm_explanation = deal_agent.llm_explain(
                asking_price, estimated_price, location_score, features, location_result
            )
            if llm_explanation:
                result['llm_explanation'] = llm_explanation
        
        return result
        
    except Exception as e:
        logger.error(f"Error in analysis pipeline: {e}")
        # Return fallback result
        return {
            'estimated_price': features.get('asking_price', 0),
            'location_score': 0.5,
            'deal_verdict': 'Fair',
            'why': 'Analysis incomplete due to system error',
            'confidence': 0.3,
            'provenance': [],
            'land_details': {
                'land_analysis': 'Analysis unavailable due to error',
                'development_potential': 'Unknown',
                'land_use_opportunities': ['Residential', 'Commercial']
            },
            'error': str(e)
        }
