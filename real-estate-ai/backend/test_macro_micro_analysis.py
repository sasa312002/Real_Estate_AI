"""
Test script to demonstrate the Two-Step Macro-Micro Analysis in PriceAgent.

This test shows how the AI now performs:
1. MACRO ANALYSIS: Classifies the area (Prime Urban vs Rural) and sets baseline
2. MICRO ANALYSIS: Uses comparable properties to fine-tune within the baseline

Expected behavior: 
- Colombo 7 (Prime Urban) should have a MUCH HIGHER baseline than Welimada (Rural)
- Even with identical property features, prices should reflect macro-environment
"""

import sys
sys.path.insert(0, '.')

from app.agents.price_agent import PriceAgent

def test_macro_micro_analysis():
    """Test that macro analysis creates appropriate baseline differences"""
    
    agent = PriceAgent()
    
    print("=" * 100)
    print("TWO-STEP MACRO-MICRO ANALYSIS TEST")
    print("=" * 100)
    
    # Test Case 1: PRIME URBAN - Colombo 7
    colombo_property = {
        'area': 1800,
        'beds': 4,
        'baths': 3,
        'year_built': 2018,
        'city': 'Colombo',
        'district': 'Colombo',
        'property_type': 'House',
        'asking_price': 75000000,
        'lat': 6.9271,
        'lon': 79.8612
    }
    
    # Test Case 2: RURAL AGRICULTURAL - Welimada
    welimada_property = {
        'area': 1800,  # SAME as Colombo
        'beds': 4,     # SAME as Colombo
        'baths': 3,    # SAME as Colombo
        'year_built': 2018,  # SAME as Colombo
        'city': 'Welimada',
        'district': 'Badulla',
        'property_type': 'House',
        'asking_price': 18000000,
        'lat': 6.9000,
        'lon': 80.9000
    }
    
    # Test Case 3: SUBURBAN - Nugegoda
    nugegoda_property = {
        'area': 1800,
        'beds': 4,
        'baths': 3,
        'year_built': 2018,
        'city': 'Nugegoda',
        'district': 'Colombo',
        'property_type': 'House',
        'asking_price': 45000000,
        'lat': 6.8649,
        'lon': 79.8997
    }
    
    print("\n" + "━" * 100)
    print("TEST CASE 1: PRIME URBAN AREA - COLOMBO 7")
    print("━" * 100)
    print("\n📋 Property Details:")
    print(f"  Location: {colombo_property['city']}, {colombo_property['district']}")
    print(f"  Coordinates: ({colombo_property['lat']}, {colombo_property['lon']})")
    print(f"  Area: {colombo_property['area']} sq ft")
    print(f"  Beds/Baths: {colombo_property['beds']}/{colombo_property['baths']}")
    print(f"  Year Built: {colombo_property['year_built']}")
    print(f"  Asking Price: LKR {colombo_property['asking_price']:,}")
    
    print("\n🔍 Running AI Analysis with Macro-Micro Framework...")
    colombo_result = agent.estimate_price(colombo_property)
    
    print(f"\n✅ ESTIMATION COMPLETE:")
    print(f"  Estimated Price: LKR {colombo_result['estimated_price']:,.2f}")
    print(f"  Price per sq ft: LKR {colombo_result['price_per_sqft']:,.2f}")
    print(f"  Confidence: {colombo_result['confidence']:.2%}")
    
    if 'reasoning' in colombo_result:
        print(f"\n📝 AI Reasoning:\n  {colombo_result['reasoning']}")
    
    if 'key_factors' in colombo_result:
        print(f"\n🎯 Key Factors:")
        for factor in colombo_result['key_factors']:
            print(f"    • {factor}")
    
    print("\n" + "━" * 100)
    print("TEST CASE 2: RURAL AGRICULTURAL AREA - WELIMADA")
    print("━" * 100)
    print("\n📋 Property Details:")
    print(f"  Location: {welimada_property['city']}, {welimada_property['district']}")
    print(f"  Coordinates: ({welimada_property['lat']}, {welimada_property['lon']})")
    print(f"  Area: {welimada_property['area']} sq ft (SAME as Colombo)")
    print(f"  Beds/Baths: {welimada_property['beds']}/{welimada_property['baths']} (SAME as Colombo)")
    print(f"  Year Built: {welimada_property['year_built']} (SAME as Colombo)")
    print(f"  Asking Price: LKR {welimada_property['asking_price']:,}")
    
    print("\n🔍 Running AI Analysis with Macro-Micro Framework...")
    welimada_result = agent.estimate_price(welimada_property)
    
    print(f"\n✅ ESTIMATION COMPLETE:")
    print(f"  Estimated Price: LKR {welimada_result['estimated_price']:,.2f}")
    print(f"  Price per sq ft: LKR {welimada_result['price_per_sqft']:,.2f}")
    print(f"  Confidence: {welimada_result['confidence']:.2%}")
    
    if 'reasoning' in welimada_result:
        print(f"\n📝 AI Reasoning:\n  {welimada_result['reasoning']}")
    
    if 'key_factors' in welimada_result:
        print(f"\n🎯 Key Factors:")
        for factor in welimada_result['key_factors']:
            print(f"    • {factor}")
    
    print("\n" + "━" * 100)
    print("TEST CASE 3: SUBURBAN AREA - NUGEGODA")
    print("━" * 100)
    print("\n📋 Property Details:")
    print(f"  Location: {nugegoda_property['city']}, {nugegoda_property['district']}")
    print(f"  Coordinates: ({nugegoda_property['lat']}, {nugegoda_property['lon']})")
    print(f"  Area: {nugegoda_property['area']} sq ft (SAME as others)")
    print(f"  Beds/Baths: {nugegoda_property['beds']}/{nugegoda_property['baths']} (SAME as others)")
    print(f"  Year Built: {nugegoda_property['year_built']} (SAME as others)")
    print(f"  Asking Price: LKR {nugegoda_property['asking_price']:,}")
    
    print("\n🔍 Running AI Analysis with Macro-Micro Framework...")
    nugegoda_result = agent.estimate_price(nugegoda_property)
    
    print(f"\n✅ ESTIMATION COMPLETE:")
    print(f"  Estimated Price: LKR {nugegoda_result['estimated_price']:,.2f}")
    print(f"  Price per sq ft: LKR {nugegoda_result['price_per_sqft']:,.2f}")
    print(f"  Confidence: {nugegoda_result['confidence']:.2%}")
    
    if 'reasoning' in nugegoda_result:
        print(f"\n📝 AI Reasoning:\n  {nugegoda_result['reasoning']}")
    
    if 'key_factors' in nugegoda_result:
        print(f"\n🎯 Key Factors:")
        for factor in nugegoda_result['key_factors']:
            print(f"    • {factor}")
    
    print("\n" + "=" * 100)
    print("MACRO-ENVIRONMENT COMPARISON")
    print("=" * 100)
    
    print("\n📊 Price Comparison (Identical Properties, Different Locations):\n")
    print(f"  Colombo 7 (Prime Urban):        LKR {colombo_result['estimated_price']:>15,.2f}  |  {colombo_result['price_per_sqft']:>8,.0f} per sq ft")
    print(f"  Nugegoda (Suburban):            LKR {nugegoda_result['estimated_price']:>15,.2f}  |  {nugegoda_result['price_per_sqft']:>8,.0f} per sq ft")
    print(f"  Welimada (Rural Agricultural):  LKR {welimada_result['estimated_price']:>15,.2f}  |  {welimada_result['price_per_sqft']:>8,.0f} per sq ft")
    
    # Calculate price ratios
    if welimada_result['estimated_price'] > 0:
        colombo_to_welimada_ratio = colombo_result['estimated_price'] / welimada_result['estimated_price']
        nugegoda_to_welimada_ratio = nugegoda_result['estimated_price'] / welimada_result['estimated_price']
        
        print(f"\n📈 Price Multipliers (vs Rural Baseline):")
        print(f"  Colombo is {colombo_to_welimada_ratio:.2f}x more expensive than Welimada")
        print(f"  Nugegoda is {nugegoda_to_welimada_ratio:.2f}x more expensive than Welimada")
    
    print("\n" + "=" * 100)
    print("VALIDATION RESULTS")
    print("=" * 100)
    
    # Validate that macro-environment is reflected
    checks = []
    
    # Check 1: Colombo should be significantly more expensive than Welimada
    if colombo_result['estimated_price'] > welimada_result['estimated_price'] * 2:
        checks.append("✅ PASS: Colombo baseline is significantly higher than Welimada")
    else:
        checks.append("❌ FAIL: Colombo should be much more expensive than Welimada")
    
    # Check 2: Nugegoda should be between Colombo and Welimada
    if welimada_result['estimated_price'] < nugegoda_result['estimated_price'] < colombo_result['estimated_price']:
        checks.append("✅ PASS: Nugegoda price falls between Prime Urban and Rural")
    else:
        checks.append("❌ FAIL: Nugegoda should be priced between Colombo and Welimada")
    
    # Check 3: Key factors should include macro environment indicators
    macro_keywords = ['macro', 'environment', 'demand', 'density', 'population', 'urban', 'rural']
    has_macro_factors = any(
        any(keyword.lower() in factor.lower() for keyword in macro_keywords)
        for factor in colombo_result.get('key_factors', [])
    )
    
    if has_macro_factors:
        checks.append("✅ PASS: Key factors include macro-environment considerations")
    else:
        checks.append("❌ FAIL: Key factors should mention macro-environment")
    
    # Check 4: Reasoning should mention macro analysis
    has_macro_reasoning = 'macro' in colombo_result.get('reasoning', '').lower()
    
    if has_macro_reasoning:
        checks.append("✅ PASS: Reasoning includes macro analysis")
    else:
        checks.append("❌ FAIL: Reasoning should explicitly mention macro analysis")
    
    print("\n")
    for check in checks:
        print(f"  {check}")
    
    all_passed = all("✅ PASS" in check for check in checks)
    
    print("\n" + "=" * 100)
    if all_passed:
        print("🎉 ALL TESTS PASSED - Two-Step Macro-Micro Analysis is Working!")
    else:
        print("⚠️  SOME TESTS FAILED - Review the results above")
    print("=" * 100 + "\n")
    
    return all_passed


if __name__ == "__main__":
    print("\n" + "🏘️ " * 45)
    print("\nTwo-Step Macro-Micro Analysis Demonstration")
    print("Testing: Prime Urban vs Suburban vs Rural Agricultural Areas\n")
    print("🏘️ " * 45 + "\n")
    
    success = test_macro_micro_analysis()
    
    sys.exit(0 if success else 1)
