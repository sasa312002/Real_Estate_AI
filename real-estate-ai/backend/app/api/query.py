from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from app.models.mongodb_models import User, Query, Response
from app.api.auth import get_current_user, PLAN_LIMITS
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
    tags: Optional[List[str]] = None
    request_id: Optional[str] = None  # Add unique request identifier to prevent caching

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
    analyze_location: Optional[Dict[str, Any]] = None

class QueryHistory(BaseModel):
    id: str
    query_text: str
    city: Optional[str] = None
    tags: Optional[List[str]] = None
    lat: Optional[float] = None
    lon: Optional[float] = None
    beds: Optional[int] = None
    baths: Optional[int] = None
    area: Optional[float] = None
    year_built: Optional[int] = None
    asking_price: Optional[float] = None
    created_at: str
    has_response: bool

class LocationRequest(BaseModel):
    lat: float
    lon: float
    city: Optional[str] = None
    district: Optional[str] = None
    request_id: Optional[str] = None  # Add unique request identifier to prevent caching

class LocationAmenity(BaseModel):
    name: str
    lat: float
    lon: float
    distance_km: float

class LocationAnalysisResponse(BaseModel):
    score: float
    summary: str
    bullets: List[str]
    provenance: List[Dict[str, Any]]
    risk: Dict[str, Any]
    nearby: Dict[str, List[LocationAmenity]]
    facility_counts: Optional[Dict[str, int]] = None
    facility_summary: Optional[str] = None

@router.post("/query", response_model=PropertyResponse)
async def analyze_property(
    property_query: PropertyQuery,
    current_user: User = Depends(get_current_user)
):
    """Analyze a property using AI agents including land details"""
    try:
        # Log request for debugging
        request_id = property_query.request_id or 'no-id'
        logger.info(f"Processing property analysis request_id={request_id}, user={current_user.username}, lat={property_query.features.get('lat')}, lon={property_query.features.get('lon')}")
        
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
            tags=property_query.tags or [],
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
        analysis_result = await _run_analysis_pipeline(
            sanitized_features, sanitized_query, property_query.tags or []
        )
        
        # Store response in database
        db_response = Response(
            query_id=db_query.id,
            estimated_price=analysis_result['estimated_price'],
            location_score=analysis_result['location_score'],
            analyze_location=analysis_result.get('analyze_location'),
            deal_verdict=analysis_result['deal_verdict'],
            why=analysis_result['why'],
            confidence=analysis_result['confidence'],
            provenance=analysis_result['provenance']
        )
        
        await db_response.insert()
        
        # Filter output for security
        filtered_result = security_agent.filter_output(analysis_result)
        
        # Increment usage
        try:
            current_user.analyses_used = used + 1
            # Check if limit is now exhausted and update purchase eligibility
            if current_user.analyses_used >= limit:
                current_user.can_purchase_new_plan = True
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
            analyses_remaining=remaining
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in property analysis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during property analysis"
        )

@router.post("/analyze_location", response_model=LocationAnalysisResponse)
async def analyze_location_endpoint(
    req: LocationRequest,
    current_user: User = Depends(get_current_user)
):
    """Analyze a location by coordinates, return risk and nearby amenities.
    Access limited to Standard and Premium users.
    """
    try:
        plan = getattr(current_user, 'plan', 'free')
        if plan not in ("standard", "premium"):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Location analysis available for Standard and Premium plans only")

        # Base location analysis
        base = location_agent.analyze_location(req.lat, req.lon, req.city, req.district)
        # Nearby amenities
        nearby = await location_agent.get_nearby_amenities(req.lat, req.lon)
        # Risk via LLM (fallbacks internally)
        risk = location_agent.llm_analyze_location_risk(req.lat, req.lon, req.city, req.district, nearby)
        # Facility group counts summary under 1km
        counts_summary = location_agent.summarize_facility_counts(nearby, radius_km=1.0)

        # Do not persist location analysis to history (as per user requirement)

        return LocationAnalysisResponse(
            score=base.get('score', 0.5),
            summary=base.get('summary', ''),
            bullets=base.get('bullets', []),
            provenance=base.get('provenance', []),
            risk=risk,
            nearby=nearby,
            facility_counts=counts_summary.get('counts'),
            facility_summary=counts_summary.get('summary')
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in analyze_location_endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during location analysis")

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
                city=query.city,
                tags=query.tags,
                lat=query.lat,
                lon=query.lon,
                beds=query.beds,
                baths=query.baths,
                area=query.area,
                year_built=query.year_built,
                asking_price=query.asking_price,
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
            analyze_location=getattr(response, 'analyze_location', None),
            query_id=str(query.id),
            response_id=str(response.id),
            land_details=None,
            currency="LKR",
            price_per_sqft=None,
            plan=plan,
            analyses_remaining=remaining
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching query details: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error fetching query details"
        )

@router.get("/suggest_tags")
async def suggest_tags(q: str) -> Dict[str, Any]:
    """Suggest semantic property tags based on partial description text.
    Simple keyword-based matcher to avoid LLM latency/cost.
    Returns { tags: [ { tag, category, weight } ] }
    """
    try:
        text = (q or "").lower()
        tag_catalog = {
            'amenity': {
                'swimming pool': ['pool'],
                'solar power': ['solar','pv','photovoltaic'],
                'backup generator': ['generator','backup power'],
                'parking': ['parking','garage','car port','carport'],
                'rooftop terrace': ['rooftop','roof terrace'],
                'garden': ['garden','landscaped'],
                'security system': ['cctv','security','guarded','24/7 security'],
                'lift': ['elevator','lift'],
                'air conditioning': ['air conditioning','a/c','ac unit']
            },
            'location': {
                'sea view': ['sea view','ocean view','beachfront','beach front','sea facing'],
                'lake view': ['lake view','lakefront'],
                'mountain view': ['mountain view','hill view'],
                'near school': ['near school','walking distance school','close to school'],
                'near hospital': ['near hospital','close hospital'],
                'public transport': ['bus stand','railway','train station','public transport']
            },
            'condition': {
                'newly renovated': ['renovated','newly renovated','recently renovated'],
                'needs renovation': ['needs renovation','fixer upper','needs work'],
                'under construction': ['under construction','construction ongoing']
            },
            'sustainability': {
                'rainwater harvesting': ['rainwater','rain water'],
                'energy efficient': ['energy efficient','efficient appliances'],
                'green building': ['green building','eco friendly','eco-friendly']
            }
        }
        suggestions: List[Dict[str, Any]] = []
        for category, tags in tag_catalog.items():
            for tag_name, keywords in tags.items():
                for kw in keywords:
                    if kw in text:
                        suggestions.append({
                            'tag': tag_name,
                            'category': category,
                            'weight': 1.0
                        })
                        break
        # De-duplicate preserving order
        seen = set()
        deduped = []
        for s in suggestions:
            if s['tag'] not in seen:
                deduped.append(s)
                seen.add(s['tag'])
        return { 'tags': deduped }
    except Exception as e:
        logger.error(f"Tag suggestion error: {e}")
        return { 'tags': [] }

async def _run_analysis_pipeline(features: Dict[str, Any], query_text: str, tags: List[str]) -> Dict[str, Any]:
    """Run the complete AI analysis pipeline including land details"""
    try:
        # 1. Price estimation (heuristic)
        price_result = price_agent.estimate_price(features)
        estimated_price = price_result['estimated_price']
        price_per_sqft = price_result.get('price_per_sqft', 0)
        provenance: List[Dict[str, Any]] = []

        # Apply simple tag-driven adjustments (amenities premium, condition)
        tag_adjustment_factor = 1.0
        positive_tags = {
            'swimming pool': 0.04,
            'solar power': 0.03,
            'sea view': 0.06,
            'mountain view': 0.02,
            'lake view': 0.03,
            'rooftop terrace': 0.02,
            'garden': 0.015,
            'security system': 0.015,
            'lift': 0.015,
            'air conditioning': 0.01,
            'rainwater harvesting': 0.005,
            'energy efficient': 0.01,
            'green building': 0.02
        }
        negative_tags = {
            'needs renovation': -0.07,
            'under construction': -0.05
        }
        for t in tags:
            if t in positive_tags:
                tag_adjustment_factor += positive_tags[t]
            if t in negative_tags:
                tag_adjustment_factor += negative_tags[t]
        if tag_adjustment_factor != 1.0:
            original_price = estimated_price
            estimated_price = round(estimated_price * tag_adjustment_factor, 2)
            provenance.append({
                'doc_id': 'tag_adjustment',
                'snippet': f'Amenities/condition tags adjusted price by {(tag_adjustment_factor-1)*100:.1f}% (from {original_price} to {estimated_price}).',
                'link': ''
            })
        
        # 1b. Try Gemini-backed estimate if available; blend conservatively
        llm_price = deal_agent.llm_estimate_market_value(features)
        if llm_price and isinstance(llm_price, dict) and llm_price.get('estimated_price', 0) > 0:
            # Blend: average weighted by heuristic confidence
            heuristic_conf = price_result.get('confidence', 0.6)
            blended = (heuristic_conf * estimated_price) + ((1 - heuristic_conf) * llm_price['estimated_price'])
            estimated_price = round(blended, 2)
            if features.get('area'):
                price_per_sqft = round(estimated_price / (features.get('area') or 1), 2)
            # Merge provenance
            provenance.extend(llm_price.get('provenance', []))
        
        # 2. Location analysis
        location_result = location_agent.analyze_location(
            features.get('lat'),
            features.get('lon'),
            features.get('city'),
            features.get('district')
        )
        location_score = location_result['score']
        provenance.extend(location_result.get('provenance', []))
        # Also fetch nearby amenities and risk to attach as analyze_location summary
        try:
            nearby = await location_agent.get_nearby_amenities(features.get('lat'), features.get('lon')) if features.get('lat') and features.get('lon') else {}
            risk = location_agent.llm_analyze_location_risk(features.get('lat'), features.get('lon'), features.get('city'), features.get('district'), nearby)
            counts_summary = location_agent.summarize_facility_counts(nearby, radius_km=1.0) if nearby else {'counts': None, 'summary': None}
            analyze_location = {
                'score': location_result.get('score'),
                'summary': location_result.get('summary'),
                'bullets': location_result.get('bullets'),
                'provenance': location_result.get('provenance'),
                'risk': risk,
                'nearby': nearby,
                'facility_counts': counts_summary.get('counts'),
                'facility_summary': counts_summary.get('summary')
            }
        except Exception as e:
            analyze_location = None
            logger.warning(f"Failed to attach analyze_location in pipeline: {e}")
        
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
            'analyze_location': analyze_location,
            'deal_verdict': deal_result['verdict'],
            'why': deal_result['why'],
            'confidence': min(price_result['confidence'], deal_result['confidence']),
            'provenance': provenance,
            'land_details': land_details,
            'currency': 'LKR',
            'price_per_sqft': price_per_sqft
        }
        
        # 6. Try to get LLM explanation if available
        if asking_price > 0 and estimated_price > 0:
            # Include tags in features copy for LLM context
            features_with_tags = dict(features)
            if tags:
                features_with_tags['tags'] = tags
            llm_explanation = deal_agent.llm_explain(
                asking_price, estimated_price, location_score, features_with_tags, location_result
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
