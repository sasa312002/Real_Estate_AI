from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from app.models.mongodb_models import User, Query, Response
from app.api.auth import get_current_user, PLAN_LIMITS
from app.agents.price_agent import PriceAgent
from app.agents.location_agent import LocationAgent
from app.agents.deal_agent import DealAgent
from app.agents.security_agent import SecurityAgent
from app.core.config import settings
from bson import ObjectId
import logging
from app.retrieval import store as retrieval_store
from app.nlp.pipeline import nlp_pipeline

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
    plan: Optional[str] = None
    analyses_remaining: Optional[int] = None
    # AI enriched fields
    location_factor: Optional[float] = None
    location_rationale: Optional[str] = None
    llm_explanation: Optional[str] = None
    deal_key_metrics: Optional[Dict[str, Any]] = None
    deal_risk_flags: Optional[List[str]] = None
    deal_recommendation: Optional[str] = None
    market_low: Optional[float] = None
    market_high: Optional[float] = None
    market_range_rationale: Optional[str] = None
    # NLP & retrieval enrichment
    entities: Optional[List[Dict[str, str]]] = None
    query_summary: Optional[str] = None
    retrieved_context: Optional[List[Dict[str, Any]]] = None

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
        # Enforce plan limits
        plan = getattr(current_user, 'plan', 'free')
        used = getattr(current_user, 'analyses_used', 0)
        limit = PLAN_LIMITS.get(plan, 0)
        if used >= limit:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"Analysis limit reached for {plan} plan. Upgrade to continue."
            )

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
            provenance=analysis_result['provenance'],
            market_low=analysis_result.get('market_low'),
            market_high=analysis_result.get('market_high'),
            market_range_rationale=analysis_result.get('market_range_rationale'),
            location_factor=analysis_result.get('location_factor'),
            location_rationale=analysis_result.get('location_rationale'),
            llm_explanation=analysis_result.get('llm_explanation'),
            deal_key_metrics=analysis_result.get('deal_key_metrics'),
            deal_risk_flags=analysis_result.get('deal_risk_flags'),
            deal_recommendation=analysis_result.get('deal_recommendation'),
            entities=analysis_result.get('entities'),
            query_summary=analysis_result.get('query_summary'),
            retrieved_context=analysis_result.get('retrieved_context')
        )
        
        await db_response.insert()
        
        # Filter output for security
        filtered_result = security_agent.filter_output(analysis_result)
        
        # Increment usage
        try:
            current_user.analyses_used = used + 1
            await current_user.save()
        except Exception as e:
            logger.error(f"Failed to increment analyses_used: {e}")

        remaining = max(limit - current_user.analyses_used, 0)

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
            price_per_sqft=filtered_result.get('price_per_sqft'),
            plan=plan,
            analyses_remaining=remaining,
            location_factor=filtered_result.get('location_factor'),
            location_rationale=filtered_result.get('location_rationale'),
            llm_explanation=filtered_result.get('llm_explanation'),
            deal_key_metrics=filtered_result.get('deal_key_metrics'),
            deal_risk_flags=filtered_result.get('deal_risk_flags'),
            deal_recommendation=filtered_result.get('deal_recommendation'),
            market_low=filtered_result.get('market_low'),
            market_high=filtered_result.get('market_high'),
            market_range_rationale=filtered_result.get('market_range_rationale'),
            entities=filtered_result.get('entities'),
            query_summary=filtered_result.get('query_summary'),
            retrieved_context=filtered_result.get('retrieved_context')
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

@router.get("/gemini/health")
async def gemini_health():
    """Lightweight health check for Gemini-driven analysis."""
    return {
        'strict_mode': settings.strict_gemini,
        'price_agent_llm': bool(price_agent.llm),
        'deal_agent_llm': bool(deal_agent.llm),
        'location_agent_llm': bool(location_agent.llm),
        'api_key_loaded': bool(settings.gemini_api_key),
    }

@router.delete("/history/{query_id}")
async def delete_query_history(
    query_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a user's query history item and its associated response.

    Returns a simple status object on success. If the query does not exist or
    does not belong to the user, appropriate HTTP errors are raised.
    """
    try:
        if not ObjectId.is_valid(query_id):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid query id")

        query = await Query.get(ObjectId(query_id))
        if not query:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Query not found")
        if query.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this query")

        # Delete associated response if present
        response = await Response.find_one({"query_id": query.id})
        if response:
            await response.delete()

        await query.delete()
        return {"status": "deleted", "id": query_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting query history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error deleting query history"
        )

@router.get("/details/{query_id}", response_model=PropertyResponse)
async def get_query_details(
    query_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get full analysis details for a user's past query"""
    try:
        # Validate ObjectId
        if not ObjectId.is_valid(query_id):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid query id")
        
        # Load query and verify ownership
        query = await Query.get(ObjectId(query_id))
        if not query:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Query not found")
        if query.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this query")
        
        # Load response
        response = await Response.find_one({"query_id": query.id})
        if not response:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found for this query")
        
        # Build response payload
        provenance = response.provenance or []
        plan = getattr(current_user, 'plan', 'free')
        limit = PLAN_LIMITS.get(plan, 0)
        used = getattr(current_user, 'analyses_used', 0)
        remaining = max(limit - used, 0)
        return PropertyResponse(
            estimated_price=response.estimated_price or 0,
            location_score=response.location_score or 0,
            deal_verdict=response.deal_verdict,
            why=response.why,
            provenance=provenance,
            confidence=response.confidence or 0,
            query_id=str(query.id),
            response_id=str(response.id),
            land_details=None,
            currency="LKR",
            price_per_sqft=None,
            plan=plan,
            analyses_remaining=remaining
            ,market_low=None
            ,market_high=None
            ,market_range_rationale=None
            ,entities=response.entities
            ,query_summary=response.query_summary
            ,retrieved_context=response.retrieved_context
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching query details: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error fetching query details"
        )

async def _run_analysis_pipeline(features: Dict[str, Any], query_text: str) -> Dict[str, Any]:
    """Run the complete AI analysis pipeline including land details (AI-first)."""
    try:
        # 1. Retrieval augmentation (lexical lightweight)
        retrieved = retrieval_store.search(query_text, top_k=4)

        # 2. AI-first price estimation (internal fallback if LLM unavailable)
        price_result = price_agent.estimate_price(features)
        estimated_price = price_result['estimated_price']
        price_per_sqft = price_result.get('price_per_sqft', 0)
        provenance: List[Dict[str, Any]] = []

        # 3. Location analysis (AI-first)
        location_result = location_agent.analyze_location(
            features.get('lat'),
            features.get('lon'),
            features.get('city'),
            features.get('district')
        )
        location_score = location_result['score']
        provenance.extend(location_result.get('provenance', []))

        # 4. Deal evaluation (AI-first)
        asking_price = features.get('asking_price', 0)
        deal_result = deal_agent.evaluate_deal(asking_price, estimated_price, location_score)

        # 5. Land details analysis using Gemini AI (fallback inside if not available)
        land_details = deal_agent.analyze_land_details(
            features, location_result, asking_price, estimated_price
        )

        # 6. NLP enrichment (entities + summary from assembled rationale text)
        combined_text_blocks: List[str] = []
        if deal_result.get('why'):
            combined_text_blocks.append(deal_result['why'])
        if price_result.get('location_rationale'):
            combined_text_blocks.append(price_result['location_rationale'])
        if deal_result.get('recommendation'):
            combined_text_blocks.append(deal_result['recommendation'])
        if land_details and isinstance(land_details, dict):
            land_analysis_text = land_details.get('land_analysis') or ''
            if land_analysis_text:
                combined_text_blocks.append(land_analysis_text)
        aggregated_text = "\n".join(combined_text_blocks).strip()
        entities = nlp_pipeline.extract_entities(aggregated_text) if aggregated_text else []
        query_summary = nlp_pipeline.summarize(aggregated_text) if aggregated_text else ''

        result = {
            'estimated_price': estimated_price,
            'location_score': location_score,
            'deal_verdict': deal_result['verdict'],
            'why': deal_result['why'],
            'confidence': min(price_result.get('confidence', 0.6), deal_result.get('confidence', 0.6)),
            'provenance': provenance,
            'land_details': land_details,
            'currency': 'LKR',
            'price_per_sqft': price_per_sqft,
            'location_factor': price_result.get('location_factor'),
            'location_rationale': price_result.get('location_rationale'),
            'deal_key_metrics': deal_result.get('key_metrics'),
            'deal_risk_flags': deal_result.get('risk_flags'),
            'deal_recommendation': deal_result.get('recommendation'),
            'entities': entities,
            'query_summary': query_summary,
            'retrieved_context': retrieved
        }

        # Include market range from price agent if present or synthesize fallback
        market_low = price_result.get('market_low')
        market_high = price_result.get('market_high')
        if market_low and market_high:
            # Ensure ordering
            if market_low > market_high:
                market_low, market_high = market_high, market_low
            result['market_low'] = round(float(market_low), 2)
            result['market_high'] = round(float(market_high), 2)
            result['market_range_rationale'] = price_result.get('market_range_rationale')
        else:
            # Fallback ±10%
            result['market_low'] = round(estimated_price * 0.9, 2)
            result['market_high'] = round(estimated_price * 1.1, 2)
            result['market_range_rationale'] = 'Fallback ±10% band due to missing explicit range'

        # Optional deeper LLM explanation (kept separate so UI can show it)
        if asking_price > 0 and estimated_price > 0:
            llm_explanation = deal_agent.llm_explain(
                asking_price, estimated_price, location_score, features, location_result
            )
            if llm_explanation:
                result['llm_explanation'] = llm_explanation
        # Successful pipeline completion
        return result

    except Exception as e:
        logger.error(f"Error in analysis pipeline: {e}")
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
