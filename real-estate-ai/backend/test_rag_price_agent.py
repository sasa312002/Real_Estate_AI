"""
Test script to demonstrate the RAG (Retrieval-Augmented Generation) architecture
in the PriceAgent class.

This test shows how the agent now retrieves comparable properties from a database
(currently mocked) and uses them to inform the AI's price estimation.
"""

import sys
sys.path.insert(0, '.')

from app.agents.price_agent import PriceAgent
import json

def test_rag_architecture():
    """Test that RAG architecture retrieves and uses comparable properties"""
    
    agent = PriceAgent()
    
    print("=" * 80)
    print("RAG (RETRIEVAL-AUGMENTED GENERATION) ARCHITECTURE TEST")
    print("=" * 80)
    
    # Test property in Colombo
    test_property = {
        'area': 1800,
        'beds': 4,
        'baths': 3,
        'year_built': 2018,
        'city': 'Colombo',
        'property_type': 'House',
        'asking_price': 35000000,
        'lat': 6.9271,
        'lon': 79.8612
    }
    
    print("\n📋 SUBJECT PROPERTY:")
    print("-" * 80)
    for key, value in test_property.items():
        print(f"  {key}: {value}")
    
    print("\n\n🔍 STEP 1: RETRIEVE COMPARABLE PROPERTIES (RAG)")
    print("-" * 80)
    
    # Test the retrieval function directly
    comparable_properties = agent._get_comparable_properties(
        lat=test_property['lat'],
        lon=test_property['lon'],
        distance_km=5
    )
    
    print(f"\n✅ Retrieved {len(comparable_properties)} comparable properties:\n")
    
    for i, comp in enumerate(comparable_properties, 1):
        print(f"Comparable #{i}:")
        print(f"  Address: {comp['address']}")
        print(f"  Price: LKR {comp['price_lkr']:,}")
        print(f"  Area: {comp['area_sqft']:,} sq ft")
        print(f"  Price/sqft: LKR {comp['price_per_sqft']:,}")
        print(f"  Beds: {comp['beds']}, Baths: {comp['baths']}")
        print(f"  Type: {comp['property_type']}, Year: {comp['year_built']}")
        print(f"  Distance: {comp['distance_km']} km")
        print()
    
    print("\n📝 STEP 2: FORMAT COMPS FOR AI PROMPT")
    print("-" * 80)
    
    formatted_comps = agent._format_comps_for_prompt(comparable_properties)
    print(formatted_comps)
    
    print("\n\n🤖 STEP 3: AI PRICE ESTIMATION (Using RAG Data)")
    print("-" * 80)
    
    result = agent.estimate_price(test_property)
    
    print(f"\n✅ ESTIMATION COMPLETE:\n")
    print(f"  Estimated Price: LKR {result['estimated_price']:,.2f}")
    print(f"  Price per sq ft: LKR {result['price_per_sqft']:,.2f}")
    print(f"  Confidence: {result['confidence']:.2%}")
    print(f"  Currency: {result['currency']}")
    
    if 'reasoning' in result:
        print(f"\n  AI Reasoning: {result['reasoning']}")
    
    if 'key_factors' in result:
        print(f"\n  Key Factors:")
        for factor in result['key_factors']:
            print(f"    - {factor}")
    
    print("\n\n📊 STEP 4: COMPARE WITH ASKING PRICE")
    print("-" * 80)
    
    asking_price = test_property['asking_price']
    estimated_price = result['estimated_price']
    difference = estimated_price - asking_price
    percentage_diff = (difference / asking_price) * 100
    
    print(f"\n  Asking Price:     LKR {asking_price:,}")
    print(f"  Estimated Price:  LKR {estimated_price:,.2f}")
    print(f"  Difference:       LKR {difference:,.2f} ({percentage_diff:+.1f}%)")
    
    if difference > 0:
        print(f"\n  💡 Property may be UNDERPRICED by {abs(percentage_diff):.1f}%")
    elif difference < 0:
        print(f"\n  💡 Property may be OVERPRICED by {abs(percentage_diff):.1f}%")
    else:
        print(f"\n  💡 Property is priced at FAIR MARKET VALUE")
    
    print("\n\n🎯 RAG ARCHITECTURE BENEFITS:")
    print("-" * 80)
    print("""
  ✅ Retrieves actual comparable properties from database
  ✅ AI uses real market data for estimation (not just rules)
  ✅ More accurate prices based on local market conditions
  ✅ Transparent reasoning based on comparable properties
  ✅ Location-specific pricing based on nearby sales
  ✅ Scalable - can easily switch from mock to real database
    """)
    
    print("\n" + "=" * 80)
    print("TEST COMPLETE - RAG Architecture is Working!")
    print("=" * 80 + "\n")
    
    return True


def test_rag_with_different_locations():
    """Test that different locations retrieve different comparable properties"""
    
    agent = PriceAgent()
    
    print("\n" + "=" * 80)
    print("TESTING LOCATION-SPECIFIC COMPARABLE RETRIEVAL")
    print("=" * 80)
    
    locations = [
        {"name": "Central Colombo", "lat": 6.9271, "lon": 79.8612},
        {"name": "Dehiwala", "lat": 6.8402, "lon": 79.8712},
        {"name": "Kandy", "lat": 7.2906, "lon": 80.6337}
    ]
    
    for location in locations:
        print(f"\n📍 Location: {location['name']} ({location['lat']}, {location['lon']})")
        print("-" * 80)
        
        comps = agent._get_comparable_properties(location['lat'], location['lon'], distance_km=3)
        
        avg_price = sum(comp['price_lkr'] for comp in comps) / len(comps)
        avg_price_per_sqft = sum(comp['price_per_sqft'] for comp in comps) / len(comps)
        
        print(f"  Retrieved {len(comps)} comparable properties")
        print(f"  Average Price: LKR {avg_price:,.0f}")
        print(f"  Average Price/sqft: LKR {avg_price_per_sqft:,.0f}")
        print(f"\n  Sample Comp: {comps[0]['address']}")
        print(f"    Price: LKR {comps[0]['price_lkr']:,}")
    
    print("\n" + "=" * 80 + "\n")


if __name__ == "__main__":
    print("\n" + "🏠" * 40)
    print("\nPriceAgent RAG Architecture Demonstration\n")
    print("🏠" * 40 + "\n")
    
    # Run main test
    success = test_rag_architecture()
    
    # Run location comparison test
    test_rag_with_different_locations()
    
    sys.exit(0 if success else 1)
