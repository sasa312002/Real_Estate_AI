import logging
from typing import Dict, List, Optional
import google.generativeai as genai
from app.core.config import settings
import json

logger = logging.getLogger(__name__)

class DealAgent:
    def __init__(self):
        self.llm = None
        self._initialize_llm()
        
    def _initialize_llm(self):
        """Initialize Gemini AI if API key is available"""
        try:
            if settings.gemini_api_key:
                genai.configure(api_key=settings.gemini_api_key)
                self.llm = genai.GenerativeModel('gemini-pro')
                logger.info("Gemini AI initialized successfully")
            else:
                logger.warning("No Gemini API key provided, using fallback logic")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini AI: {e}")
            self.llm = None
    
    def evaluate_deal(self, asking_price: float, estimated_price: float, location_score: float) -> Dict:
        """
        Evaluate whether a property deal is Good/Fair/Overpriced.
        Returns: {verdict, why, confidence}
        """
        try:
            # Calculate price ratio
            price_ratio = asking_price / estimated_price if estimated_price > 0 else 1.0
            
            # Basic rule-based evaluation
            if price_ratio <= 0.85:
                verdict = "Good Deal"
                confidence = 0.8
            elif price_ratio <= 1.15:
                verdict = "Fair"
                confidence = 0.7
            else:
                verdict = "Overpriced"
                confidence = 0.8
            
            # Adjust confidence based on location score
            if location_score > 0.8:
                confidence += 0.1
            elif location_score < 0.4:
                confidence -= 0.1
            
            confidence = max(0.1, min(0.95, confidence))
            
            # Generate explanation
            why = self._generate_explanation(asking_price, estimated_price, location_score, verdict, price_ratio)
            
            return {
                "verdict": verdict,
                "why": why,
                "confidence": round(confidence, 2)
            }
            
        except Exception as e:
            logger.error(f"Error in deal evaluation: {e}")
            return {
                "verdict": "Fair",
                "why": "Unable to evaluate deal due to insufficient data",
                "confidence": 0.3,
                "error": str(e)
            }
    
    def analyze_land_details(self, features: Dict, location_analysis: Dict, 
                           asking_price: float, estimated_price: float) -> Dict:
        """
        Use Gemini AI to analyze land details and provide comprehensive insights.
        Returns: Detailed land analysis including development potential, land use, etc.
        """
        if not self.llm:
            return self._fallback_land_analysis(features, location_analysis)
            
        try:
            prompt = self._build_land_analysis_prompt(features, location_analysis, asking_price, estimated_price)
            response = self.llm.generate_content(prompt)
            
            # Try to parse JSON response
            try:
                land_analysis = json.loads(response.text)
                return land_analysis
            except json.JSONDecodeError:
                # If JSON parsing fails, return structured text
                return {
                    "land_analysis": response.text,
                    "parsing_error": "Response was not in expected JSON format"
                }
                
        except Exception as e:
            logger.error(f"Error in land details analysis: {e}")
            return self._fallback_land_analysis(features, location_analysis)
    
    def llm_explain(self, asking_price: float, estimated_price: float, location_score: float, 
                    features: Dict, location_analysis: Dict) -> Optional[str]:
        """
        Use Gemini AI to generate detailed explanation.
        Returns: JSON explanation string or None if LLM unavailable
        """
        if not self.llm:
            return None
            
        try:
            prompt = self._build_explanation_prompt(
                asking_price, estimated_price, location_score, features, location_analysis
            )
            
            response = self.llm.generate_content(prompt)
            return response.text
            
        except Exception as e:
            logger.error(f"Error in LLM explanation: {e}")
            return None
    
    def llm_estimate_market_value(self, features: Dict) -> Optional[Dict]:
        """Ask Gemini to estimate market value and return JSON with provenance when possible."""
        if not self.llm:
            return None
        
        try:
            prompt = f"""
            You are a Sri Lankan real estate analyst. Estimate a realistic market value for the following property.
            Do NOT invent data; if unsure, make a conservative estimate and provide rationale.
            If you can infer price per square foot, include it. Include optional links for sources or typical market references.

            Property features (JSON): {json.dumps(features)}

            Return STRICT JSON with keys:
            {{
              "estimated_price": number,              // in LKR
              "price_per_sqft": number,               // in LKR
              "provenance": [                         // optional list of sources or market references
                {{ "title": string, "link": string, "snippet": string }}
              ],
              "notes": string                         // brief rationale
            }}
            """
            response = self.llm.generate_content(prompt)
            data = None
            try:
                data = json.loads(response.text)
            except json.JSONDecodeError:
                # Attempt to extract JSON block heuristically
                text = response.text
                start = text.find('{')
                end = text.rfind('}')
                if start != -1 and end != -1 and end > start:
                    try:
                        data = json.loads(text[start:end+1])
                    except Exception:
                        data = None
            
            if not isinstance(data, dict):
                return None
            # Validate minimal fields
            if 'estimated_price' not in data:
                return None
            if 'price_per_sqft' not in data and features.get('area'):
                area = features.get('area') or 0
                if area > 0:
                    data['price_per_sqft'] = data['estimated_price'] / area
            # Normalize provenance
            prov = data.get('provenance') or []
            if isinstance(prov, list):
                norm = []
                for p in prov:
                    if isinstance(p, dict):
                        norm.append({
                            'doc_id': p.get('title') or p.get('name') or 'Market Reference',
                            'link': p.get('link') or p.get('url') or '',
                            'snippet': p.get('snippet') or ''
                        })
                data['provenance'] = norm
            else:
                data['provenance'] = []
            return data
        except Exception as e:
            logger.error(f"Error in llm_estimate_market_value: {e}")
            return None
    
    def _fallback_land_analysis(self, features: Dict, location_analysis: Dict) -> Dict:
        """Fallback land analysis when AI is not available"""
        land_size = features.get('land_size', 0)
        property_type = features.get('property_type', 'House')
        city = features.get('city', 'Unknown')
        
        return {
            "land_analysis": "AI analysis unavailable",
            "land_size": land_size,
            "property_type": property_type,
            "city": city,
            "development_potential": "Basic analysis only",
            "land_use_opportunities": ["Residential", "Commercial"],
            "restrictions": "Check local regulations",
            "investment_potential": "Moderate"
        }
    
    def _generate_explanation(self, asking_price: float, estimated_price: float, 
                             location_score: float, verdict: str, price_ratio: float) -> str:
        """Generate human-readable explanation for the deal verdict"""
        
        explanations = {
            "Good Deal": [
                f"This property is priced {((1 - price_ratio) * 100):.1f}% below the estimated market value.",
                f"With an asking price of LKR {asking_price:,.0f} vs. estimated value of LKR {estimated_price:,.0f}, this represents excellent value.",
                f"The location score of {location_score:.1%} indicates a desirable area, making this deal even more attractive."
            ],
            "Fair": [
                f"This property is priced close to the estimated market value (ratio: {price_ratio:.2f}).",
                f"The asking price of LKR {asking_price:,.0f} aligns well with the estimated value of LKR {estimated_price:,.0f}.",
                f"Given the location score of {location_score:.1%}, this pricing appears reasonable for the market."
            ],
            "Overpriced": [
                f"This property is priced {((price_ratio - 1) * 100):.1f}% above the estimated market value.",
                f"With an asking price of LKR {asking_price:,.0f} vs. estimated value of LKR {estimated_price:,.0f}, this may be overvalued.",
                f"Even with a location score of {location_score:.1%}, the price premium seems excessive."
            ]
        }
        
        return " ".join(explanations.get(verdict, ["Unable to provide explanation."]))
    
    def _build_land_analysis_prompt(self, features: Dict, location_analysis: Dict, 
                                   asking_price: float, estimated_price: float) -> str:
        """Build prompt for Gemini AI land analysis"""
        
        land_size = features.get('land_size', 0)
        property_type = features.get('property_type', 'House')
        city = features.get('city', 'Unknown')
        district = features.get('district', '')
        
        prompt = f"""
        You are a Sri Lankan real estate expert specializing in land analysis and development potential. 
        Please provide a comprehensive analysis of this land/property for investment and development purposes.

        Property Details:
        - Land Size: {land_size} sq ft
        - Property Type: {property_type}
        - City: {city}
        - District: {district}
        - Asking Price: LKR {asking_price:,.0f}
        - Estimated Value: LKR {estimated_price:,.0f}
        - Features: {features}
        - Location Analysis: {location_analysis}

        Please provide your analysis in the following JSON format:
        {{
            "land_analysis": "Comprehensive analysis of the land and its potential",
            "land_size_analysis": "Analysis of land size and its implications",
            "development_potential": "High|Medium|Low - with detailed reasoning",
            "land_use_opportunities": ["Residential", "Commercial", "Mixed-use", "Agricultural", "Tourism"],
            "development_restrictions": ["Zoning restrictions", "Environmental considerations", "Heritage constraints"],
            "infrastructure_analysis": "Analysis of current and planned infrastructure",
            "market_demand": "Current and future market demand for this type of land",
            "investment_timeline": "Recommended investment timeline (short/medium/long term)",
            "development_cost_estimate": "Estimated development costs per sq ft",
            "roi_projection": "Expected return on investment percentage",
            "risk_factors": ["Risk factor 1", "Risk factor 2", "Risk factor 3"],
            "mitigation_strategies": ["Strategy 1", "Strategy 2", "Strategy 3"],
            "sri_lanka_specific_factors": "Local market conditions, regulations, and opportunities",
            "recommendation": "Specific recommendation for this land investment",
            "next_steps": ["Step 1", "Step 2", "Step 3"]
        }}

        Focus on Sri Lankan context:
        1. Local zoning regulations and UDA guidelines
        2. Tourism potential for coastal/beach areas
        3. Agricultural opportunities for tea estates and farming
        4. Heritage considerations for historical areas
        5. Infrastructure development projects in the area
        6. Local market trends and foreign investment climate
        7. Environmental and sustainability factors
        8. Cultural and community considerations

        Provide specific, actionable insights that would help a Sri Lankan or foreign investor make informed decisions.
        Consider both immediate and long-term development potential.
        """
        
        return prompt
    
    def _build_explanation_prompt(self, asking_price: float, estimated_price: float, 
                                 location_score: float, features: Dict, location_analysis: Dict) -> str:
        """Build prompt for Gemini AI explanation"""
        
        prompt = f"""
        You are a Sri Lankan real estate expert analyzing a property deal. Please provide a detailed, professional explanation of whether this property represents a good deal, fair value, or is overpriced.

        Property Details:
        - Asking Price: LKR {asking_price:,.0f}
        - Estimated Market Value: LKR {estimated_price:,.0f}
        - Location Score: {location_score:.1%}
        - Features: {features}
        - Location Analysis: {location_analysis}

        Please provide your analysis in the following JSON format:
        {{
            "verdict": "Good Deal|Fair|Overpriced",
            "explanation": "Detailed explanation of your reasoning",
            "key_factors": ["factor1", "factor2", "factor3"],
            "recommendation": "Specific recommendation for the buyer",
            "risk_assessment": "Low|Medium|High",
            "sri_lanka_context": "Local market insights and cultural considerations"
        }}

        Focus on:
        1. Price-to-value ratio analysis in LKR
        2. Location considerations specific to Sri Lanka
        3. Local market context and trends
        4. Specific risks and opportunities
        5. Actionable advice for Sri Lankan market
        6. Cultural and tourism factors if applicable

        Keep the explanation professional, data-driven, and helpful for decision-making in the Sri Lankan context.
        """
        
        return prompt
