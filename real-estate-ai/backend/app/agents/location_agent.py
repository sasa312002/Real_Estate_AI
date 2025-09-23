import logging
from typing import Dict, List, Tuple
import random
import math

logger = logging.getLogger(__name__)

class LocationAgent:
    def __init__(self):
        self.location_data = {}  # Placeholder for real location database
        
    def analyze_location(self, lat: float, lon: float, city: str = None, district: str = None) -> Dict:
        """
        Analyze location based on coordinates, city, and district for Sri Lanka.
        Returns: {score, bullets, summary, provenance}
        """
        try:
            # Mock location analysis (replace with real API calls)
            location_score = self._calculate_location_score(lat, lon, city, district)
            bullets = self._generate_location_bullets(lat, lon, city, district)
            summary = self._generate_location_summary(location_score, city, district)
            provenance = self._generate_provenance(lat, lon, city, district)
            
            return {
                "score": location_score,
                "bullets": bullets,
                "summary": summary,
                "provenance": provenance
            }
            
        except Exception as e:
            logger.error(f"Error in location analysis: {e}")
            return {
                "score": 0.5,
                "bullets": ["Location analysis unavailable"],
                "summary": "Unable to analyze location",
                "provenance": [],
                "error": str(e)
            }
    
    def _calculate_location_score(self, lat: float, lon: float, city: str = None, district: str = None) -> float:
        """Calculate location score (0-1) based on various Sri Lankan factors"""
        score = 0.5  # Base score
        
        # City-based scoring for Sri Lanka
        if city:
            city_scores = {
                # Major Cities
                'Colombo': 0.95,
                'Kandy': 0.90,
                'Galle': 0.85,
                'Jaffna': 0.80,
                'Negombo': 0.85,
                'Matara': 0.80,
                'Anuradhapura': 0.75,
                'Polonnaruwa': 0.70,
                'Trincomalee': 0.80,
                'Batticaloa': 0.75,
                'Ratnapura': 0.70,
                'Kurunegala': 0.75,
                'Badulla': 0.70,
                'Monaragala': 0.65,
                'Vavuniya': 0.70,
                'Mullaitivu': 0.65,
                'Kilinochchi': 0.65,
                'Ampara': 0.70,
                'Puttalam': 0.75,
                'Hambantota': 0.80,
                'Kalutara': 0.80,
                'Gampaha': 0.85,
                'Nuwara Eliya': 0.80,
                'Kegalle': 0.75,
                'Unknown': 0.5
            }
            score = city_scores.get(city, 0.5)
        
        # District-based scoring for Colombo
        if city == 'Colombo' and district:
            district_scores = {
                'Colombo 1': 0.98,  # Fort area - prime business district
                'Colombo 2': 0.97,  # Slave Island - developing area
                'Colombo 3': 0.96,  # Kollupitiya - upscale residential
                'Colombo 4': 0.95,  # Bambalapitiya - prime residential
                'Colombo 5': 0.94,  # Havelock Town - upscale area
                'Colombo 6': 0.93,  # Wellawatte - beach area
                'Colombo 7': 0.97,  # Cinnamon Gardens - most prestigious
                'Colombo 8': 0.92,  # Borella - central residential
                'Colombo 9': 0.91,  # Dematagoda - developing area
                'Colombo 10': 0.90, # Maradana - central area
                'Colombo 11': 0.89, # Pettah - commercial area
                'Colombo 12': 0.88, # Peliyagoda - developing area
                'Colombo 13': 0.87, # Wattala - suburban area
                'Colombo 14': 0.86, # Grandpass - developing area
                'Colombo 15': 0.85  # Modara - port area
            }
            if district in district_scores:
                score = district_scores[district]
        
        # Special area scoring for other cities
        if city == 'Kandy' and district:
            kandy_districts = {
                'Peradeniya': 0.92,  # University area
                'Katugastota': 0.88, # Commercial area
                'Mahaiyawa': 0.85,   # Residential area
                'Asgiriya': 0.90,    # Temple area
                'Malwatte': 0.89     # Temple area
            }
            if district in kandy_districts:
                score = kandy_districts[district]
        
        if city == 'Galle' and district:
            galle_districts = {
                'Galle Fort': 0.95,      # UNESCO heritage site
                'Unawatuna': 0.90,       # Beach area
                'Hikkaduwa': 0.88,       # Beach area
                'Mirissa': 0.92,          # Beach area
                'Weligama': 0.89          # Beach area
            }
            if district in galle_districts:
                score = galle_districts[district]
        
        # Coordinate-based adjustments for Sri Lanka
        if lat and lon:
            # Colombo area (6.9271, 79.8612) - highest value
            colombo_distance = math.sqrt((lat - 6.9271)**2 + (lon - 79.8612)**2)
            if colombo_distance < 0.1:  # Within ~10km of Colombo center
                score += 0.05
            elif colombo_distance < 0.2:  # Within ~20km of Colombo center
                score += 0.03
            
            # Kandy area (7.2906, 80.6337)
            kandy_distance = math.sqrt((lat - 7.2906)**2 + (lon - 80.6337)**2)
            if kandy_distance < 0.1:
                score += 0.03
            
            # Galle area (6.0535, 80.2210)
            galle_distance = math.sqrt((lat - 6.0535)**2 + (lon - 80.2210)**2)
            if galle_distance < 0.1:
                score += 0.02
        
        # Add some randomness to simulate real-world variation
        score += random.uniform(-0.05, 0.05)
        
        return max(0.0, min(1.0, score))
    
    def _generate_location_bullets(self, lat: float, lon: float, city: str = None, district: str = None) -> List[str]:
        """Generate location-specific bullet points for Sri Lanka"""
        bullets = []
        
        if city:
            city_bullets = {
                'Colombo': [
                    "Capital city with excellent infrastructure",
                    "Close to Bandaranaike International Airport",
                    "Major business and financial hub",
                    "Good public transportation (buses, trains)",
                    "International schools and universities",
                    "Modern shopping malls and restaurants",
                    "Healthcare facilities and hospitals",
                    "Port city with trade opportunities"
                ],
                'Kandy': [
                    "Cultural and historical significance",
                    "Pleasant climate and scenic beauty",
                    "Major tourist destination",
                    "Peradeniya University area",
                    "Temple of the Tooth Relic",
                    "Botanical Gardens",
                    "Tea plantations nearby",
                    "Cooler climate than coastal areas"
                ],
                'Galle': [
                    "Coastal city with beautiful beaches",
                    "UNESCO World Heritage site (Galle Fort)",
                    "Tourism and hospitality focus",
                    "Relaxed lifestyle",
                    "Historical Portuguese and Dutch influence",
                    "Good for retirement and tourism",
                    "Fishing industry",
                    "Close to other beach destinations"
                ],
                'Jaffna': [
                    "Northern cultural center",
                    "Growing economic opportunities",
                    "Unique cultural heritage",
                    "Development potential",
                    "University of Jaffna",
                    "Historical significance",
                    "Agricultural land",
                    "Peaceful environment"
                ],
                'Negombo': [
                    "Beach city near airport",
                    "Tourist-friendly area",
                    "Fishing industry",
                    "Good for expats and tourists",
                    "Historical churches",
                    "Lagoon and beach activities",
                    "Growing real estate market",
                    "Easy access to Colombo"
                ],
                'Matara': [
                    "Southern coastal city",
                    "Beautiful beaches",
                    "Historical significance",
                    "University of Ruhuna",
                    "Growing development",
                    "Good investment potential",
                    "Tourist attractions",
                    "Peaceful lifestyle"
                ],
                'Anuradhapura': [
                    "Ancient capital of Sri Lanka",
                    "UNESCO World Heritage site",
                    "Buddhist pilgrimage site",
                    "Historical significance",
                    "Agricultural land",
                    "Growing tourism",
                    "Cultural heritage",
                    "Investment potential"
                ]
            }
            bullets = city_bullets.get(city, [
                "Developing area with potential",
                "Local amenities available",
                "Growing community",
                "Investment opportunities"
            ])
        
        # Add district-specific bullets for Colombo
        if city == 'Colombo' and district:
            district_bullets = {
                'Colombo 1': [
                    "Prime business district",
                    "Financial institutions",
                    "Government offices",
                    "High commercial value"
                ],
                'Colombo 3': [
                    "Upscale residential area",
                    "Close to beach",
                    "International schools",
                    "High-end restaurants"
                ],
                'Colombo 7': [
                    "Most prestigious area",
                    "Diplomatic missions",
                    "Luxury residences",
                    "Exclusive clubs"
                ],
                'Colombo 5': [
                    "Upscale residential",
                    "Good schools",
                    "Shopping areas",
                    "Family-friendly"
                ]
            }
            if district in district_bullets:
                bullets.extend(district_bullets[district])
        
        # Add general location factors
        if lat and lon:
            bullets.append(f"Coordinates: {lat:.4f}, {lon:.4f}")
        
        return bullets
    
    def _generate_location_summary(self, location_score: float, city: str = None, district: str = None) -> str:
        """Generate location summary for Sri Lanka"""
        if location_score >= 0.9:
            return f"Excellent location in {city}{' - ' + district if district else ''}. Prime area with high investment potential and excellent amenities."
        elif location_score >= 0.8:
            return f"Very good location in {city}{' - ' + district if district else ''}. Desirable area with good infrastructure and growth potential."
        elif location_score >= 0.7:
            return f"Good location in {city}{' - ' + district if district else ''}. Well-established area with decent amenities and investment value."
        elif location_score >= 0.6:
            return f"Fair location in {city}{' - ' + district if district else ''}. Developing area with potential for growth and improvement."
        else:
            return f"Basic location in {city}{' - ' + district if district else ''}. Area with basic amenities and potential for development."
    
    def _generate_provenance(self, lat: float, lon: float, city: str = None, district: str = None) -> List[Dict]:
        """Generate provenance information for location analysis"""
        provenance = []
        
        if city:
            provenance.append({
                "source": "City Analysis",
                "method": "Sri Lankan city scoring system",
                "confidence": 0.9,
                "details": f"Analyzed {city} based on local market data"
            })
        
        if district:
            provenance.append({
                "source": "District Analysis",
                "method": "Local area scoring",
                "confidence": 0.85,
                "details": f"Evaluated {district} within {city}"
            })
        
        if lat and lon:
            provenance.append({
                "source": "Coordinate Analysis",
                "method": "Geographic proximity scoring",
                "confidence": 0.8,
                "details": f"Analyzed location at coordinates {lat:.4f}, {lon:.4f}"
            })
        
        provenance.append({
            "source": "Sri Lanka Market Data",
            "method": "Local real estate analysis",
            "confidence": 0.9,
            "details": "Based on Sri Lankan property market trends"
        })
        
        return provenance
