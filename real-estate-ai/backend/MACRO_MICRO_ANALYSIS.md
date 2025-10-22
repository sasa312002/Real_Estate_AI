# Two-Step Macro-Micro Analysis Framework

## Overview

The `PriceAgent` has been enhanced with a sophisticated **Two-Step Macro-Micro Analysis** framework that ensures accurate property valuations across Sri Lanka's diverse geographic and economic landscape.

## The Problem This Solves

### Before: Single-Step Analysis ❌
```
AI receives property details + comparable properties
→ Generates price estimate
→ Problem: No baseline context
→ Rural and urban areas treated similarly
```

**Issues:**
- A house in Colombo 7 (Prime Urban) could be priced too low
- A house in Welimada (Rural) could be priced too high
- No consideration of macro-economic factors
- Baseline price differences not accounted for

### After: Two-Step Macro-Micro Analysis ✅
```
STEP 1: MACRO ANALYSIS
→ Classify area (Prime Urban vs Rural vs Suburban)
→ Assess demand, population density, economic activity
→ Establish baseline price range

STEP 2: MICRO ANALYSIS (RAG)
→ Use comparable properties
→ Fine-tune within baseline range
→ Apply property-specific adjustments
```

**Benefits:**
- ✅ Colombo 7 gets a high baseline (e.g., LKR 40,000-70,000/sq ft)
- ✅ Welimada gets appropriate rural baseline (e.g., LKR 5,000-12,000/sq ft)
- ✅ Comparable properties fine-tune within the correct range
- ✅ Macro-economic context always considered

---

## Two-Step Analysis Framework

### **STEP 1: MACRO ANALYSIS - Baseline Setting**

The AI first analyzes the **macro-environment** to establish a baseline price range.

#### **A. Area Classification**

The AI classifies the location into one of six tiers:

| Tier | Area Type | Examples | Characteristics |
|------|-----------|----------|-----------------|
| 1 | **Prime Urban** | Colombo 3/4/5/7, Kandy Center | Highest demand, premium prices |
| 2 | **Established Urban** | Dehiwala, Nugegoda, Moratuwa | High demand, good infrastructure |
| 3 | **Suburban Residential** | Battaramulla, Rajagiriya, Maharagama | Medium-high demand, residential |
| 4 | **Developing Town** | Gampaha, Negombo, Kurunegala | Medium demand, growing areas |
| 5 | **Rural Residential** | Outskirts of major cities | Medium-low demand |
| 6 | **Rural Agricultural** | Welimada, Hingurakgoda, Villages | Lower demand, agricultural |

#### **B. Demand Assessment**

| Demand Level | Indicators |
|--------------|------------|
| Very High | Prime locations, limited supply, high competition |
| High | Established areas, good amenities |
| Medium | Suburban areas, developing infrastructure |
| Low | Rural areas, limited economic activity |
| Very Low | Remote regions, agricultural focus |

#### **C. Population Density**

| Density Level | Range | Typical Areas |
|---------------|-------|---------------|
| High | >2000 people/km² | Urban centers |
| Medium | 500-2000 people/km² | Suburban areas |
| Low | <500 people/km² | Rural areas |

#### **D. Baseline Price Range**

Based on classification, AI establishes baseline price per sq ft:

```
Prime Urban:          LKR 40,000 - 70,000 / sq ft
Established Urban:    LKR 30,000 - 50,000 / sq ft
Suburban Residential: LKR 20,000 - 35,000 / sq ft
Developing Town:      LKR 15,000 - 25,000 / sq ft
Rural Residential:    LKR 10,000 - 18,000 / sq ft
Rural Agricultural:   LKR  5,000 - 12,000 / sq ft
```

**Critical Rule:** The final estimate MUST fall within this baseline range.

---

### **STEP 2: MICRO ANALYSIS - RAG Fine-Tuning**

After establishing the baseline, the AI uses **Retrieval-Augmented Generation (RAG)** with comparable properties.

#### **A. Comparable Properties Analysis**

```python
# Retrieved comparable properties (5km radius)
Comparable #1: LKR 45M, 1600 sq ft, 4 beds, 2019
Comparable #2: LKR 48M, 1750 sq ft, 4 beds, 2018
Comparable #3: LKR 42M, 1500 sq ft, 3 beds, 2020
```

AI compares:
- Size differences
- Bedroom/bathroom count
- Age and condition
- Property type

#### **B. Position Within Baseline Range**

| Subject Property Status | Position in Range |
|------------------------|-------------------|
| **Better** than comps (newer, larger, better) | **Higher end** of baseline |
| **Similar** to comps | **Middle** of baseline |
| **Worse** than comps (older, smaller) | **Lower end** of baseline |

#### **C. Micro-Location Adjustments (±5-10%)**

Fine-tune based on:
- Proximity to amenities (schools, hospitals, shopping)
- Main road access
- Neighborhood quality
- View, noise levels
- Safety and security

#### **D. Property-Specific Features**

Additional adjustments for:
- Land size
- Parking facilities
- Garden, pool, special amenities
- Recent renovations
- Unique architectural features

---

## Example: Colombo vs Welimada

Let's compare two **identical properties** in different locations:

### Property Specifications (Identical)
- Area: 1,800 sq ft
- Bedrooms: 4
- Bathrooms: 3
- Year Built: 2018
- Property Type: House

### Location 1: Colombo 7 (Prime Urban)

**STEP 1 - MACRO ANALYSIS:**
```
Area Type: Prime Urban
Demand: Very High
Population Density: High Density (>2000/km²)
Baseline Range: LKR 40,000 - 70,000 per sq ft

Baseline Price Range: LKR 72M - 126M
```

**STEP 2 - MICRO ANALYSIS:**
```
Comparable Properties (within 5km):
- Comp #1: LKR 95M, 1,900 sq ft, 4 beds
- Comp #2: LKR 88M, 1,750 sq ft, 4 beds
- Comp #3: LKR 102M, 2,000 sq ft, 5 beds

Subject property is similar to comps
→ Position at MIDDLE of baseline range
→ Apply micro-location adjustments

FINAL ESTIMATE: LKR 92,000,000
(~LKR 51,111 per sq ft - within baseline)
```

### Location 2: Welimada (Rural Agricultural)

**STEP 1 - MACRO ANALYSIS:**
```
Area Type: Rural Agricultural
Demand: Low
Population Density: Low Density (<500/km²)
Baseline Range: LKR 5,000 - 12,000 per sq ft

Baseline Price Range: LKR 9M - 21.6M
```

**STEP 2 - MICRO ANALYSIS:**
```
Comparable Properties (within 5km):
- Comp #1: LKR 14M, 1,850 sq ft, 4 beds
- Comp #2: LKR 12M, 1,700 sq ft, 3 beds
- Comp #3: LKR 16M, 2,100 sq ft, 5 beds

Subject property is similar to comps
→ Position at MIDDLE of baseline range
→ Rural area with good land

FINAL ESTIMATE: LKR 14,400,000
(~LKR 8,000 per sq ft - within baseline)
```

### Price Comparison

| Location | Estimated Price | Price per sq ft | Ratio |
|----------|----------------|-----------------|-------|
| **Colombo 7** | LKR 92,000,000 | 51,111 | 6.4x |
| **Welimada** | LKR 14,400,000 | 8,000 | 1.0x |

**Result:** Colombo property is **6.4 times** more expensive, reflecting macro-environment differences!

---

## JSON Output Format

The AI now returns enhanced output with macro analysis:

```json
{
  "estimated_price": 92000000,
  "confidence": 0.88,
  "reasoning": "Macro Analysis: Colombo 7 is classified as a Prime Urban area with Very High demand and High population density, establishing a baseline of LKR 40,000-70,000 per sq ft. Micro Analysis: Comparable properties in the area range from LKR 88M-102M for similar sizes. The subject property is well-maintained and similar to comps, positioning it at the mid-upper range of the baseline. Final Justification: LKR 92M (~LKR 51,111/sq ft) reflects the prime location and is supported by nearby sales data.",
  "key_factors": [
    "Macro Environment: Prime Urban",
    "Population Density: High Density",
    "Demand Level: Very High",
    "Comparable Properties Analysis",
    "Property Age and Condition",
    "Micro-location Proximity"
  ]
}
```

**Key Changes:**
1. ✅ Reasoning explicitly mentions **Macro Analysis**
2. ✅ Reasoning explains the **baseline range**
3. ✅ Key factors include macro indicators
4. ✅ Two-step process is clear and transparent

---

## Implementation Details

### Enhanced Prompt Structure

```
1. Property Details
   ↓
2. Comparable Properties (RAG data)
   ↓
3. STEP 1: MACRO ANALYSIS
   • Area Classification (6 tiers)
   • Demand Assessment
   • Population Density
   • Establish Baseline Range
   ↓
4. STEP 2: MICRO ANALYSIS
   • Compare with comps
   • Position within baseline
   • Micro-location adjustments
   • Property-specific features
   ↓
5. Final JSON Output
   • estimated_price (within baseline)
   • confidence
   • reasoning (includes macro + micro)
   • key_factors (includes macro indicators)
```

### Critical Rules Enforced

1. **Macro First:** AI MUST classify area before analyzing comps
2. **Baseline Compliance:** Price MUST fall within macro baseline range
3. **Explicit Reasoning:** Must mention both macro and micro steps
4. **Key Factors:** Must include macro environment indicators
5. **No Baseline Violations:** Colombo 7 ≠ Welimada baseline

---

## Testing

Run the comprehensive test:

```bash
cd backend
python test_macro_micro_analysis.py
```

**Test validates:**
- ✅ Colombo baseline significantly higher than Welimada
- ✅ Suburban areas fall between urban and rural
- ✅ Key factors include macro-environment
- ✅ Reasoning mentions macro analysis
- ✅ Identical properties have different prices based on location

---

## Benefits of Two-Step Framework

### 1. **Economic Accuracy**
- Properties priced according to real economic conditions
- Urban premium properly reflected
- Rural areas not overvalued

### 2. **Transparent Reasoning**
- Clear explanation of baseline setting
- Comparable properties used appropriately
- Two-step process is auditable

### 3. **Market Realism**
- Reflects actual Sri Lankan real estate dynamics
- Accounts for population distribution
- Considers demand patterns

### 4. **Prevents Pricing Errors**
- Can't price rural property at urban rates
- Can't underprice prime locations
- Baseline acts as guardrail

### 5. **Scalable**
- Works for any location in Sri Lanka
- Adapts to different area types
- Extensible to other markets

---

## Configuration

The prompt includes baseline ranges that can be adjusted:

```python
# In _ai_estimate_price method
baseline_ranges = {
    'Prime Urban': (40000, 70000),
    'Established Urban': (30000, 50000),
    'Suburban Residential': (20000, 35000),
    'Developing Town': (15000, 25000),
    'Rural Residential': (10000, 18000),
    'Rural Agricultural': (5000, 12000)
}
```

**To update:** Modify the prompt string in the `_ai_estimate_price` method.

---

## Comparison with Single-Step Approach

| Aspect | Before (Single-Step) | After (Two-Step) |
|--------|---------------------|------------------|
| **Baseline** | None | Macro-classified baseline |
| **Urban Premium** | Not explicit | Explicit in Step 1 |
| **Rural Pricing** | Too high | Appropriate baseline |
| **Comparables** | Primary driver | Secondary (fine-tuning) |
| **Transparency** | Limited | Full macro + micro |
| **Accuracy** | Variable | Improved with context |

---

## Future Enhancements

### 1. **Dynamic Baseline Calculation**
```python
# Real-time baseline from market data
baseline = get_area_baseline(city, district, lat, lon)
```

### 2. **Machine Learning Integration**
```python
# Train ML model on macro classifications
area_type = ml_classifier.predict(features)
baseline = ml_regressor.predict(area_type)
```

### 3. **Economic Indicators**
```python
# Incorporate real economic data
gdp_per_capita = get_district_gdp(district)
unemployment_rate = get_unemployment(district)
# Adjust baseline accordingly
```

### 4. **Time-Series Analysis**
```python
# Track baseline changes over time
baseline_trend = analyze_market_trend(city, months=12)
# Apply trend adjustment
```

---

## Summary

The **Two-Step Macro-Micro Analysis** framework transforms property valuation from a single-pass estimation into a sophisticated, context-aware process:

1. 🌍 **MACRO**: Understand the economic landscape
2. 🔬 **MICRO**: Fine-tune with local data
3. 🎯 **RESULT**: Accurate, defendable price estimates

This approach ensures that:
- **Prime urban properties** receive premium valuations
- **Rural properties** are priced appropriately
- **Comparable properties** are used correctly (for fine-tuning, not baseline)
- **Reasoning is transparent** and auditable

The framework is production-ready and can be extended with real economic data, ML models, and dynamic baseline calculations as needed.
