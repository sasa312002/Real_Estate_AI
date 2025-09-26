import logging
from typing import Dict, List, Tuple
import random
import google.generativeai as genai
from app.core.config import settings

logger = logging.getLogger(__name__)

class PriceAgent:
    def __init__(self):
        # Initialize Gemini AI model for price reasoning
        if hasattr(settings, 'gemini_api_key') and settings.gemini_api_key:
            genai.configure(api_key=settings.gemini_api_key)
            try:
                # Try different model names to find one that works
                available_models = [
                    'gemini-1.5-flash',
                    'gemini-1.5-pro',
                    'gemini-2.0-flash',
                    'gemini-pro-latest',
                    'gemini-flash-latest'
                ]
                self.model = None
                for model_name in available_models:
                    try:
                        self.model = genai.GenerativeModel(model_name)
                        # Test the model with a simple request
                        test_response = self.model.generate_content("Hello")
                        logger.info(f"Successfully initialized Gemini model: {model_name}")
                        break
                    except Exception as e:
                        logger.debug(f"Failed to initialize model {model_name}: {e}")
                        continue
                
                if not self.model:
                    logger.warning("Could not initialize any Gemini model. Using fallback logic.")
                    
            except Exception as e:
                logger.error(f"Error initializing Gemini: {e}")
                self.model = None
        else:
            logger.warning("gemini_api_key not configured. Price estimation will use fallback logic.")
            self.model = None
        
    def estimate_price(self, features: Dict) -> Dict:
        """
        Estimate property price using AI reasoning for Sri Lankan market.
        Returns: {estimated_price, confidence, features_used, comps, currency}
        """
        try:
            # Use AI reasoning if available, otherwise fallback
            if self.model:
                return self._ai_estimate_price(features)
            else:
                return self._fallback_estimate_price(features)
            
        except Exception as e:
            logger.error(f"Error in price estimation: {e}")
            return {
                "estimated_price": 0,
                "confidence": 0.1,
                "features_used": [],
                "comps": [],
                "currency": "LKR",
                "error": str(e)
            }

    def _ai_estimate_price(self, features: Dict) -> Dict:
        """
        Use Gemini AI to reason about property price step by step
        """
        try:
            # Prepare property details for AI analysis
            property_details = self._format_property_details(features)
            
            # Create detailed prompt for AI reasoning
            prompt = f"""
You are a Real Estate Price Estimator Agent specialized in the Sri Lankan property market. 
Analyze the following property details step by step and provide a realistic price estimate in Sri Lankan Rupees (LKR).

Property Details:
{property_details}

Please analyze this property step by step:

1. **Location Analysis**: Consider the city/district and its market value, proximity to amenities, transportation, and economic factors.

2. **Property Characteristics**: Evaluate the size, bedrooms, bathrooms, property type, and how these affect market value.

3. **Age and Condition**: Consider the year built and how property age affects value in the Sri Lankan market.

4. **Market Context**: Consider current Sri Lankan real estate trends, economic conditions, and comparable properties.

5. **Special Factors**: Any unique features, land size, or other factors that would impact price.

Based on your analysis, provide:
- A realistic estimated price in LKR
- Your confidence level (0-1)
- Key factors that influenced your estimate
- Brief reasoning for your price determination

Format your response as a JSON object with these fields:
{{
    "estimated_price": <price_in_lkr>,
    "confidence": <0_to_1>,
    "reasoning": "<brief_explanation>",
    "key_factors": ["factor1", "factor2", "factor3"]
}}

Remember: Provide realistic Sri Lankan market prices. Houses typically range from LKR 5M-50M+, apartments from LKR 3M-30M+, depending on location and features.
"""

            # Get AI response
            response = self.model.generate_content(prompt)
            ai_result = self._parse_ai_response(response.text)
            
            # Generate comparable properties based on AI estimate
            comps = self._generate_comps(features, ai_result['estimated_price'])
            
            return {
                "estimated_price": ai_result['estimated_price'],
                "confidence": ai_result['confidence'],
                "features_used": list(features.keys()),
                "comps": comps,
                "currency": "LKR",
                "price_per_sqft": round(ai_result['estimated_price'] / features.get('area', 1000), 2),
                "reasoning": ai_result.get('reasoning', ''),
                "key_factors": ai_result.get('key_factors', [])
            }
            
        except Exception as e:
            logger.error(f"Error in AI price estimation: {e}")
            return self._fallback_estimate_price(features)

    def _format_property_details(self, features: Dict) -> str:
        """Format property features into readable text for AI analysis"""
        details = []
        
        # Basic property info
        if 'area' in features:
            details.append(f"Area: {features['area']} sq ft")
        if 'beds' in features:
            details.append(f"Bedrooms: {features['beds']}")
        if 'baths' in features:
            details.append(f"Bathrooms: {features['baths']}")
        if 'property_type' in features:
            details.append(f"Property Type: {features['property_type']}")
        
        # Location details
        if 'city' in features:
            details.append(f"City: {features['city']}")
        if 'district' in features:
            details.append(f"District: {features['district']}")
        
        # Additional features
        if 'year_built' in features:
            details.append(f"Year Built: {features['year_built']}")
        if 'land_size' in features and features['land_size'] > 0:
            details.append(f"Land Size: {features['land_size']} sq ft")
        if 'asking_price' in features and features['asking_price'] > 0:
            details.append(f"Asking Price: LKR {features['asking_price']:,}")
        
        return "\n".join(details)

    def _parse_ai_response(self, response_text: str) -> Dict:
        """Parse AI response and extract price estimation data"""
        try:
            # Try to extract JSON from the response
            import json
            import re
            
            # Look for JSON object in the response
            json_match = re.search(r'\{[^{}]*\}', response_text)
            if json_match:
                json_str = json_match.group()
                result = json.loads(json_str)
                
                # Validate and clean the result
                estimated_price = float(result.get('estimated_price', 0))
                confidence = max(0.1, min(0.95, float(result.get('confidence', 0.5))))
                
                return {
                    'estimated_price': estimated_price,
                    'confidence': confidence,
                    'reasoning': result.get('reasoning', ''),
                    'key_factors': result.get('key_factors', [])
                }
            else:
                # Fallback: try to extract price from text
                price_match = re.search(r'LKR\s*([\d,]+)', response_text)
                if price_match:
                    estimated_price = float(price_match.group(1).replace(',', ''))
                    return {
                        'estimated_price': estimated_price,
                        'confidence': 0.6,
                        'reasoning': 'Extracted from AI response text',
                        'key_factors': ['AI analysis']
                    }
                
        except Exception as e:
            logger.error(f"Error parsing AI response: {e}")
        
        # Ultimate fallback
        return {
            'estimated_price': 15000000,  # Default 15M LKR
            'confidence': 0.3,
            'reasoning': 'AI response parsing failed, using default estimate',
            'key_factors': ['Fallback estimate']
        }

    def _fallback_estimate_price(self, features: Dict) -> Dict:
        """
        Fallback price estimation when AI is not available
        Uses basic reasoning without hardcoded formulas
        """
        # Extract basic features
        area = features.get('area', 1000)
        city = features.get('city', 'Unknown')
        property_type = features.get('property_type', 'House')
        
        # Simple reasoning-based estimation ranges
        base_estimates = {
            'Colombo': {'House': (30000, 60000), 'Apartment': (25000, 45000)},
            'Kandy': {'House': (20000, 40000), 'Apartment': (18000, 35000)},
            'Galle': {'House': (18000, 35000), 'Apartment': (15000, 30000)},
            'default': {'House': (15000, 30000), 'Apartment': (12000, 25000)}
        }
        
        # Get price range for the city and property type
        city_data = base_estimates.get(city, base_estimates['default'])
        price_range = city_data.get(property_type, city_data.get('House', (15000, 30000)))
        
        # Estimate based on area and mid-range price per sqft
        avg_price_per_sqft = (price_range[0] + price_range[1]) / 2
        estimated_price = area * avg_price_per_sqft
        
        # Generate confidence and comparables
        confidence = self._calculate_confidence(features)
        comps = self._generate_comps(features, estimated_price)
        
        return {
            "estimated_price": round(estimated_price, 2),
            "confidence": confidence,
            "features_used": list(features.keys()),
            "comps": comps,
            "currency": "LKR",
            "price_per_sqft": round(estimated_price / area, 2),
            "reasoning": "Fallback estimation based on area and location",
            "key_factors": ["Area", "Location", "Property Type"]
        }

    def _calculate_confidence(self, features: Dict) -> float:
        """Calculate confidence based on feature completeness for Sri Lankan market"""
        required_features = ['area', 'beds', 'baths', 'year_built', 'city']
        present_features = sum(1 for f in required_features if f in features and features[f] is not None)
        
        # Bonus confidence for Sri Lankan specific features
        bonus_features = ['district', 'property_type', 'land_size']
        bonus_count = sum(1 for f in bonus_features if f in features and features[f] is not None)
        
        base_confidence = 0.5 + (present_features / len(required_features)) * 0.4
        bonus_confidence = min(0.1, bonus_count * 0.02)
        
        return min(0.95, base_confidence + bonus_confidence)
    
    def _generate_comps(self, features: Dict, estimated_price: float) -> List[Dict]:
        """Generate comparable properties for Sri Lankan market (mock data)"""
        comps = []
        city = features.get('city', 'Unknown')
        property_type = features.get('property_type', 'House')
        
        for i in range(3):
            # Generate realistic Sri Lankan prices
            comp_price = estimated_price * random.uniform(0.8, 1.2)
            comp_area = features.get('area', 1000) * random.uniform(0.9, 1.1)
            
            comps.append({
                "id": f"comp_{i+1}",
                "price": round(comp_price, 2),
                "price_lkr": f"LKR {round(comp_price):,}",
                "area": round(comp_area, 2),
                "beds": features.get('beds', 2),
                "baths": features.get('baths', 2),
                "city": city,
                "property_type": property_type,
                "distance": round(random.uniform(0.1, 2.0), 1),
                "sold_date": "2024-01-15",
                "price_per_sqft": round(comp_price / comp_area, 2) if comp_area > 0 else 0
            })
        return comps
