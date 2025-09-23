#!/usr/bin/env python3
"""
Test Script for Land Details Analysis using Gemini AI
Sri Lanka Real Estate AI Platform
"""

import asyncio
import json
from app.agents.deal_agent import DealAgent
from app.agents.location_agent import LocationAgent
from app.agents.price_agent import PriceAgent

async def test_land_analysis():
    """Test the complete land analysis pipeline"""
    
    print("🏞️ Testing Land Details Analysis with Gemini AI")
    print("=" * 60)
    
    # Initialize agents
    deal_agent = DealAgent()
    location_agent = LocationAgent()
    price_agent = PriceAgent()
    
    # Test property data (Colombo 3 example)
    test_property = {
        "city": "Colombo",
        "district": "Colombo 3",
        "lat": 6.9271,
        "lon": 79.8612,
        "beds": 3,
        "baths": 2,
        "area": 1200,
        "year_built": 2015,
        "asking_price": 45000000,
        "property_type": "House",
        "land_size": 500
    }
    
    print(f"📍 Property: {test_property['property_type']} in {test_property['city']} - {test_property['district']}")
    print(f"🏠 Size: {test_property['area']} sq ft | Land: {test_property['land_size']} sq ft")
    print(f"💰 Asking Price: LKR {test_property['asking_price']:,}")
    print()
    
    try:
        # 1. Price Analysis
        print("1️⃣ Running Price Analysis...")
        price_result = price_agent.estimate_price(test_property)
        print(f"   Estimated Value: LKR {price_result['estimated_price']:,}")
        print(f"   Price per Sq Ft: LKR {price_result['price_per_sqft']:,}")
        print(f"   Confidence: {price_result['confidence']:.1%}")
        print()
        
        # 2. Location Analysis
        print("2️⃣ Running Location Analysis...")
        location_result = location_agent.analyze_location(
            test_property['lat'],
            test_property['lon'],
            test_property['city'],
            test_property['district']
        )
        print(f"   Location Score: {location_result['score']:.1%}")
        print(f"   Summary: {location_result['summary']}")
        print(f"   Key Features: {', '.join(location_result['bullets'][:3])}")
        print()
        
        # 3. Land Details Analysis (Gemini AI)
        print("3️⃣ Running Land Details Analysis with Gemini AI...")
        land_details = deal_agent.analyze_land_details(
            test_property,
            location_result,
            test_property['asking_price'],
            price_result['estimated_price']
        )
        
        if 'parsing_error' in land_details:
            print("   ⚠️  AI Response (Text Format):")
            print(f"   {land_details['land_analysis']}")
        else:
            print("   ✅ AI Analysis Results:")
            print(f"   Development Potential: {land_details.get('development_potential', 'N/A')}")
            print(f"   Land Use Opportunities: {', '.join(land_details.get('land_use_opportunities', []))}")
            print(f"   Investment Timeline: {land_details.get('investment_timeline', 'N/A')}")
            print(f"   ROI Projection: {land_details.get('roi_projection', 'N/A')}")
            print()
            print("   📋 Detailed Analysis:")
            print(f"   {land_details.get('land_analysis', 'N/A')}")
            print()
            print("   🎯 Recommendation:")
            print(f"   {land_details.get('recommendation', 'N/A')}")
            print()
            print("   📝 Next Steps:")
            for i, step in enumerate(land_details.get('next_steps', []), 1):
                print(f"   {i}. {step}")
        
        # 4. Deal Evaluation
        print("4️⃣ Running Deal Evaluation...")
        deal_result = deal_agent.evaluate_deal(
            test_property['asking_price'],
            price_result['estimated_price'],
            location_result['score']
        )
        print(f"   Verdict: {deal_result['verdict']}")
        print(f"   Reasoning: {deal_result['why']}")
        print(f"   Confidence: {deal_result['confidence']:.1%}")
        print()
        
        # 5. Complete Analysis Summary
        print("🎯 Complete Analysis Summary:")
        print("=" * 60)
        print(f"Property: {test_property['property_type']} in {test_property['city']} - {test_property['district']}")
        print(f"Land Size: {test_property['land_size']} sq ft")
        print(f"Asking Price: LKR {test_property['asking_price']:,}")
        print(f"Estimated Value: LKR {price_result['estimated_price']:,}")
        print(f"Location Score: {location_result['score']:.1%}")
        print(f"Deal Verdict: {deal_result['verdict']}")
        print(f"Development Potential: {land_details.get('development_potential', 'N/A')}")
        
        # Calculate discount/premium
        price_ratio = test_property['asking_price'] / price_result['estimated_price']
        if price_ratio < 1:
            discount = (1 - price_ratio) * 100
            print(f"Price Discount: {discount:.1f}% below market value")
        else:
            premium = (price_ratio - 1) * 100
            print(f"Price Premium: {premium:.1f}% above market value")
        
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ Error during analysis: {e}")
        import traceback
        traceback.print_exc()

async def test_different_property_types():
    """Test different property types for land analysis"""
    
    print("\n🏗️ Testing Different Property Types")
    print("=" * 60)
    
    deal_agent = DealAgent()
    location_agent = LocationAgent()
    
    test_cases = [
        {
            "name": "Beach Land - Galle",
            "features": {
                "city": "Galle",
                "district": "Unawatuna",
                "lat": 6.0535,
                "lon": 80.2210,
                "property_type": "Land",
                "land_size": 2000,
                "asking_price": 15000000
            }
        },
        {
            "name": "Tea Estate - Nuwara Eliya",
            "features": {
                "city": "Nuwara Eliya",
                "district": "Hill Station",
                "lat": 6.9708,
                "lon": 80.7829,
                "property_type": "Tea Estate",
                "land_size": 10000,
                "asking_price": 50000000
            }
        },
        {
            "name": "Commercial Land - Colombo 1",
            "features": {
                "city": "Colombo",
                "district": "Colombo 1",
                "lat": 6.9271,
                "lon": 79.8612,
                "property_type": "Commercial",
                "land_size": 800,
                "asking_price": 80000000
            }
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n{i}️⃣ {test_case['name']}")
        print("-" * 40)
        
        try:
            # Location analysis
            location_result = location_agent.analyze_location(
                test_case['features']['lat'],
                test_case['features']['lon'],
                test_case['features']['city'],
                test_case['features']['district']
            )
            
            # Land analysis
            land_details = deal_agent.analyze_land_details(
                test_case['features'],
                location_result,
                test_case['features']['asking_price'],
                test_case['features']['asking_price'] * 1.2  # Mock estimated value
            )
            
            print(f"   Location Score: {location_result['score']:.1%}")
            print(f"   Development Potential: {land_details.get('development_potential', 'N/A')}")
            print(f"   Land Use: {', '.join(land_details.get('land_use_opportunities', [])[:3])}")
            print(f"   Investment Timeline: {land_details.get('investment_timeline', 'N/A')}")
            
        except Exception as e:
            print(f"   ❌ Error: {e}")

if __name__ == "__main__":
    print("🚀 Starting Land Details Analysis Test")
    print("Make sure your .env file has GEMINI_API_KEY set!")
    print()
    
    # Run the main test
    asyncio.run(test_land_analysis())
    
    # Run property type tests
    asyncio.run(test_different_property_types())
    
    print("\n✅ Test completed!")
    print("Check the output above for detailed land analysis results.")
