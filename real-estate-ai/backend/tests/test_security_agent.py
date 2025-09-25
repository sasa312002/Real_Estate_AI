import pytest
from app.agents.security_agent import SecurityAgent

@pytest.fixture
def security_agent():
    return SecurityAgent()

def test_sanitize_input_basic(security_agent):
    """Test basic input sanitization"""
    input_text = "Hello, world!"
    result = security_agent.sanitize_input(input_text)
    assert result == "Hello, world!"

def test_sanitize_input_html(security_agent):
    """Test HTML tag removal"""
    input_text = "<script>alert('xss')</script>Hello"
    result = security_agent.sanitize_input(input_text)
    assert "<script>" not in result
    assert "Hello" in result

def test_sanitize_input_toxicity(security_agent):
    """Test toxicity pattern removal"""
    input_text = "This is a hate message"
    result = security_agent.sanitize_input(input_text)
    assert "hate" not in result
    assert "[REDACTED]" in result

def test_sanitize_input_pii(security_agent):
    """Test PII removal"""
    input_text = "My email is test@example.com and phone is 123-456-7890"
    result = security_agent.sanitize_input(input_text)
    assert "test@example.com" not in result
    assert "123-456-7890" not in result
    assert "[PII_REDACTED]" in result

def test_sanitize_input_empty(security_agent):
    """Test empty input handling"""
    result = security_agent.sanitize_input("")
    assert result == ""
    
    result = security_agent.sanitize_input(None)
    assert result == ""

def test_sanitize_input_long(security_agent):
    """Test long input truncation"""
    long_text = "A" * 15000
    result = security_agent.sanitize_input(long_text)
    assert len(result) <= 10000
    assert "[TRUNCATED]" in result

def test_filter_output_basic(security_agent):
    """Test basic output filtering"""
    payload = {"message": "Hello", "data": [1, 2, 3]}
    result = security_agent.filter_output(payload)
    
    assert "message" in result
    assert "data" in result
    assert "_security" in result

def test_filter_output_with_provenance(security_agent):
    """Test output filtering with provenance"""
    payload = {
        "provenance": [
            {"doc_id": "doc1", "snippet": "Test snippet", "link": "http://example.com"}
        ]
    }
    result = security_agent.filter_output(payload)
    
    assert "provenance" in result
    assert len(result["provenance"]) == 1
    assert result["provenance"][0]["doc_id"] == "doc1"

def test_validate_query_features_valid(security_agent):
    """Test valid feature validation"""
    features = {
        "city": "Colombo",
        "asking_price": 200000,
        "beds": 3,
        "baths": 2,
        "area": 1200,
        "year_built": 2015
    }
    
    result = security_agent.validate_query_features(features)
    
    assert result["is_valid"] is True
    assert "sanitized_features" in result
    assert len(result["errors"]) == 0

def test_validate_query_features_missing_required(security_agent):
    """Test validation with missing required fields"""
    features = {"beds": 3}
    
    result = security_agent.validate_query_features(features)
    
    assert result["is_valid"] is False
    assert "city" in result["errors"][0]
    assert "asking_price" in result["errors"][1]

def test_validate_query_features_invalid_values(security_agent):
    """Test validation with invalid values"""
    features = {
        "city": "Colombo",
        "asking_price": -1000,  # Invalid negative price
        "beds": 25,  # Invalid number of beds
        "lat": 100  # Invalid latitude
    }
    
    result = security_agent.validate_query_features(features)
    
    assert result["is_valid"] is False
    assert len(result["errors"]) > 0

def test_validate_query_features_sanitization(security_agent):
    """Test feature sanitization"""
    features = {
        "city": "Colombo<script>alert('xss')</script>",
        "asking_price": 200000
    }
    
    result = security_agent.validate_query_features(features)
    
    assert result["is_valid"] is True
    sanitized_city = result["sanitized_features"]["city"]
    assert "<script>" not in sanitized_city

