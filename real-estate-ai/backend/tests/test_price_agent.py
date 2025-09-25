import pytest
from app.agents.price_agent import PriceAgent

@pytest.fixture
def price_agent():
    return PriceAgent()

@pytest.fixture
def sample_features():
    return {
        'city': 'Colombo',
        'area': 1200,
        'beds': 3,
        'baths': 2,
        'year_built': 2015
    }

def test_estimate_price_basic(price_agent, sample_features):
    """Test basic price estimation"""
    result = price_agent.estimate_price(sample_features)
    
    assert 'estimated_price' in result
    assert 'confidence' in result
    assert 'features_used' in result
    assert 'comps' in result
    
    assert result['estimated_price'] > 0
    assert 0 <= result['confidence'] <= 1
    assert len(result['features_used']) > 0
    assert len(result['comps']) == 3

def test_estimate_price_with_asking_price(price_agent, sample_features):
    """Test price estimation with asking price"""
    sample_features['asking_price'] = 200000
    result = price_agent.estimate_price(sample_features)
    
    assert result['estimated_price'] > 0
    assert result['confidence'] > 0

def test_estimate_price_missing_features(price_agent):
    """Test price estimation with minimal features"""
    minimal_features = {'city': 'Colombo'}
    result = price_agent.estimate_price(minimal_features)
    
    assert result['estimated_price'] > 0
    assert result['confidence'] < 0.8  # Lower confidence for missing features

def test_city_multipliers(price_agent):
    """Test different city multipliers"""
    features = {'area': 1000, 'beds': 2, 'baths': 1, 'year_built': 2020}
    
    # Test Colombo (higher multiplier)
    features['city'] = 'Colombo'
    colombo_result = price_agent.estimate_price(features)
    
    # Test Jaffna (lower multiplier)
    features['city'] = 'Jaffna'
    jaffna_result = price_agent.estimate_price(features)
    
    assert colombo_result['estimated_price'] > jaffna_result['estimated_price']

def test_error_handling(price_agent):
    """Test error handling with invalid input"""
    result = price_agent.estimate_price({})
    
    assert 'error' in result
    assert result['estimated_price'] == 0
    assert result['confidence'] == 0.1

