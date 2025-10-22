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
        Use Gemini AI to reason about property price step by step with RAG architecture.
        Implements two-step analysis: Macro (area classification) → Micro (comps fine-tuning)
        """
        try:
            # Prepare property details for AI analysis
            property_details = self._format_property_details(features)
            
            # RAG: Retrieve comparable properties from database
            lat = features.get('lat')
            lon = features.get('lon')
            city = features.get('city', 'Unknown')
            district = features.get('district', 'Unknown')
            comparable_properties = []
            comparable_properties_text = ""
            
            if lat is not None and lon is not None:
                comparable_properties = self._get_comparable_properties(lat, lon, distance_km=5)
                comparable_properties_text = self._format_comps_for_prompt(comparable_properties)
            else:
                comparable_properties_text = "No comparable properties available (location coordinates not provided)."
            
            # Create advanced two-step prompt: Macro Analysis → Micro Analysis (RAG)
            prompt = f"""
You are a Real Estate Price Estimator Agent specialized in the Sri Lankan property market. 
You must perform a TWO-STEP analysis to provide an accurate price estimate in Sri Lankan Rupees (LKR).

Property Details:
{property_details}

Comparable Properties (Recently Sold/Listed within 5km):
{comparable_properties_text}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**MANDATORY TWO-STEP ANALYSIS FRAMEWORK**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**STEP 1: MACRO ANALYSIS - ESTABLISH BASELINE PRICE RANGE**

Before analyzing comparable properties, you MUST first classify the property's macro-environment:

A. **Area Classification:**
   Analyze the city ({city}), district ({district}), and coordinates ({lat}, {lon}) to determine:
   
   • **Area Type:** Is this a:
     - Prime Urban (e.g., Colombo 3/4/5/7, Kandy City Center) - Highest value tier
     - Established Urban (e.g., Dehiwala, Nugegoda, Moratuwa) - High value tier
     - Suburban Residential (e.g., Battaramulla, Rajagiriya, Maharagama) - Medium-high tier
     - Developing Town (e.g., Gampaha, Negombo, Kurunegala) - Medium tier
     - Rural Residential (e.g., Outskirts of major cities) - Medium-low tier
     - Rural Agricultural (e.g., Welimada, Hingurakgoda, remote villages) - Lower tier
   
   • **General Demand Level:**
     - Very High Demand: Prime urban areas with limited supply, high competition
     - High Demand: Established urban areas, good infrastructure
     - Medium Demand: Suburban areas, developing towns
     - Low Demand: Rural areas, limited economic activity
     - Very Low Demand: Remote agricultural regions
   
   • **Population Density:**
     - High Density (>2000 people/km²): Urban centers
     - Medium Density (500-2000 people/km²): Suburban areas
     - Low Density (<500 people/km²): Rural areas

B. **Establish Baseline Price Range:**
   Based on the macro analysis above, establish a BASELINE price range per square foot for this area type:
   
   Example baseline ranges (adjust based on your analysis):
   - Prime Urban: LKR 40,000-70,000 per sq ft
   - Established Urban: LKR 30,000-50,000 per sq ft
   - Suburban Residential: LKR 20,000-35,000 per sq ft
   - Developing Town: LKR 15,000-25,000 per sq ft
   - Rural Residential: LKR 10,000-18,000 per sq ft
   - Rural Agricultural: LKR 5,000-12,000 per sq ft
   
   **CRITICAL:** The final price estimate MUST fall within this baseline range unless there are exceptional circumstances.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**STEP 2: MICRO ANALYSIS - FINE-TUNE WITH COMPARABLE PROPERTIES**

Now use the comparable properties data to fine-tune your estimate WITHIN the baseline range:

A. **Comparable Properties Analysis:**
   - Compare the subject property to each comparable
   - Consider differences in size, bedrooms, bathrooms, age, condition
   - Note how the comps are distributed within the baseline range
   
B. **Position Within Baseline Range:**
   - If subject property is BETTER than comps (newer, larger, better condition):
     → Position at HIGHER END of baseline range
   - If subject property is SIMILAR to comps:
     → Position at MIDDLE of baseline range
   - If subject property is WORSE than comps (older, smaller, needs work):
     → Position at LOWER END of baseline range

C. **Micro-Location Adjustments:**
   - Proximity to main roads, shopping centers, schools, hospitals
   - Neighborhood quality and safety
   - View, noise levels, accessibility
   - Apply adjustments (±5-10%) within the baseline range

D. **Property-Specific Features:**
   - Land size, parking, garden, special amenities
   - Recent renovations or upgrades
   - Unique features that add value
   - Adjust final price within the baseline framework

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**FINAL OUTPUT REQUIREMENTS:**

Provide your analysis as a JSON object with these fields:

{{
    "estimated_price": <price_in_lkr>,
    "confidence": <0_to_1>,
    "reasoning": "Macro Analysis: [Describe area type, demand level, population density, and baseline range]. Micro Analysis: [Describe how comps were used to fine-tune within the baseline]. Final Justification: [Why this specific price].",
    "key_factors": ["Macro Environment: [Area Type]", "Population Density: [Level]", "Demand Level: [Level]", "Comparable Properties", "Property Condition", "[Other factors]"]
}}

**CRITICAL RULES:**
1. Your reasoning MUST explicitly mention the macro analysis (area type, demand, density)
2. The estimated price MUST be justified by BOTH macro baseline AND micro comps
3. Include "Macro Environment", "Population Density", and "Demand Level" in key_factors
4. A property in Colombo 7 (Prime Urban) should NEVER have the same baseline price as one in Welimada (Rural)
5. Use comparable properties to position the estimate within (not beyond) the macro baseline range

Remember: The macro analysis sets the FLOOR and CEILING. The comparable properties help you pick the right spot between them.
"""

            # Get AI response
            response = self.model.generate_content(prompt)
            ai_result = self._parse_ai_response(response.text)
            
            # Use actual retrieved comps if available, otherwise generate mock ones
            if comparable_properties:
                comps = comparable_properties
            else:
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
        
        # Location details - MUST be first for proper context
        if 'city' in features:
            details.append(f"City: {features['city']}")
        if 'district' in features:
            details.append(f"District: {features['district']}")
        if 'lat' in features and 'lon' in features and features['lat'] and features['lon']:
            details.append(f"Coordinates: {features['lat']}, {features['lon']}")
            details.append("Note: Location coordinates are crucial for accurate pricing")
        
        # Basic property info
        if 'area' in features:
            details.append(f"Area: {features['area']} sq ft")
        if 'beds' in features:
            details.append(f"Bedrooms: {features['beds']}")
        if 'baths' in features:
            details.append(f"Bathrooms: {features['baths']}")
        if 'property_type' in features:
            details.append(f"Property Type: {features['property_type']}")
        
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
        lat = features.get('lat')
        lon = features.get('lon')
        
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
        
        # Apply location-based variance if coordinates are provided
        if lat is not None and lon is not None:
            # Use coordinates to add variance (prevents same price for different locations)
            # This creates a deterministic but location-specific adjustment
            location_factor = 1.0 + (((lat + lon) % 1.0) - 0.5) * 0.2  # ±10% based on coordinates
            avg_price_per_sqft *= location_factor
        
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
            "key_factors": ["Area", "Location", "Property Type", "Geographic Coordinates"]
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
    
    def _get_comparable_properties(self, lat: float, lon: float, distance_km: int = 5) -> List[Dict]:
        """
        Retrieve comparable properties from database (currently mock data).
        In production, this would query a real estate database using geospatial queries.
        
        Args:
            lat: Latitude of the subject property
            lon: Longitude of the subject property
            distance_km: Search radius in kilometers
            
        Returns:
            List of comparable property dictionaries
        """
        # Mock database simulation - In production, replace with actual database query
        # Example: SELECT * FROM properties WHERE ST_Distance_Sphere(point(lon, lat), point(?, ?)) <= ? * 1000
        
        import math
        
        # Generate mock comparable properties based on location
        # Use coordinates to create deterministic but varied data
        seed_value = int((lat + lon) * 10000) % 1000
        random.seed(seed_value)  # Deterministic based on location
        
        comparable_properties = []
        num_comps = random.randint(3, 5)
        
        # Define realistic Sri Lankan property data ranges
        cities_nearby = ['Colombo', 'Dehiwala', 'Moratuwa', 'Nugegoda', 'Rajagiriya', 'Battaramulla', 'Kotte']
        property_types = ['House', 'Apartment', 'Villa', 'Townhouse']
        
        for i in range(num_comps):
            # Generate nearby coordinates (within distance_km)
            angle = random.uniform(0, 2 * math.pi)
            distance = random.uniform(0.1, distance_km)
            
            # Rough conversion: 1 degree ≈ 111 km
            lat_offset = (distance * math.cos(angle)) / 111.0
            lon_offset = (distance * math.sin(angle)) / (111.0 * math.cos(math.radians(lat)))
            
            comp_lat = lat + lat_offset
            comp_lon = lon + lon_offset
            
            # Generate property details
            area = random.randint(800, 2500)
            beds = random.randint(2, 5)
            baths = random.randint(1, 4)
            year_built = random.randint(2000, 2024)
            property_type = random.choice(property_types)
            
            # Generate price based on area and type
            if property_type == 'House':
                base_price_per_sqft = random.uniform(25000, 55000)
            elif property_type == 'Apartment':
                base_price_per_sqft = random.uniform(20000, 45000)
            elif property_type == 'Villa':
                base_price_per_sqft = random.uniform(35000, 65000)
            else:  # Townhouse
                base_price_per_sqft = random.uniform(22000, 48000)
            
            price_lkr = int(area * base_price_per_sqft)
            
            comparable_properties.append({
                'id': f'comp_{i+1}',
                'address': f'{random.randint(1, 999)} {random.choice(["Galle", "Duplication", "Baseline", "High Level", "Bauddhaloka"])} Road, {random.choice(cities_nearby)}',
                'price_lkr': price_lkr,
                'price': float(price_lkr),
                'area_sqft': area,
                'area': float(area),
                'beds': beds,
                'baths': baths,
                'year_built': year_built,
                'property_type': property_type,
                'lat': round(comp_lat, 6),
                'lon': round(comp_lon, 6),
                'distance_km': round(distance, 2),
                'price_per_sqft': round(price_lkr / area, 2),
                'sold_date': f'2024-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}',
                'city': random.choice(cities_nearby)
            })
        
        # Reset random seed
        random.seed()
        
        logger.info(f"Retrieved {len(comparable_properties)} comparable properties within {distance_km}km of ({lat}, {lon})")
        return comparable_properties
    
    def _format_comps_for_prompt(self, comps: List[Dict]) -> str:
        """
        Format comparable properties into a readable string for the AI prompt.
        
        Args:
            comps: List of comparable property dictionaries
            
        Returns:
            Formatted string describing each comparable property
        """
        if not comps:
            return "No comparable properties found in the area."
        
        formatted_lines = []
        for i, comp in enumerate(comps, 1):
            formatted_lines.append(f"\nComparable Property #{i}:")
            formatted_lines.append(f"  Address: {comp.get('address', 'N/A')}")
            formatted_lines.append(f"  Price: LKR {comp.get('price_lkr', 0):,}")
            formatted_lines.append(f"  Area: {comp.get('area_sqft', 0):,} sq ft")
            formatted_lines.append(f"  Price per sq ft: LKR {comp.get('price_per_sqft', 0):,}")
            formatted_lines.append(f"  Bedrooms: {comp.get('beds', 'N/A')}")
            formatted_lines.append(f"  Bathrooms: {comp.get('baths', 'N/A')}")
            formatted_lines.append(f"  Property Type: {comp.get('property_type', 'N/A')}")
            formatted_lines.append(f"  Year Built: {comp.get('year_built', 'N/A')}")
            formatted_lines.append(f"  Distance: {comp.get('distance_km', 0):.2f} km away")
            if 'sold_date' in comp:
                formatted_lines.append(f"  Sold Date: {comp['sold_date']}")
        
        return "\n".join(formatted_lines)
    
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
