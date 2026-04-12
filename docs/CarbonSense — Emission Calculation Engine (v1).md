CarbonSense — Emission Calculation Engine (v1)
==============================================

1\. Overview
------------

The **Emission Calculation Engine** is the core computational module responsible for converting user activities into **CO₂-equivalent emissions (kgCO₂e)**.

It follows:

*   Activity-based emission modeling
    
*   India-specific emission factors
    
*   Simplified Tier-3 methodology (distance/activity driven)
    
*   Well-to-Wheel (WTW) consideration where applicable
    

2\. Core Calculation Principle
------------------------------

`   Emission = Activity Data × Emission Factor   `

Where:

*   **Activity Data** = measurable user input (kWh, km, litres, meals, kg waste)
    
*   **Emission Factor** = dynamically fetched value from emission_factors collection

Emission factors are NOT hardcoded.

They are:
- Stored in the emission_factors collection
- Fetched at runtime
- Cached for performance (Redis, TTL: 7 days)
    

3\. Emission Categories
-----------------------

The system computes emissions across five primary categories:

`   total_emission =  electricity +   transport +  food +  waste   `

4\. Category-wise Calculation Models
------------------------------------

4.1 Electricity Emissions
-------------------------

### Formula

`   electricity_emission = units_kwh * emission_factor("electricity")   `

### Details

ParameterValueEmission Factor0.71 kgCO₂/kWhSourceCEA India Grid (2024–25)ScopeIndirect emissions (Scope 2)

### Notes

*   Represents **average grid emission intensity**
    
*   Includes fossil + renewable mix
    
*   Updated periodically (future scope)
    
    
4.2 Transport Emissions
-----------------------

> Transport emissions include all fuel-based emissions.
> There is NO separate fuel component

### Model Type

**Distance-based Tier-3 approximation**

### Formula

`   transport_emission = distance_km * emission_factor("transport_" + mode)   `

### Factor Source

Transport emission factors are NOT hardcoded.

They are fetched dynamically from:

emission_factors collection

Example keys:
- transport_car
- transport_bike
- transport_bus

### Notes

*   Based on India GHG Program datasets
    
*   Simplified for user input usability
    
*   Avoids fuel + occupancy complexity
    
*   Designed for behavioral tracking
    

### Future Upgrade (Advanced Model)

`   emission = distance * load_factor * emission_factor   `

4.3 Food Emissions
------------------


### Formula

`  food_emission = veg_meals * 1.5 + nonveg_meals * 3.0  `

### Schema Mapping

food: {
  diet_type: "veg" | "non_veg" | "mixed",
  meals_count: number
}

Mapping:

- veg → veg_meals = meals_count
- non_veg → nonveg_meals = meals_count
- mixed → 50% veg + 50% non_veg

processed_food is not supported by schema and must not be used.

### Details

Food_Type Emission_Factor Vegetarian 1.5 kgCO₂/meal Non-Vegetarian 3.0 kgCO₂/meal

### Notes

*   Represents **Scope 3 lifestyle emissions**
    
*   Based on global dietary emission averages
    
*   Not region-specific but behaviorally accurate
    

4.4 Waste Emissions
-------------------

### Formula

`   waste_emission = bags_used * 0.5   `

### Schema Mapping

waste: {
  bags_used: number,
  segregation: boolean
}

Conversion:
waste_kg = bags_used

Segregation does NOT affect emission calculation.

### Details

ParameterValueEmission Factor0.5 kgCO₂/kg waste

### Notes

*   Based on landfill methane approximation
    
*   Simplified model for daily usage
    
*   Represents indirect emissions


## Emission Factor Architecture

### Source of Truth

All emission factors are stored in the emission_factors collection.

Example structure:

{
  "type": "transport_car",
  "value": 0.12,
  "unit": "kg_co2_per_km"
  ...
}

---

### Runtime Flow

1. Fetch emission factors from cache (Redis)
2. If not present:
   → Fetch from DB
   → Store in cache (TTL: 7 days)
3. Use factors for all emission calculations

---

### Key Rules

- No hardcoded constants allowed
- All factors must come from DB
- Missing factor → fail calculation

---

### Benefits

- No redeployment required for updates
- Centralized control
- Production-ready flexibility
    

5\. Daily Emission Computation Flow
-----------------------------------

function calculateDailyEmission(activity):

  factors = emissionFactorService.getEmissionFactors()

  if (!factors):
    throw EMISSION_FACTOR_FETCH_FAILED

  electricity = activity.units_kwh * factors.electricity

  transport = Σ(  distance * factors["transport_" + mode] )

  food = deriveFromDietType(activity.food)

  waste = activity.waste.bags_used * 0.5

  return electricity + transport + food + waste

6\. Data Model Alignment
------------------------

### Input Source

`   daily_activity_logs   `

### Structure

{
  electricity_units: number,

  transport: [
    {
      mode: string,
      distance_km: number
    }
  ],

  food: {
    diet_type: "veg" | "non_veg" | "mixed",
    meals_count: number
  },

  waste: {
    bags_used: number,
    segregation: boolean
  }
}

7\. Baseline Calculation (for Personalization)
----------------------------------------------

### Formula

`   baseline_emission = avg(last_7_days_emission)   `

### Purpose

*   Enables **relative performance tracking**
    
*   Supports:
    
    *   Task evaluation
        
    *   Badge unlocking
        
    *   Behavioral insights
        

8\. Task Evaluation Dependency
------------------------------

Emission engine integrates with task system:

| Task | Logic |
|------|------|
| low_impact_day | today_emission < baseline × 0.8 |
| transport_public | mode ∈ ["bus", "metro"] |
| fuel_save | today_transport_distance < avg_transport_distance |
| ac_reduce | electricity < avg_electricity |
| short_trip_replace | mode == "walk" AND distance < avg_vehicle_distance |

9\. Design Decisions
--------------------

### 9.1 Why Distance-Based Transport?

*   Easier user input
    
*   Avoids fuel estimation errors
    
*   Matches Tier-3 methodology
    

### 9.2 Why Dynamic Factors?

- Allows real-time updates without code changes
- Supports region-specific adjustments (future)
- Ensures consistency via centralized storage
- Enables admin control over emission models
    

### 9.3 Why Simplified Food/Waste?

*   No reliable India-wide datasets
    
*   Behavioral tracking priority
    
*   Expandable later
    

10\. Limitations
----------------

*   Does not include:
    
    *   Vehicle occupancy variations
        
    *   Regional electricity differences
        
    *   Lifecycle emissions (manufacturing)
  

11\. Error Handling
------------------------

If emission factor is missing:

→ Abort calculation  
→ Return EMISSION_FACTOR_NOT_FOUND  

This prevents incorrect emission results.
        

12\. Future Enhancements
------------------------

*   Dynamic emission factors (region-based)
    
*   Smart transport estimation (maps integration)
    
*   Appliance-level electricity breakdown
    
*   AI-based emission prediction
    
*   Carbon credit integration
    

13\. Summary
------------

The CarbonSense Emission Engine:

*   Uses **India-aligned emission factors**
    
*   Implements **activity-based modeling**
    
*   Supports **real-time behavioral feedback**
    
*   Balances **accuracy + usability**

14\. Note 

## Schema Alignment Rules

- Schema is the single source of truth
- No new fields allowed in emission logic
- Derived internally:
  - fuel → transport.mode
  - food split → diet_type
  - waste_kg → bags_used

## Fuel Factor Usage Clarification

Petrol and diesel emission factors are stored for:
- scientific reference
- future advanced modeling

They are NOT used in runtime emission calculation.

Transport emissions are calculated using:
→ distance × mode-based emission factor