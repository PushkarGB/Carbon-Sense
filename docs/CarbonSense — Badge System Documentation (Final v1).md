CarbonSense — Badge System Documentation (Final v1)
===================================================

1\. OVERVIEW
============

The Badge System in CarbonSense is a **behavior-driven reward engine** designed to:

*   Motivate users to adopt sustainable habits
    
*   Reinforce consistency and improvement
    
*   Provide long-term engagement through achievements
    
*   Visually represent user progress and milestones
    

The system evaluates user activity across:

*   Task completion
    
*   Daily streak consistency
    
*   Carbon emission reduction
    

2\. CORE PRINCIPLES
===================

1. Badges are event-driven (not time-based polling)  2. Badges are permanent once unlocked  3. Badge evaluation is category-specific (optimized)  4. Badge progress is continuously tracked and visible  5. Badges represent short-term, mid-term, and long-term goals   `

3\. BADGE TYPES (FINAL)
=======================

3.1 Task-Based Badges
---------------------

### Definition:

Awarded for completing a certain number of tasks within a category.

### Categories:

*   eco\_action
    
*   emission\_reduction
    
*   awareness
    

### Characteristics:

` - Persistent (never reset)  - Incremental thresholds (5, 15, 50, 100)  - Directly linked to Daily Task System   `

3.2 Streak-Based Badges
-----------------------

### Definition:

Awarded for maintaining a continuous daily activity streak.

### Characteristics:

`   - Requires uninterrupted streak  - Progress resets if streak breaks  - Previous streak achievements do NOT carry forward   `

3.3 Performance-Based Badges
----------------------------

### Definition:

Awarded for reducing carbon emissions relative to the user’s baseline.

### Characteristics:

`   - Based on user's own data (not competitive)  - Reflects real behavioral improvement  - Long-term engagement driver   `

4\. DATA MODEL
==============

4.1 Badge Master Collection (badges)
------------------------------------

`   {    "badge_id": "string",    "name": "string",    "description": "string",    "category": "eco_action | emission_reduction | awareness | streak | performance",    "type": "task | streak | performance",    "threshold": "number",    "value": "number",    "tier": "bronze | silver | gold | platinum",    "icon_url": "cloudinary_url",    "active": true  }   `

4.2 User Badge Collection (user\_badges)
----------------------------------------

`   {    "user_id": "string",    "badge_id": "string",    "awarded_at": "timestamp"  }   `

4.3 User Progress Tracking (Extension in user\_profiles)
--------------------------------------------------------

`   {    "task_stats": {      "eco_action": 0,      "emission_reduction": 0,      "awareness": 0    },    "streak_days": 0,    "performance_metrics": {      "baseline_emission": 0,      "current_avg_emission": 0,      "reduction_percent": 0    }  }   `

5\. BADGE ENGINE
================

5.1 Trigger Points
------------------

Badge evaluation is triggered on the following events:

 `   1. Task completion  2. Daily activity submission (streak update)  3. Emission calculation (performance update)   `

5.2 Event-Based Evaluation Strategy
-----------------------------------

 `   Task Completion →      Evaluate only task-based badges (specific category)  Streak Update →      Evaluate only streak-based badges  Emission Update →      Evaluate only performance-based badges   `

5.3 Unlock Logic
----------------

 `   IF user_stat >= badge.threshold  AND badge not already awarded:      → Award badge   `

5.4 Duplicate Prevention
------------------------

- Enforce UNIQUE (user_id + badge_id) at database level
- Always check before insert to prevent duplicate awarding   

5.5 Badge Permanence
--------------------

 `   Once unlocked:  → Badge is NEVER revoked   `

6\. STREAK SYSTEM (BADGE CONTEXT)
=================================

6.1 Definition
--------------

 `   Streak = number of consecutive days user logs daily activity   `

6.2 Rules
---------

 `   IF user logs today AND logged yesterday:      streak++  ELSE:      streak = 1   `

6.3 Badge Constraint
--------------------

 `   Streak must be continuous  Example:  - 5-day badge achieved  - Streak resets  → Next badge (15 days) must be continuous again  → Previous streak does NOT contribute   `

7\. PERFORMANCE BADGES
======================

7.1 Baseline Definition
-----------------------

 `   baseline_emission = average emission of first 7 days   `

 Baseline Status:

- pending → less than 7 days of data
- locked → 7 or more days

Once locked:
→ baseline_emission is NEVER recalculated

7.2 Reduction Formula
---------------------

    current_avg_emission = rolling average of last 30 days

 `   reduction_percent =  ((baseline - current_avg) / baseline) × 100   `

7.3 Thresholds (India/Maharashtra Context)
------------------------------------------

 `   5%   → Beginner improvement  10%  → Moderate improvement  20%  → Strong behavioral change  35%  → Advanced sustainability  50%  → Elite level reduction   `


8\. SPECIAL BADGE CONDITIONS

First Step:
→ Triggered when any task category count >= 1

Perfect Week:
→ Triggered when streak count >= 7


9\. BADGE VALUE SYSTEM
======================

9.1 Value Mapping
-----------------

 `   Bronze   → 10 points  Silver   → 25 points  Gold     → 60 points  Platinum → 120 points   `

9.2 Usage
---------

 `   Used for:  - Selecting top 3 badges for profile display  - Future scoring systems (Eco Score)   `

9.3 Top Badge Selection
-----------------------

 `   Sort user badges by value DESC  Select top 3   `

10\. BADGE PROGRESS TRACKING
===========================

10.1 Progress Calculation
------------------------

### Task-Based

 `   progress = completed_tasks / threshold   `

### Streak-Based

 `   progress = current_streak / threshold   `

### Performance-Based

 `   progress = reduction_percent / threshold   `

Progress is computed dynamically and cached

Cache is invalidated when:
- task_stats change
- streak changes
- performance metrics change

10.2 Remaining Requirement
-------------------------

Examples:

 `   Eco Badge:  12 / 15 → 3 more tasks needed  Streak Badge:  7 / 15 → 8 more days needed  Performance Badge:  12% / 20% → 8% reduction needed   `

11\. BADGE GALLERY
==================

11.1 Display Rules
------------------

 `   - All badges visible  - Achieved badges → colored  - Locked badges → greyed out   `

11.2 Interaction
----------------

On clicking a badge:

 `   Show popup:  - Badge name  - Description  - Requirement  - Progress bar  - Remaining requirement   `

12\. BADGE UNLOCK EXPERIENCE
============================

12.1 Trigger
------------

Immediately after badge unlock

12.2 UI Flow
------------

 `   1. Screen dim overlay  2. Lottie celebration animation  3. Badge appears with fade animation  4. Phone vibration feedback   `

13\. SYSTEM FLOW (END-TO-END)
=============================

 `   User completes task OR logs daily activity →  Update user stats →  Trigger badge engine →  Evaluate relevant badges →  If unlocked:      Save badge      Trigger animation      Update UI   `

14\. EDGE CASES
===============

14.1 Duplicate Unlock
---------------------

 `   Prevented via user_badges check   `

14.2 Streak Reset
-----------------

 `   Affects only future streak badges  Does not remove previously earned badges   `

14.3 Low Activity Users
-----------------------

 `   Still eligible for lower-tier badges  Ensures inclusivity   `

15\. SYSTEM ROLE IN PRODUCT
===========================

 `   Tasks → Daily engagement  Streak → Habit formation  Badges → Long-term motivation   `

FINAL DEFINITION
================

 `   Badge System =  Event-driven, category-based achievement engine  that converts user behavior into visible progress  and long-term motivation.   `