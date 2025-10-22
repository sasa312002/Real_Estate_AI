"""
Test script to verify that location changes result in different price estimates.

This script demonstrates that the price estimation now correctly varies based on
location coordinates, even when all other property features remain the same.
"""

import asyncio
import sys
sys.path.insert(0, '.')

from app.agents.price_agent import PriceAgent

def test_location_price_variance():
    """Test that different locations produce different prices"""
    
    agent = PriceAgent()
    
    # Base property features (identical for all tests)
    base_features = {
        'area': 1500,
        'beds': 3,
        'baths': 2,
        'year_built': 2015,
        'city': 'Colombo',
        'property_type': 'House',
        'asking_price': 25000000
    }
    
    # Test Case 1: Central Colombo location
    features_location1 = {
        **base_features,
        'lat': 6.9271,
        'lon': 79.8612
    }
    
    # Test Case 2: Different location in Colombo (same city, different coordinates)
    features_location2 = {
        **base_features,
        'lat': 6.9350,
        'lon': 79.8700
    }
    
    # Test Case 3: Another different location
    features_location3 = {
        **base_features,
        'lat': 6.9100,
        'lon': 79.8500
    }
    
    print("=" * 80)
    print("LOCATION-BASED PRICE VARIANCE TEST")
    print("=" * 80)
    print("\nBase Property Features:")
    print(f"  Area: {base_features['area']} sq ft")
    print(f"  Bedrooms: {base_features['beds']}")
    print(f"  Bathrooms: {base_features['baths']}")
    print(f"  Year Built: {base_features['year_built']}")
    print(f"  City: {base_features['city']}")
    print(f"  Property Type: {base_features['property_type']}")
    print(f"  Asking Price: LKR {base_features['asking_price']:,}")
    print("\n" + "-" * 80)
    
    # Estimate prices for each location
    print("\nTest Case 1 - Central Colombo (6.9271, 79.8612):")
    result1 = agent.estimate_price(features_location1)
    print(f"  Estimated Price: LKR {result1['estimated_price']:,.2f}")
    print(f"  Price per sqft: LKR {result1['price_per_sqft']:,.2f}")
    print(f"  Confidence: {result1['confidence']:.2%}")
    
    print("\nTest Case 2 - Different Location in Colombo (6.9350, 79.8700):")
    result2 = agent.estimate_price(features_location2)
    print(f"  Estimated Price: LKR {result2['estimated_price']:,.2f}")
    print(f"  Price per sqft: LKR {result2['price_per_sqft']:,.2f}")
    print(f"  Confidence: {result2['confidence']:.2%}")
    
    print("\nTest Case 3 - Another Location in Colombo (6.9100, 79.8500):")
    result3 = agent.estimate_price(features_location3)
    print(f"  Estimated Price: LKR {result3['estimated_price']:,.2f}")
    print(f"  Price per sqft: LKR {result3['price_per_sqft']:,.2f}")
    print(f"  Confidence: {result3['confidence']:.2%}")
    
    print("\n" + "-" * 80)
    print("PRICE VARIANCE ANALYSIS:")
    print("-" * 80)
    
    # Calculate price differences
    diff_1_2 = abs(result1['estimated_price'] - result2['estimated_price'])
    diff_1_3 = abs(result1['estimated_price'] - result3['estimated_price'])
    diff_2_3 = abs(result2['estimated_price'] - result3['estimated_price'])
    
    print(f"\nPrice Difference (Location 1 vs 2): LKR {diff_1_2:,.2f}")
    print(f"Price Difference (Location 1 vs 3): LKR {diff_1_3:,.2f}")
    print(f"Price Difference (Location 2 vs 3): LKR {diff_2_3:,.2f}")
    
    # Check if prices are different (success condition)
    prices_are_different = (
        result1['estimated_price'] != result2['estimated_price'] and
        result1['estimated_price'] != result3['estimated_price'] and
        result2['estimated_price'] != result3['estimated_price']
    )
    
    print("\n" + "=" * 80)
    if prices_are_different:
        print("✅ TEST PASSED: Different locations produce different price estimates!")
        print("   The fix is working correctly.")
    else:
        print("❌ TEST FAILED: Prices are the same for different locations!")
        print("   The issue has not been resolved.")
    print("=" * 80)
    
    return prices_are_different


if __name__ == "__main__":
    success = test_location_price_variance()
    sys.exit(0 if success else 1)
