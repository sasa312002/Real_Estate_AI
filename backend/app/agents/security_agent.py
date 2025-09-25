import logging
import re
from typing import Dict, List, Any
import html

logger = logging.getLogger(__name__)

class SecurityAgent:
    def __init__(self):
        # Patterns for potentially harmful content
        self.toxicity_patterns = [
            r'\b(kill|hate|attack|destroy|harm)\b',
            r'\b(racist|sexist|discriminatory)\b',
            r'\b(illegal|unlawful|criminal)\b'
        ]
        
        # PII patterns
        self.pii_patterns = [
            r'\b\d{3}-\d{2}-\d{4}\b',  # SSN
            r'\b\d{10,11}\b',  # Phone numbers
            r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',  # Email
            r'\b\d{1,5}\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr)\b',  # Address
        ]
        
        # Compile patterns for efficiency
        self.toxicity_regex = re.compile('|'.join(self.toxicity_patterns), re.IGNORECASE)
        self.pii_regex = re.compile('|'.join(self.pii_patterns), re.IGNORECASE)
        # Sri Lanka major city whitelist (can be expanded)
        self.sri_lanka_cities = {
            # Western Province
            'colombo','dehiwala','mount lavinia','moratuwa','kesbewa','maharagama','kotte','kaduwela','homagama','pannipitiya','padukka','battaramulla','ragama','ja-ela','negombo','katunayake','seeduwa','wattala','kelaniya','kiribathgoda','pitipana',
            # Central Province
            'kandy','gampola','nawalapitiya','katugastota','peradeniya','matale','dambulla','nuwara eliya','hatton','talawakele','bandarawela','haputale',
            # Southern Province
            'galle','matara','weligama','hambantota','tangalle','ambalangoda','hikkaduwa','hakmana','tissamaharama',
            # Northern Province
            'jaffna','kachchativu','mannar','kilinochchi','vavuniya','point pedro','chavakachcheri','mulaitivu',
            # Eastern Province
            'trincomalee','batticaloa','kalmunai','ampara','kattankudy','eravur','valachchenai','kalkudah','sainthamaruthu',
            # North Western
            'kurunegala','kuliyapitiya','narammala','pannala','puttalam','chilaw','wennappuwa','anamaduwa','maho',
            # North Central
            'anuradhapura','polonnaruwa','hingurakgoda','medirigiriya',
            # Uva
            'badulla','bandarawela','monaragala','bibile','welimada',
            # Sabaragamuwa
            'ratnapura','balangoda','kegalle','mawanella'
        }
    
    def sanitize_input(self, text: str) -> str:
        """
        Sanitize user input to prevent injection attacks and remove harmful content.
        Returns: sanitized text
        """
        if not text:
            return ""
        
        try:
            # Remove HTML tags
            sanitized = html.escape(text)
            
            # Remove potentially harmful patterns
            sanitized = self.toxicity_regex.sub('[REDACTED]', sanitized)
            
            # Remove PII
            sanitized = self.pii_regex.sub('[PII_REDACTED]', sanitized)
            
            # Remove excessive whitespace
            sanitized = re.sub(r'\s+', ' ', sanitized).strip()
            
            # Limit length
            if len(sanitized) > 10000:
                sanitized = sanitized[:10000] + "... [TRUNCATED]"
            
            return sanitized
            
        except Exception as e:
            logger.error(f"Error in input sanitization: {e}")
            return "[INPUT_SANITIZATION_ERROR]"
    
    def filter_output(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Filter output payload to ensure it's safe and appropriate.
        Returns: filtered payload
        """
        if not payload:
            return {}
        
        try:
            filtered = payload.copy()
            
            # Recursively filter nested structures
            filtered = self._filter_recursive(filtered)
            
            # Ensure provenance is preserved
            if 'provenance' in filtered:
                filtered['provenance'] = self._sanitize_provenance(filtered['provenance'])
            
            # Add security metadata
            filtered['_security'] = {
                'filtered_at': '2024-01-01T00:00:00Z',
                'version': '1.0'
            }
            
            return filtered
            
        except Exception as e:
            logger.error(f"Error in output filtering: {e}")
            return {
                'error': 'Output filtering failed',
                'original_payload': str(payload)[:100] + '...' if len(str(payload)) > 100 else str(payload)
            }
    
    def _filter_recursive(self, obj: Any) -> Any:
        """Recursively filter objects to remove harmful content"""
        if isinstance(obj, dict):
            return {k: self._filter_recursive(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [self._filter_recursive(item) for item in obj]
        elif isinstance(obj, str):
            return self.sanitize_input(obj)
        else:
            return obj
    
    def _sanitize_provenance(self, provenance: List[Dict]) -> List[Dict]:
        """Sanitize provenance information while preserving essential data"""
        if not provenance:
            return []
        
        sanitized = []
        for item in provenance:
            if isinstance(item, dict):
                sanitized_item = {
                    'doc_id': str(item.get('doc_id', '')),
                    'snippet': self.sanitize_input(str(item.get('snippet', ''))),
                    'link': item.get('link') if self._is_safe_url(item.get('link')) else None
                }
                sanitized.append(sanitized_item)
        
        return sanitized
    
    def _is_safe_url(self, url: str) -> bool:
        """Check if URL is safe (basic validation)"""
        if not url:
            return False
        
        # Basic URL safety checks
        safe_schemes = ['http', 'https']
        safe_domains = ['example.com', 'trusted-domain.com']  # Add trusted domains
        
        try:
            # Simple URL parsing
            if '://' in url:
                scheme, rest = url.split('://', 1)
                if scheme.lower() not in safe_schemes:
                    return False
                
                # Check domain (basic)
                domain = rest.split('/')[0].split(':')[0]
                if not any(safe_domain in domain for safe_domain in safe_domains):
                    return False
            else:
                # Relative URLs are generally safe
                return True
                
            return True
            
        except Exception:
            return False
    
    def validate_query_features(self, features: Dict) -> Dict[str, Any]:
        """
        Validate and sanitize query features.
        Returns: {is_valid, sanitized_features, errors}
        """
        errors = []
        sanitized = {}
        
        try:
            # Validate required fields
            required_fields = ['city', 'asking_price']
            for field in required_fields:
                if field not in features or features[field] is None:
                    errors.append(f"Missing required field: {field}")
            
            # City validation (Sri Lanka cities only)
            city_raw = features.get('city')
            if city_raw:
                city_clean = self.sanitize_input(str(city_raw)).strip()
                city_key = city_clean.lower()
                if city_key not in self.sri_lanka_cities:
                    errors.append("Invalid city: not recognized as a Sri Lankan city")
                else:
                    sanitized['city'] = city_clean.title()
            
            # Validate numeric fields
            numeric_fields = ['lat', 'lon', 'beds', 'baths', 'area', 'year_built', 'asking_price']
            for field in numeric_fields:
                if field in features and features[field] is not None:
                    try:
                        value = float(features[field])
                        # Add reasonable bounds
                        if field in ['lat', 'lon']:
                            if not (-90 <= value <= 90):
                                errors.append(f"Invalid {field}: must be between -90 and 90")
                        elif field in ['beds', 'baths']:
                            if not (0 <= value <= 20):
                                errors.append(f"Invalid {field}: must be between 0 and 20")
                        elif field == 'area':
                            if not (0 < value <= 100000):
                                errors.append(f"Invalid {field}: must be between 0 and 100,000")
                        elif field == 'year_built':
                            if not (1800 <= value <= 2030):
                                errors.append(f"Invalid {field}: must be between 1800 and 2030")
                        elif field == 'asking_price':
                            if not (0 < value):
                                errors.append(f"Invalid {field}: must be greater than 0")
                        
                        sanitized[field] = value
                    except (ValueError, TypeError):
                        errors.append(f"Invalid {field}: must be a number")
            
            is_valid = len(errors) == 0
            
            return {
                'is_valid': is_valid,
                'sanitized_features': sanitized,
                'errors': errors
            }
            
        except Exception as e:
            logger.error(f"Error in feature validation: {e}")
            return {
                'is_valid': False,
                'sanitized_features': {},
                'errors': [f"Validation error: {str(e)}"]
            }

