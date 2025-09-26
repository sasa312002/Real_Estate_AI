#!/usr/bin/env python3
"""
Test script for the AI-powered Price Agent
"""

import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.agents.price_agent import PriceAgent

def test_price_estimation():
    """Test the AI-powered price estimation"""
    print("Testing AI-Powered Price Agent")
    print("=" * 50)
    
    # Initialize the price agent
    agent = PriceAgent()
    
    # Test case 1: Modern house in Colombo
    print("\nTest 1: Modern House in Colombo")
    print("-" * 30)
    features1 = {
        'area': 2500,
        'beds': 4,
        'baths': 3,
        'year_built': 2020,
        'city': 'Colombo',
        'district': 'Colombo 3',
        'property_type': 'House',
        'land_size': 3000
    }
    
    result1 = agent.estimate_price(features1)
    print(f"Property Details: {features1}")
    print(f"Estimated Price: LKR {result1['estimated_price']:,.2f}")
    print(f"Price per sqft: LKR {result1['price_per_sqft']:,.2f}")
    print(f"Confidence: {result1['confidence']:.2f}")
    if 'reasoning' in result1:
        print(f"Reasoning: {result1['reasoning']}")
    if 'key_factors' in result1:
        print(f"Key Factors: {', '.join(result1['key_factors'])}")
    
    # Test case 2: Apartment in Kandy
    print("\nTest 2: Apartment in Kandy")
    print("-" * 30)
    features2 = {
        'area': 1200,
        'beds': 2,
        'baths': 2,
        'year_built': 2015,
        'city': 'Kandy',
        'property_type': 'Apartment'
    }
    
    result2 = agent.estimate_price(features2)
    print(f"Property Details: {features2}")
    print(f"Estimated Price: LKR {result2['estimated_price']:,.2f}")
    print(f"Price per sqft: LKR {result2['price_per_sqft']:,.2f}")
    print(f"Confidence: {result2['confidence']:.2f}")
    if 'reasoning' in result2:
        print(f"Reasoning: {result2['reasoning']}")
    if 'key_factors' in result2:
        print(f"Key Factors: {', '.join(result2['key_factors'])}")
    
    # Test case 3: Villa in Galle
    print("\nTest 3: Villa in Galle")
    print("-" * 30)
    features3 = {
        'area': 3500,
        'beds': 5,
        'baths': 4,
        'year_built': 2018,
        'city': 'Galle',
        'district': 'Unawatuna',
        'property_type': 'Villa',
        'land_size': 5000
    }
    
    result3 = agent.estimate_price(features3)
    print(f"Property Details: {features3}")
    print(f"Estimated Price: LKR {result3['estimated_price']:,.2f}")
    print(f"Price per sqft: LKR {result3['price_per_sqft']:,.2f}")
    print(f"Confidence: {result3['confidence']:.2f}")
    if 'reasoning' in result3:
        print(f"Reasoning: {result3['reasoning']}")
    if 'key_factors' in result3:
        print(f"Key Factors: {', '.join(result3['key_factors'])}")
    
    print("\n" + "=" * 50)
    print("Testing completed!")
    
    # Check if AI model is available
    if agent.model:
        print("✅ AI model (Gemini) is available and being used")
    else:
        print("⚠️  AI model not available, using fallback logic")
        print("   To enable AI reasoning, set GEMINI_API_KEY in your .env file")

if __name__ == "__main__":
    test_price_estimation()