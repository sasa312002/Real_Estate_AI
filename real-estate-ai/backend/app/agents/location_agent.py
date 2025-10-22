import logging
from typing import Dict, List, Tuple, Optional, Any
import random
import math
import json
import httpx
import google.generativeai as genai
from app.core.config import settings

logger = logging.getLogger(__name__)

class LocationAgent:
    def __init__(self):
        self.location_data = {}  # Placeholder for real location database
        self.llm = None
        self._initialize_llm()

    def _initialize_llm(self):
        """Initialize Gemini AI if API key is available"""
        try:
            if settings.gemini_api_key:
                genai.configure(api_key=settings.gemini_api_key)
                self.llm = genai.GenerativeModel('gemini-pro')
                logger.info("Gemini AI initialized in LocationAgent")
            else:
                logger.warning("No Gemini API key provided; LocationAgent will use fallback risk analysis")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini AI in LocationAgent: {e}")
            self.llm = None
        
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

    async def get_nearby_amenities(self, lat: float, lon: float) -> Dict[str, List[Dict[str, Any]]]:
        """Query OpenStreetMap Overpass API for nearby amenities and major roads.
        Returns a dict keyed by category with list of { name, lat, lon, distance_km }.
        """
        try:
            # Define search radii (meters)
            amenity_radius = 1500
            road_radius = 2000
            # Overpass QL query - include hospitals, supermarkets, pharmacies, schools, universities, police, transport, religious places, and major roads
            query = f"""
            [out:json];
            (
                node["amenity"="hospital"](around:{amenity_radius},{lat},{lon});
                way["amenity"="hospital"](around:{amenity_radius},{lat},{lon});
                node["shop"="supermarket"](around:{amenity_radius},{lat},{lon});
                way["shop"="supermarket"](around:{amenity_radius},{lat},{lon});
                node["amenity"="pharmacy"](around:{amenity_radius},{lat},{lon});
                way["amenity"="pharmacy"](around:{amenity_radius},{lat},{lon});
                node["amenity"="school"](around:{amenity_radius},{lat},{lon});
                way["amenity"="school"](around:{amenity_radius},{lat},{lon});
                node["amenity"="university"](around:{amenity_radius},{lat},{lon});
                way["amenity"="university"](around:{amenity_radius},{lat},{lon});
                node["amenity"="police"](around:{amenity_radius},{lat},{lon});
                node["amenity"="fire_station"](around:{amenity_radius},{lat},{lon});
                node["amenity"="place_of_worship"](around:{amenity_radius},{lat},{lon});
                way["amenity"="place_of_worship"](around:{amenity_radius},{lat},{lon});
                node["amenity"="bus_station"](around:{amenity_radius},{lat},{lon});
                node["railway"="station"](around:{amenity_radius},{lat},{lon});
                way["highway"~"motorway|trunk|primary"](around:{road_radius},{lat},{lon});
                way["waterway"~"river|stream|canal"](around:{road_radius},{lat},{lon});
                way["natural"="water"](around:{road_radius},{lat},{lon});
                way["railway"~"rail|light_rail|subway"](around:{road_radius},{lat},{lon});
                way["landuse"="industrial"](around:{road_radius},{lat},{lon});
            );
            out center 40;
            """
            url = "https://overpass-api.de/api/interpreter"
            results: Dict[str, List[Dict[str, Any]]] = {
                'hospitals': [], 'supermarkets': [], 'pharmacies': [], 'schools': [], 'universities': [], 'police': [],
                'fire_stations': [], 'bus_stations': [], 'train_stations': [], 'roads': [],
                'religious_places': [],
                'waterways': [], 'water_bodies': [], 'railways': [], 'industrial_areas': []
            }
            async with httpx.AsyncClient(timeout=20.0) as client:
                resp = await client.post(url, data={"data": query})
                resp.raise_for_status()
                data = resp.json()
            elements = data.get('elements', [])

            # If no elements were returned (sparse area or Overpass shortfall), retry once with larger radius
            if not elements:
                logger.info("Overpass returned no elements; retrying with larger radius")
                amenity_radius2 = amenity_radius * 2
                road_radius2 = road_radius * 2
                query2 = f"""
                [out:json];
                (
                    node["amenity"="hospital"](around:{amenity_radius2},{lat},{lon});
                    way["amenity"="hospital"](around:{amenity_radius2},{lat},{lon});
                    node["shop"="supermarket"](around:{amenity_radius2},{lat},{lon});
                    way["shop"="supermarket"](around:{amenity_radius2},{lat},{lon});
                    node["amenity"="pharmacy"](around:{amenity_radius2},{lat},{lon});
                    way["amenity"="pharmacy"](around:{amenity_radius2},{lat},{lon});
                    node["amenity"="school"](around:{amenity_radius2},{lat},{lon});
                    way["amenity"="school"](around:{amenity_radius2},{lat},{lon});
                    node["amenity"="university"](around:{amenity_radius2},{lat},{lon});
                    way["amenity"="university"](around:{amenity_radius2},{lat},{lon});
                    node["amenity"="police"](around:{amenity_radius2},{lat},{lon});
                    node["amenity"="fire_station"](around:{amenity_radius2},{lat},{lon});
                    node["amenity"="place_of_worship"](around:{amenity_radius2},{lat},{lon});
                    way["amenity"="place_of_worship"](around:{amenity_radius2},{lat},{lon});
                    node["amenity"="bus_station"](around:{amenity_radius2},{lat},{lon});
                    node["railway"="station"](around:{amenity_radius2},{lat},{lon});
                    way["highway"~"motorway|trunk|primary"](around:{road_radius2},{lat},{lon});
                    way["waterway"~"river|stream|canal"](around:{road_radius2},{lat},{lon});
                    way["natural"="water"](around:{road_radius2},{lat},{lon});
                    way["railway"~"rail|light_rail|subway"](around:{road_radius2},{lat},{lon});
                    way["landuse"="industrial"](around:{road_radius2},{lat},{lon});
                );
                out center 40;
                """
                try:
                    async with httpx.AsyncClient(timeout=20.0) as client:
                        resp2 = await client.post(url, data={"data": query2})
                        resp2.raise_for_status()
                        data2 = resp2.json()
                    elements = data2.get('elements', [])
                except Exception as e2:
                    logger.warning(f"Overpass retry failed: {e2}")

            def haversine(lat1, lon1, lat2, lon2):
                from math import radians, sin, cos, sqrt, atan2
                R = 6371.0
                dlat = radians(lat2 - lat1)
                dlon = radians(lon2 - lon1)
                a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
                c = 2 * atan2(sqrt(a), sqrt(1-a))
                return R * c

            for el in elements:
                tags = el.get('tags', {})
                name = tags.get('name') or tags.get('ref') or 'Unnamed'
                # Determine coordinates
                el_lat = el.get('lat')
                el_lon = el.get('lon')
                if el_lat is None or el_lon is None:
                    center = el.get('center') or {}
                    el_lat = center.get('lat')
                    el_lon = center.get('lon')
                if el_lat is None or el_lon is None:
                    continue
                distance = haversine(lat, lon, el_lat, el_lon)
                item = { 'name': name, 'lat': el_lat, 'lon': el_lon, 'distance_km': round(distance, 3) }
                if tags.get('amenity') == 'hospital':
                    results['hospitals'].append(item)
                elif tags.get('shop') == 'supermarket' or tags.get('shop') == 'convenience':
                    # Treat convenience stores as essential supermarkets in sparse areas
                    results['supermarkets'].append(item)
                elif tags.get('amenity') == 'pharmacy':
                    results['pharmacies'].append(item)
                elif tags.get('amenity') == 'school':
                    results['schools'].append(item)
                elif tags.get('amenity') == 'university':
                    results['universities'].append(item)
                elif tags.get('amenity') == 'police':
                    results['police'].append(item)
                elif tags.get('amenity') == 'fire_station':
                    results['fire_stations'].append(item)
                elif tags.get('amenity') == 'place_of_worship':
                    # Use religion tag to create a friendly name if no name present
                    religion = tags.get('religion')
                    if (not name or name == 'Unnamed') and religion:
                        friendly = {
                            'buddhist': 'Buddhist Temple',
                            'hindu': 'Hindu Kovil',
                            'christian': 'Church',
                            'muslim': 'Mosque',
                            'islam': 'Mosque'
                        }.get((religion or '').lower(), 'Place of Worship')
                        item['name'] = friendly
                    elif not name or name == 'Unnamed':
                        item['name'] = 'Place of Worship'
                    results['religious_places'].append(item)
                elif tags.get('amenity') == 'bus_station':
                    results['bus_stations'].append(item)
                elif tags.get('railway') == 'station':
                    results['train_stations'].append(item)
                elif tags.get('highway') in ('motorway','trunk','primary'):
                    # Roads
                    road_item = dict(item)
                    road_item['name'] = name or tags.get('highway')
                    results['roads'].append(road_item)
                elif tags.get('waterway') in ('river','stream','canal'):
                    results['waterways'].append(item)
                elif tags.get('natural') == 'water':
                    results['water_bodies'].append(item)
                elif tags.get('railway') in ('rail','light_rail','subway'):
                    results['railways'].append(item)
                elif tags.get('landuse') == 'industrial':
                    results['industrial_areas'].append(item)

            # Sort by distance and trim
            for k in results:
                results[k] = sorted(results[k], key=lambda x: x['distance_km'])[:10]
            return results
        except Exception as e:
            logger.error(f"Overpass nearby amenities error: {e}")
            return {'hospitals': [], 'supermarkets': [], 'pharmacies': [], 'schools': [], 'universities': [], 'police': [], 'fire_stations': [], 'bus_stations': [], 'train_stations': [], 'roads': [], 'waterways': [], 'water_bodies': [], 'railways': [], 'industrial_areas': []}

    def llm_analyze_location_risk(self, lat: float, lon: float, city: Optional[str], district: Optional[str], nearby: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Use Gemini to analyze risk factors and return structured JSON.
        Fallback returns heuristic risk based on location score.
        """
        try:
            # Always compute heuristic baseline from nearby features
            heuristic = self._compute_risk_from_nearby(lat, lon, nearby or {})
            if not self.llm:
                return heuristic
            payload = {
                'lat': lat, 'lon': lon, 'city': city, 'district': district,
                'nearby_counts': {k: len(v) for k, v in (nearby or {}).items()}
            }
            prompt = f"""
            You are a Sri Lankan location risk analyst. Assess the risks for the location with the following data.
            Provide clear, practical insights for a property investor.

            Input JSON: {json.dumps(payload)}

            Consider risks: flood, crime, traffic, noise, environmental hazards, access to emergency services.
            Return STRICT JSON only:
            {{
              "level": "Low" | "Medium" | "High",
              "factors": [
                {{ "name": string, "severity": 1|2|3|4|5, "description": string }}
              ],
              "summary": string
            }}
            """
            response = self.llm.generate_content(prompt)
            text = response.text
            data = None
            try:
                data = json.loads(text)
            except json.JSONDecodeError:
                start = text.find('{')
                end = text.rfind('}')
                if start != -1 and end != -1 and end > start:
                    try:
                        data = json.loads(text[start:end+1])
                    except Exception:
                        data = None
            if not isinstance(data, dict):
                return heuristic
            # Minimal validation
            data['level'] = data.get('level') or 'Medium'
            data['factors'] = data.get('factors') or []
            data['summary'] = data.get('summary') or 'Risk assessment not available.'
            # Merge heuristic factors if LLM omitted them
            if not data['factors']:
                data['factors'] = heuristic.get('factors', [])
            return data
        except Exception as e:
            logger.warning(f"LLM risk analysis fallback: {e}")
            return self._compute_risk_from_nearby(lat, lon, nearby or {})

    def _compute_risk_from_nearby(self, lat: float, lon: float, nearby: Dict[str, List[Dict[str, Any]]]) -> Dict[str, Any]:
        """Heuristically compute risk from proximity to hazards like highways, waterways (flood), railways, industrial."""
        def nearest_distance(items: List[Dict[str, Any]]) -> Optional[float]:
            try:
                return min((i.get('distance_km', 9999) for i in items), default=None)
            except Exception:
                return None

        factors: List[Dict[str, Any]] = []
        score_flags = []

        # Highways noise/air
        d_highway = nearest_distance(nearby.get('roads', []))
        if d_highway is not None:
            if d_highway < 0.2:
                factors.append({"name": "Major Highway", "severity": 4, "description": "Very close to a major road; expect higher noise and air pollution."})
                score_flags.append(3)
            elif d_highway < 0.5:
                factors.append({"name": "Major Highway", "severity": 3, "description": "Near a major road; some noise and pollution likely."})
                score_flags.append(2)

        # Waterways/flood risk
        d_water = min([d for d in [nearest_distance(nearby.get('waterways', [])), nearest_distance(nearby.get('water_bodies', []))] if d is not None], default=None)
        if d_water is not None:
            if d_water < 0.5:
                factors.append({"name": "Flood Risk (Water Proximity)", "severity": 4, "description": "Close to river/stream or water body; higher flood potential in heavy rains."})
                score_flags.append(3)
            elif d_water < 1.0:
                factors.append({"name": "Flood Risk (Water Proximity)", "severity": 3, "description": "Within 1km of water; moderate flood exposure depending on terrain."})
                score_flags.append(2)

        # Railway noise/vibration
        d_rail = nearest_distance(nearby.get('railways', []))
        if d_rail is not None:
            if d_rail < 0.3:
                factors.append({"name": "Railway Line", "severity": 4, "description": "Very close to railway; frequent noise and vibration expected."})
                score_flags.append(3)
            elif d_rail < 0.6:
                factors.append({"name": "Railway Line", "severity": 3, "description": "Near railway; occasional noise/vibration."})
                score_flags.append(2)

        # Industrial proximity
        d_ind = nearest_distance(nearby.get('industrial_areas', []))
        if d_ind is not None:
            if d_ind < 1.0:
                factors.append({"name": "Industrial Area", "severity": 4, "description": "Close to industrial zone; potential air/noise pollution."})
                score_flags.append(3)
            elif d_ind < 2.0:
                factors.append({"name": "Industrial Area", "severity": 3, "description": "Within 2km of industrial zone; mild pollution possible."})
                score_flags.append(2)

        # Determine level
        total = sum(score_flags)
        if any(f['severity'] >= 4 for f in factors) or total >= 7:
            level = 'High'
        elif any(f['severity'] >= 3 for f in factors) or total >= 4:
            level = 'Medium'
        else:
            level = 'Low'

        if not factors:
            factors = [{"name": "No Major Hazards Detected", "severity": 1, "description": "No significant hazards found within typical distances."}]

        summary = {
            'High': 'Higher risk due to proximity to hazards like highways, waterways, railways, or industrial zones.',
            'Medium': 'Some nearby hazards present; impact may vary by time and terrain.',
            'Low': 'No major hazards nearby; typical residential risk profile.'
        }[level]

        return {"level": level, "factors": factors, "summary": summary}

    def summarize_facility_counts(self, nearby: Dict[str, List[Dict[str, Any]]], radius_km: float = 1.0) -> Dict[str, Any]:
        """Compute group-wise facility counts within a given radius and return counts and a user-friendly summary."""
        def count_within(items: List[Dict[str, Any]]) -> int:
            return sum(1 for i in items if i.get('distance_km') is not None and i['distance_km'] <= radius_km)
        hospitals = count_within(nearby.get('hospitals', []))
        supermarkets = count_within(nearby.get('supermarkets', []))
        pharmacies = count_within(nearby.get('pharmacies', []))
        education = count_within(nearby.get('schools', [])) + count_within(nearby.get('universities', []))
        transport = count_within(nearby.get('bus_stations', [])) + count_within(nearby.get('train_stations', []))
        safety = count_within(nearby.get('police', [])) + count_within(nearby.get('fire_stations', []))
        roads = count_within(nearby.get('roads', []))

        counts = {
            'hospitals': hospitals,
            'supermarkets': supermarkets,
            'pharmacies': pharmacies,
            'education': education,
            'transport': transport,
            'safety_services': safety,
            'major_roads': roads
        }

        parts: List[str] = []
        if hospitals:
            parts.append(f"{hospitals} hospital(s)")
        if supermarkets:
            parts.append(f"{supermarkets} supermarket(s)")
        if pharmacies:
            parts.append(f"{pharmacies} pharmacy(ies)")
        if education:
            parts.append(f"{education} education center(s)")
        if transport:
            parts.append(f"{transport} transport hub(s)")
        if safety:
            parts.append(f"{safety} safety service(s)")
        if roads:
            parts.append(f"{roads} major road(s)")

        summary = f"Within {radius_km} km: " + (", ".join(parts) if parts else "No major facilities detected")
        return {'counts': counts, 'summary': summary}
    
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
            # Provide a slightly more informative summary referencing the score
            loc = ''
            if city:
                loc = f" in {city}"
                if district:
                    loc += f" - {district}"
            score_pct = int(location_score * 100) if isinstance(location_score, (int, float)) else None
            score_text = f" (Score: {score_pct}%)" if score_pct is not None else ''
            # Clear, user-focused summary with guidance
            return (
                f"Location has a low score{score_text}. "
                f"This indicates limited nearby amenities (schools, hospitals, transport) and/or higher local risks. "
                f"Check the 'Nearby facilities' and 'Risk Assessment' sections to see which factors affect this location and whether they matter for your decision."
            )
    
    def _generate_provenance(self, lat: float, lon: float, city: str = None, district: str = None) -> List[Dict]:
        """Generate provenance information for location analysis with real links"""
        provenance = []
        
        if city:
            city_slug = city.replace(' ', '_')
            provenance.append({
                "doc_id": f"Wikipedia - {city}",
                "source": "Wikipedia",
                "snippet": f"General information about {city}, Sri Lanka.",
                "link": f"https://en.wikipedia.org/wiki/{city_slug}",
                "confidence": 0.9
            })
        
        if district:
            q = f"{district} Sri Lanka district"
            provenance.append({
                "doc_id": f"District Profile - {district}",
                "source": "Web Search",
                "snippet": f"Overview and stats for {district} District, Sri Lanka.",
                "link": f"https://www.google.com/search?q={q.replace(' ', '+')}",
                "confidence": 0.85
            })
        
        if lat and lon:
            lat_str = f"{lat:.6f}"
            lon_str = f"{lon:.6f}"
            provenance.append({
                "doc_id": "OpenStreetMap View",
                "source": "OpenStreetMap",
                "snippet": f"Map view centered at coordinates {lat_str}, {lon_str}.",
                "link": f"https://www.openstreetmap.org/#map=16/{lat_str}/{lon_str}",
                "confidence": 0.8
            })
            provenance.append({
                "doc_id": "Google Maps",
                "source": "Google Maps",
                "snippet": "Interactive map and nearby amenities.",
                "link": f"https://www.google.com/maps/@{lat_str},{lon_str},16z",
                "confidence": 0.8
            })
        
        provenance.append({
            "doc_id": "Sri Lanka Real Estate Insights",
            "source": "Market Data",
            "snippet": "General trends and references for Sri Lankan property market.",
            "link": "https://www.google.com/search?q=sri+lanka+real+estate+market+trends",
            "confidence": 0.7
        })
        
        return provenance
