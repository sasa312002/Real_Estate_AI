import logging
from typing import Dict, List, Tuple
import random

logger = logging.getLogger(__name__)

class PriceAgent:
    def __init__(self):
        # Sri Lankan LKR pricing per square foot (in LKR)
        self.base_price_per_sqft = 25000  # Default base price per square foot in LKR
        
    def estimate_price(self, features: Dict) -> Dict:
        """
        Estimate property price based on features for Sri Lankan market.
        Returns: {estimated_price, confidence, features_used, comps, currency}
        """
        try:
            # Extract features
            area = features.get('area', 1000)
            beds = features.get('beds', 2)
            baths = features.get('baths', 2)
            year_built = features.get('year_built', 2000)
            city = features.get('city', 'Unknown')
            district = features.get('district', '')
            property_type = features.get('property_type', 'House')
            land_size = features.get('land_size', 0)
            asking_price = features.get('asking_price', 0)
            
            # Base price calculation in LKR
            base_price = area * self.base_price_per_sqft
            
            # Property type adjustments for Sri Lanka
            type_multiplier = self._get_property_type_multiplier(property_type)
            base_price *= type_multiplier
            
            # Bedroom and bathroom adjustments
            bed_adjustment = (beds - 2) * 500000  # Each additional bed adds LKR 500k
            bath_adjustment = (baths - 1) * 300000  # Each additional bath adds LKR 300k
            
            # Age adjustment (newer = more expensive)
            current_year = 2024
            age = current_year - year_built
            age_adjustment = max(0, (30 - age) * 100000)  # Newer properties get premium
            
            # City and district adjustment for Sri Lanka
            city_multiplier = self._get_city_multiplier(city, district)
            
            # Land size adjustment for houses
            land_adjustment = 0
            if property_type == 'House' and land_size > 0:
                land_adjustment = (land_size - area) * 15000  # Additional land value
            
            # Calculate estimated price
            estimated_price = (base_price + bed_adjustment + bath_adjustment + age_adjustment + land_adjustment) * city_multiplier
            
            # Generate confidence based on data completeness
            confidence = self._calculate_confidence(features)
            
            # Generate comparable properties for Sri Lankan market
            comps = self._generate_comps(features, estimated_price)
            
            return {
                "estimated_price": round(estimated_price, 2),
                "confidence": confidence,
                "features_used": list(features.keys()),
                "comps": comps,
                "currency": "LKR",
                "price_per_sqft": round(estimated_price / area, 2) if area > 0 else 0
            }
            
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
    
    def _get_city_multiplier(self, city: str, district: str = '') -> float:
        """Get city-specific price multiplier for Sri Lanka"""
        city_multipliers = {
            # Major Cities
            'Colombo': 1.8,      # Highest property values
            'Kandy': 1.4,        # Cultural capital
            'Galle': 1.3,        # Tourist area
            'Jaffna': 1.1,       # Northern capital
            'Negombo': 1.2,      # Airport proximity
            'Matara': 1.1,       # Southern coastal
            'Anuradhapura': 1.0, # Historical city
            'Polonnaruwa': 0.9,  # Historical city
            'Trincomalee': 1.1,  # Port city
            'Batticaloa': 1.0,   # Eastern coastal
            'Ratnapura': 0.9,    # Gem city
            'Kurunegala': 1.0,   # Central city
            'Badulla': 0.9,      # Hill country
            'Monaragala': 0.8,   # Rural area
            'Vavuniya': 0.9,     # Northern area
            'Mullaitivu': 0.8,   # Northern coastal
            'Kilinochchi': 0.8,  # Northern area
            'Ampara': 0.9,       # Eastern area
            'Puttalam': 1.0,     # Northwestern
            'Hambantota': 1.1,   # Southern port
            'Kalutara': 1.2,     # Western coastal
            'Gampaha': 1.3,      # Colombo suburb
            'Nuwara Eliya': 1.2, # Hill station
            'Kegalle': 1.0,      # Central area
            'Unknown': 1.0
        }
        
        base_multiplier = city_multipliers.get(city, 1.0)
        
        # District-specific adjustments for Colombo
        if city == 'Colombo' and district:
            district_multipliers = {
                'Colombo 1': 2.2,   # Fort - prime business
                'Colombo 2': 2.0,   # Slave Island
                'Colombo 3': 1.9,   # Kollupitiya
                'Colombo 4': 1.8,   # Bambalapitiya
                'Colombo 5': 1.7,   # Havelock Town
                'Colombo 6': 1.6,   # Wellawatte
                'Colombo 7': 2.1,   # Cinnamon Gardens
                'Colombo 8': 1.5,   # Borella
                'Colombo 9': 1.4,   # Dematagoda
                'Colombo 10': 1.3,  # Maradana
                'Colombo 11': 1.2,  # Pettah
                'Colombo 12': 1.1,  # Peliyagoda
                'Colombo 13': 1.0,  # Wattala
                'Colombo 14': 0.9,  # Grandpass
                'Colombo 15': 0.8   # Modara
            }
            if district in district_multipliers:
                return district_multipliers[district]
        
        # Special area adjustments for other cities
        if city == 'Kandy' and district:
            kandy_districts = {
                'Peradeniya': 1.5,   # University area
                'Katugastota': 1.3,  # Commercial area
                'Mahaiyawa': 1.2,    # Residential area
                'Asgiriya': 1.4,     # Temple area
                'Malwatte': 1.4      # Temple area
            }
            if district in kandy_districts:
                return kandy_districts[district]
        
        if city == 'Galle' and district:
            galle_districts = {
                'Galle Fort': 1.6,      # UNESCO heritage
                'Unawatuna': 1.5,       # Beach area
                'Hikkaduwa': 1.4,       # Beach area
                'Mirissa': 1.5,          # Beach area
                'Weligama': 1.4          # Beach area
            }
            if district in galle_districts:
                return galle_districts[district]
        
        return base_multiplier
    
    def _get_property_type_multiplier(self, property_type: str) -> float:
        """Get property type multiplier for Sri Lankan market"""
        type_multipliers = {
            'House': 1.0,           # Base type
            'Apartment': 0.9,        # Generally cheaper per sqft
            'Commercial': 1.2,       # Higher value for business
            'Land': 0.7,             # Raw land
            'Tea Estate': 0.8,       # Agricultural
            'Villa': 1.3,            # Luxury houses
            'Penthouse': 1.4,        # Premium apartments
            'Office': 1.3,           # Commercial office
            'Shop': 1.1,             # Retail space
            'Hotel': 1.5             # Hospitality
        }
        return type_multipliers.get(property_type, 1.0)
    
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
