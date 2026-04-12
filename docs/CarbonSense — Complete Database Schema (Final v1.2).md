### \# CarbonSense — Complete Database Schema (Final)

### \## 1. OVERVIEW

### This document defines the \*\*complete MongoDB schema design\*\* for CarbonSense.

### Design principles followed:

### \- Atomic transaction compatibility (critical flows) :contentReference\[oaicite:0\]{index=0}

### \- Event-driven badge + task systems :contentReference\[oaicite:1\]{index=1}

### \- Daily task lifecycle (no stale data) :contentReference\[oaicite:2\]{index=2}

### \- Personalization engine support (behavior tracking) :contentReference\[oaicite:3\]{index=3}

### \- Background job compatibility (idempotent design) :contentReference\[oaicite:4\]{index=4}

### \---

### \# 2. COLLECTION: users

### \## Purpose

### Authentication + basic identity

### \`\`\`json

### {

### "\_id": "ObjectId",

### "name": "string",

### "email": "string (unique)",

### "password\_hash": "string",

### "role": "student | working\_professional | other",

### "city": "string",

### "profile\_picture\_url": "string",

### "created\_at": "timestamp",

### "updated\_at": "timestamp"

### }Indexes

*   UNIQUE(email)
    

3\. COLLECTION: user\_profiles
==============================

Purpose
-------

Core behavioral + aggregated user data

 `   {  "user_id": "ObjectId (ref users)",  "onboarding_completed": true,  "streak_days": 0,  "last_submission_date": "YYYY-MM-DD",  "last_streak_update": "YYYY-MM-DD",  "task_stats": {    "eco_action": 0,    "emission_reduction": 0,    "awareness": 0  },  "performance_metrics": {    "baseline_emission": 0,    "baseline_status": "pending | locked",    "current_avg_emission": 0,    "reduction_percent": 0  },  "behavior_profile": {    "avg_transport_mode": "string",    "avg_distance": 0,    "avg_ac_hours": 0,    "avg_energy_usage": 0,    "eco_action_score": 0  },  "engagement_metrics": {    "task_completion_rate": 0,    "total_days_logged": 0,    "app_open_count": 0  },  "weekly_insights": {    "total_weeks_logged": 0,    "last_weekly_submission_date": "YYYY-MM-DD",    "latest_weekly_emission": 0,    "average_weekly_emission": 0,    "emission_trend": "increasing | stable | decreasing",    "avg_transport_mode": "string",    "avg_distance": 0,    "avg_ac_hours": 0,    "avg_energy_usage": 0,    "eco_action_score": 0,    "diet_non_veg_day_fraction": 0  },  "created_at": "timestamp",  "updated_at": "timestamp"}   `

### Notes

*   Supports personalization engine signals
    
*   Stores streak separately (lazy update system)

*   `weekly_insights` is derived from immutable `daily_activity_logs` where `type = weekly`

*   Weekly questionnaire data must **not** create extra `carbon_records` rows or affect leaderboard / daily performance averages
    

4\. COLLECTION: daily\_activity\_logs
=====================================

Purpose
-------

Raw user input (immutable)

 `   {  "user_id": "ObjectId",  "date": "YYYY-MM-DD",  "type": "daily | weekly",  "transport": {    "mode": "bike | car | bus | metro | walk",    "distance": 0, },  "electricity": {    "units_consumed": 0,    "ac_hours": 0  },  "food": {    "diet_type": "veg | non_veg | mixed",    "meals_count": 0  },  "waste": {    "segregation": true,    "bags_used": 0  },  "eco_actions": ["eco_bag", "eco_bottle"],  "created_at": "timestamp"}   `

### Constraints

*   UNIQUE(user\_id + date + type)
    

### Rules

*   Immutable after insert
    

5\. COLLECTION: carbon\_records
===============================

Purpose
-------

Computed emissions (derived data)

 `   {  "user_id": "ObjectId",  "date": "YYYY-MM-DD",  "total_emission": 0,  "breakdown": {    "transport": 0,    "electricity": 0,    "food": 0,    "waste": 0  },  "created_at": "timestamp"}   `

### Notes

*   Generated during atomic transaction
    

6\. COLLECTION: task\_templates
===============================

Purpose
-------

Master task definitions

 `   {  "task_id": "string",  "category": "system | eco_action | emission_reduction | awareness",  "title": "string",  "description": "string",  "completion_type": "auto | manual | hybrid",  "evaluation_logic": "string | null",  "conditions": {},  "cooldown_days": 0,  "priority": 1,  "active": true}   `

### Notes

*   Used by personalization engine
    
*   Static master data
    

7\. COLLECTION: user\_daily\_tasks
==================================

Purpose
-------

Generated daily tasks per user

 `   {  "user_id": "ObjectId",  "date": "YYYY-MM-DD",  "tasks": [    {      "task_id": "string",      "category": "string",      "status": "pending | completed",      "completion_type": "auto | manual | hybrid",      "completed_at": "timestamp | null"    }  ],  "created_at": "timestamp"}   `

### Constraints

*   UNIQUE(user\_id + date)
    

### Notes

*   Generated via cron / fallback
    
*   Deleted daily (midnight job)
    

8\. COLLECTION: badges
======================

Purpose
-------

Badge master data

 `   {  "badge_id": "string",  "name": "string",  "description": "string",  "category": "eco_action | emission_reduction | awareness | streak | performance",  "type": "task | streak | performance",  "threshold": 0,  "value": 0,  "tier": "bronze | silver | gold | platinum",  "icon_url": "string",  "active": true}   `

### Notes

*   Seeded from master list
    

9\. COLLECTION: user\_badges
============================

Purpose
-------

Tracks unlocked badges

 `   {  "user_id": "ObjectId",  "badge_id": "string",  "awarded_at": "timestamp"}   `

### Constraints

*   UNIQUE(user\_id + badge\_id)
    

### Notes

*   Prevents duplicate badge unlocks
    

10\. COLLECTION: leaderboards
=============================

Purpose
-------

Stores ranking data

 `   {  "user_id": "ObjectId",  "avg_emission": 0,  "total_emission": 0,  "total_days_logged": 0,  "city": "string",  "role": "string",  "updated_at": "timestamp"}   `

### Notes

*   Updated via cron jobs
    

11\. COLLECTION: emission\_factors
==================================

Purpose
-------

Stores emission constants

### {

### "type": "electricity"  | "transport_car"  | "transport_bike"  | "transport_bus"  | "transport_metro"  | "transport_walk"

### "value": 0,

### "unit": "kg\_co2\_per\_unit",

### "source": "string",

### "updated\_at": "timestamp"

### }Example

*   Electricity → 0.716 kg CO₂/kWh
    
### Transport emission factors are mode-specific.

### There is no generic "transport" factor.

12\. COLLECTION: aqi\_data
==========================

Purpose
-------

Cached AQI data

### {

### "city": "string",

### "aqi": 0,

### "pm25": 0,

### "pm10": 0,

### "no2": 0,

### "so2": 0,

### "co": 0,

### "fetched\_at": "timestamp"

### }Notes

*   Informational only (not used in emission calc)
    

13\. COLLECTION: job\_logs (OPTIONAL BUT RECOMMENDED)
=====================================================

Purpose
-------

Track background job failures

{

"job\_id": "string",

"type": "TASK\_RESET | LEADERBOARD | BADGE\_RETRY",

"status": "success | failed",

"retry\_count": 0,

"payload": {},

"error\_message": "string",

"created\_at": "timestamp",

"updated\_at": "timestamp"

}

14\. COLLECTION: error\_logs
============================

Purpose
-------

System-wide error tracking

### {

### "error\_id": "string",

### "type": "CRITICAL | NON\_CRITICAL",

### "module": "submission | badge | task | leaderboard",

### "user\_id": "ObjectId",

### "message": "string",

### "payload": {},

### "retry\_count": 0,

### "timestamp": "timestamp"

### }Notes

*   Required for resilience system
    

15\. RELATIONSHIP SUMMARY
=========================

Key Relationships
-----------------

*   users → user\_profiles (1:1)
    
*   users → daily\_activity\_logs (1:N)
    
*   users → carbon\_records (1:N)
    
*   users → user\_daily\_tasks (1:N)
    
*   users → user\_badges (1:N)
    
*   users → leaderboards (1:1)
    

16\. TRANSACTIONAL FLOW SUPPORT
===============================

This schema supports:

### Atomic Transaction

*   daily\_activity\_logs
    
*   carbon\_records
    
*   user\_profiles
    
*   user\_daily\_tasks
    

→ All updated together or rolled back

17\. DESIGN GUARANTEES
======================

✔ No duplicate submissions✔ No partial writes✔ Badge duplication prevented✔ Task lifecycle strictly controlled✔ Async-safe architecture✔ Scalable + modular

FINAL DEFINITION
================

Database Schema =

A **transaction-safe, event-driven, document-based data model**

that supports:

→ Behavior tracking→ Emission calculation→ Task personalization→ Gamification (badges + streaks)→ Scalable async processing
