CarbonSense — Task Template Master List (v1)
============================================

1\. SYSTEM TASKS
================

`   {    "task_id": "daily_input",    "category": "system",    "title": "Daily Log",    "description": "Log your daily activity today",    "completion_type": "auto",    "evaluation_logic": "daily_submission_exists",    "conditions": {},    "cooldown_days": 0,    "priority": 1,    "active": true  }   `

`   {    "task_id": "weekly_input",    "category": "system",    "title": "Weekly Reflection",    "description": "Complete this week’s activity input",    "completion_type": "auto",    "evaluation_logic": "weekly_submission_exists",    "conditions": {},    "cooldown_days": 0,    "priority": 1,    "active": true  }   `

2\. ECO ACTION TASKS
====================

(Manual / simple habit tasks)

`   { "task_id": "eco_bag", "category": "eco_action", "title": "Carry Green", "description": "Carry a reusable bag today", "completion_type": "manual", "evaluation_logic": null, "conditions": {}, "cooldown_days": 2, "priority": 2, "active": true }   `

`   { "task_id": "eco_bottle", "category": "eco_action", "title": "Bottle Better", "description": "Use a reusable water bottle today", "completion_type": "manual", "evaluation_logic": null, "conditions": {}, "cooldown_days": 2, "priority": 2, "active": true }   `

`   { "task_id": "eco_plastic_skip", "category": "eco_action", "title": "Plastic Skip", "description": "Avoid single-use plastic today", "completion_type": "manual", "evaluation_logic": null, "conditions": {}, "cooldown_days": 3, "priority": 3, "active": true }   `

`   { "task_id": "eco_waste_segregation", "category": "eco_action", "title": "Waste Wise", "description": "Separate your waste before disposal", "completion_type": "manual", "evaluation_logic": null, "conditions": {}, "cooldown_days": 1, "priority": 2, "active": true }   `

`   { "task_id": "eco_reuse_item", "category": "eco_action", "title": "Reuse Mode", "description": "Reuse an item instead of discarding it", "completion_type": "manual", "evaluation_logic": null, "conditions": {}, "cooldown_days": 2, "priority": 3, "active": true }   `

`   { "task_id": "eco_plant_care", "category": "eco_action", "title": "Green Care", "description": "Water or care for a plant today", "completion_type": "manual", "evaluation_logic": null, "conditions": {}, "cooldown_days": 1, "priority": 2, "active": true }   `

`   { "task_id": "eco_local_food", "category": "eco_action", "title": "Local Choice", "description": "Choose locally sourced food today", "completion_type": "manual", "evaluation_logic": null, "conditions": {}, "cooldown_days": 3, "priority": 3, "active": true }   `

`   { "task_id": "eco_meatless", "category": "eco_action", "title": "Meatless Day", "description": "Avoid meat for at least one meal today", "completion_type": "manual", "evaluation_logic": null, "conditions": {}, "cooldown_days": 4, "priority": 4, "active": true }   `

`   { "task_id": "eco_no_litter", "category": "eco_action", "title": "No Litter", "description": "Dispose waste responsibly today", "completion_type": "manual", "evaluation_logic": null, "conditions": {}, "cooldown_days": 1, "priority": 2, "active": true }   `

`   { "task_id": "eco_cloth_use", "category": "eco_action", "title": "Cloth Switch", "description": "Use cloth instead of paper/tissue", "completion_type": "manual", "evaluation_logic": null, "conditions": {}, "cooldown_days": 2, "priority": 2, "active": true }   `

3\. EMISSION REDUCTION TASKS (AUTO + HYBRID)
============================================

`   { "task_id": "transport_public", "category": "emission_reduction", "title": "Ride Smart", "description": "Use public transport today", "completion_type": "auto", "evaluation_logic": "transport_mode == public", "conditions": {}, "cooldown_days": 2, "priority": 5, "active": true }   `

`   { "task_id": "transport_walk", "category": "emission_reduction", "title": "Walk More", "description": "Walk for short distances today", "completion_type": "hybrid", "evaluation_logic": "distance_walked > baseline", "conditions": {}, "cooldown_days": 1, "priority": 4, "active": true }   `

*Live API:* “Baseline” = your **average walk distance on past days** (up to 7 days) where you logged **walk**. Today passes if you walked **farther than that average**. If you have **no** walk history, baseline is treated as **0**, so any walk distance above zero counts.

`   { "task_id": "transport_carpool", "category": "emission_reduction", "title": "Share Ride", "description": "Carpool instead of traveling alone", "completion_type": "manual", "evaluation_logic": null, "conditions": {}, "cooldown_days": 3, "priority": 4, "active": true }   `

`   { "task_id": "ac_reduce", "category": "emission_reduction", "title": "AC Control", "description": "Reduce AC usage today", "completion_type": "hybrid", "evaluation_logic": "ac_hours < avg_ac_hours", "conditions": {}, "cooldown_days": 1, "priority": 5, "active": true }   `

`   { "task_id": "fan_prefer", "category": "emission_reduction", "title": "Fan First", "description": "Use fan instead of AC where possible", "completion_type": "manual", "evaluation_logic": null, "conditions": {}, "cooldown_days": 2, "priority": 3, "active": true }   `

`   { "task_id": "lights_off", "category": "emission_reduction", "title": "Light Saver", "description": "Turn off unused lights today", "completion_type": "manual", "evaluation_logic": null, "conditions": {}, "cooldown_days": 0, "priority": 3, "active": true }   `

`   { "task_id": "device_unplug", "category": "emission_reduction", "title": "Power Down", "description": "Unplug unused devices", "completion_type": "manual", "evaluation_logic": null, "conditions": {}, "cooldown_days": 1, "priority": 3, "active": true }   `

`   { "task_id": "short_trip_replace", "category": "emission_reduction", "title": "Trip Swap", "description": "Replace one vehicle trip with walking", "completion_type": "hybrid", "evaluation_logic": "mode == walk AND distance < baseline_vehicle_distance", "conditions": {}, "cooldown_days": 2, "priority": 5, "active": true }   `

`   { "task_id": "fuel_save", "category": "emission_reduction", "title": "Fuel Saver", "description": "Avoid unnecessary travel today", "completion_type": "hybrid", "evaluation_logic": "distance_travelled < avg_distance", "conditions": {}, "cooldown_days": 2, "priority": 5, "active": true }   `

`   { "task_id": "eco_cooking", "category": "emission_reduction", "title": "Smart Cooking", "description": "Use efficient cooking methods today", "completion_type": "manual", "evaluation_logic": null, "conditions": {}, "cooldown_days": 3, "priority": 3, "active": true }   `

4\. AWARENESS TASKS
===================

`   { "task_id": "check_aqi", "category": "awareness", "title": "AQI Check", "description": "Check today’s air quality index", "completion_type": "auto", "evaluation_logic": "aqi_screen_viewed", "conditions": {}, "cooldown_days": 0, "priority": 1, "active": true }   `

`   { "task_id": "view_insights", "category": "awareness", "title": "Insight Peek", "description": "View your emission insights today", "completion_type": "auto", "evaluation_logic": "insights_screen_viewed", "conditions": {}, "cooldown_days": 0, "priority": 1, "active": true }   `

`   { "task_id": "compare_day", "category": "awareness", "title": "Compare Day", "description": "Compare today's emission with yesterday", "completion_type": "auto", "evaluation_logic": "comparison_viewed", "conditions": {}, "cooldown_days": 1, "priority": 2, "active": true }   `

`   { "task_id": "trend_watch", "category": "awareness", "title": "Trend Watch", "description": "Observe your weekly emission trend", "completion_type": "auto", "evaluation_logic": "trend_viewed", "conditions": {}, "cooldown_days": 2, "priority": 2, "active": true }   `

5\. SMART / PERFORMANCE TASKS
=============================

`   { "task_id": "beat_yesterday", "category": "emission_reduction", "title": "Beat Yesterday", "description": "Reduce emission compared to yesterday", "completion_type": "auto", "evaluation_logic": "today_emission < yesterday_emission", "conditions": {}, "cooldown_days": 1, "priority": 5, "active": true }   `

`   { "task_id": "below_average", "category": "emission_reduction", "title": "Below Average", "description": "Keep emissions below your average", "completion_type": "auto", "evaluation_logic": "today_emission < avg_emission", "conditions": {}, "cooldown_days": 1, "priority": 5, "active": true }   `

`   { "task_id": "low_impact_day", "category": "emission_reduction", "title": "Low Impact", "description": "Maintain a low emission day", "completion_type": "auto", "evaluation_logic": "emission < threshold", "conditions": {}, "cooldown_days": 2, "priority": 5, "active": true }   `

*Live API:* “Threshold” means **below 80% of your locked baseline emission**. If baseline is not ready yet, this task will **not** auto-complete.

TOTAL TASK COUNT
================

`   60+ TASK TEMPLATES  - System: 2  - Eco: 20+  - Emission: 20+  - Awareness: 10+  - Smart: 8+   `