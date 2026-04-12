CarbonSense — Complete Technical & Behavioral Documentation (inital v0)
=======================================================================

1\. SYSTEM OVERVIEW
===================

CarbonSense is a **behavior-driven carbon footprint tracking application** that:

*   Collects user lifestyle data (daily + weekly)
    
*   Calculates carbon emissions using a scientific engine
    
*   Predicts future emissions using ML
    
*   Encourages sustainable behavior via:
    
    *   streaks
        
    *   badges
        
    *   leaderboard
        
*   Provides insights and environmental awareness (AQI)
    

2\. SYSTEM ARCHITECTURE
=======================

2.1 Layers
----------

 `   User Layer  ↓  Mobile Application (Flutter)  ↓  Backend Services (Node.js)  ↓  Database Layer (MongoDB)  ↓  ML & Analytics Layer (Python)  ↓  External APIs (AQI, Emission datasets, Cloudinary)   `

2.2 Backend Services
--------------------

*   Authentication Service
    
*   Carbon Calculation Engine
    
*   AQI Data Fetcher
    
*   Badge Engine
    
*   Leaderboard Engine
    
*   Recommendation Engine
    
*   Media Upload Service (Cloudinary)
    

2.3 External Services
---------------------

*   AQI API (OpenAQ)
    
*   Government Emission Datasets
    
*   Cloudinary (image storage)
    

3\. DATABASE DESIGN
===================

3.1 Core Collections
--------------------

 `   users  user_profiles  daily_activity_logs  carbon_records  badges  user_badges  leaderboards  emission_factors  aqi_data   `

3.2 Users Collection (UPDATED)
------------------------------

 `   {    "user_id": "string",    "name": "string",    "email": "string",    "password_hash": "string",    "city": "string",    "role": "student | working_professional | other",    "profile_picture_url": "cloudinary_url",    "created_at": "date"  }   `

3.3 Daily Activity Logs (UPDATED)
---------------------------------

 `   {    "user_id": "string",    "date": "YYYY-MM-DD",    "type": "daily | weekly",    "transport": {...},    "electricity": {...},    "food": {...},    "waste": {...},    "eco_actions": [],    "tasks_completed": 0,    "tasks_total": 8  }   `

3.4 Constraint
--------------

 `   UNIQUE KEY:  (user_id + date + type)  Rules:  - Only 1 daily log per day  - Only 1 weekly log per week  - Duplicate submissions are not allowed  `

4\. MEDIA STORAGE
=================

4.1 Profile Image Flow
----------------------

 `   Mobile App → Backend → Cloudinary → URL → MongoDB   `

Rules:

*   Images are NOT stored in database
    
*   Only URLs are stored
    

5\. APPLICATION FLOW
====================

5.1 App Launch
==============

Splash Screen
-------------

*   Shows tagline
    
*   Duration: 2–3 seconds
    

Navigation:

*   Logged in → Dashboard
    
*   Not logged in → Auth
    

5.2 Authentication
==================

Registration
------------

Fields:

*   Name
    
*   Role
    
*   Email
    
*   Password
    
*   Profile Picture
    

Flow:

 `   Select Image → Upload → Cloudinary → Save URL → Register   `

Login
-----

*   Email + Password
    
*   Redirect → Dashboard
    

6\. ONBOARDING
==============

Multi-step Questionnaire
------------------------

Sections:

1.  Basic Profile
    
2.  Transport
    
3.  Electricity
    
4.  Food & Lifestyle
    

Output
------

*   Stored in user\_profiles
    
*   Used as baseline for calculations
    

7\. NAVIGATION STRUCTURE
========================

 `   Dashboard | Input | Insights | Leaderboard | Profile   `

8\. DASHBOARD (HOME)
====================

Components (Top → Bottom)
-------------------------

### 1\. Today's Carbon Emission

*   Source: carbon\_records
    
*   Unit: kg CO₂
    

### 2\. AQI Summary

*   Source: AQI API
    
*   Informational only
    

### 3\. Carbon Shadow Graph

*   ML Prediction
    
*   Shows:
    
    *   30-day projection
        
    *   1-year projection
        

### 4\. Daily Task Progress

*   Shows:
    

 `   X / 8 Tasks Completed   `

*   Tap → Tasks Screen
    

9\. DAILY TASK SYSTEM
=====================

Behavior
--------

*   Total tasks = 8
    
*   Completing questionnaire updates tasks
    
*   Stored in:
    
    *   tasks\_completed
        
    *   tasks\_total
        

10\. INPUT MODULE
=================

10.1 Input Selection Screen
---------------------------

Options:

 `   1. Daily Activity  2. Weekly Activity   `

10.2 Daily Activity Rules
-------------------------

 `  - Only ONE daily activity submission is allowed per day per user
- Updates / overwrites are NOT allowed under any condition
- Once submitted, the data is immutable

Implications:
- No re-evaluation of tasks
- No re-calculation of streak
- No badge re-triggering due to updates `

10.3 Weekly Activity Rules
--------------------------

 `   - Unlock after 7 days from onboarding  - Available only on last day of week   `

11\. QUESTIONNAIRE FLOW
=======================

UI Behavior
-----------

*   Multi-step
    
*   Next / Previous
    
*   Submit at end
    

Submission Flow
---------------

 `   Save → daily_activity_logs  ↓  Trigger → Carbon Engine  ↓  Store → carbon_records  ↓  Trigger:      - Streak Engine      - Badge Engine      - Leaderboard update   `


12\. EMISSION CALCULATION ENGINE
================================

Formula
-------

 `   Total = Transport + Electricity + Food + Waste   `

Trigger
-------

*   On every submission
    

Output
------

Stored in:

*   carbon\_records
    

13\. INSIGHTS SCREEN
====================

Purpose
-------

Historical analytics only

Components
----------

### 1\. Bar Chart

*   Daily emissions (7/30 days)
    
*   Colorful bars
    

### 2\. Pie Chart

*   Contribution:
    
    *   Transport
        
    *   Electricity
        
    *   Food
        
    *   Waste
        

Rule
----

 `   NO ML prediction shown here   `

14\. LEADERBOARD
================

Tabs
----

 `   1. By City  2. By Role   `

Ranking Formula
---------------

 `   average_emission = total_emission / total_days_logged   `

Sorting
-------

*   Ascending (lowest emission first)
    

Display
-------

*   Profile picture
    
*   Name
    
*   Avg emission
    

15\. PROFILE SCREEN
===================

15.1 User Info
--------------

*   Profile Picture
    
*   Name
    
*   City
    
*   Role
    

15.2 Badge System
-----------------

### Requirements

 `   - Minimum 20 badges  - Each badge has:      - Custom image (Cloudinary)      - Name      - Description   `

### Badge Categories

*   Streak badges
    
*   Task completion badges
    
*   Eco action badges
    
*   Performance badges
    
*   Milestone badges
    

15.3 Badge Unlock
-----------------

Trigger:

*   After activity submission
    
*   After streak update
    

UI
--

Popup:

 `   [Badge Icon]  Badge Unlocked  Description   `

15.4 Badge Gallery
------------------

*   All badges shown
    
*   Achieved → colored
    
*   Locked → greyed
    

16\. STREAK SYSTEM
==================

Definition
----------

 `   Consecutive daily activity logs   `

Rules
-----

 `   If logged today:      streak++  If missed 1 day:      streak = 0   `

Storage
-------

*   user\_profiles.streak\_days
    

17\. ML PREDICTION SYSTEM
=========================

Model
-----

*   Linear Regression
    

Data
----

*   daily\_activity\_logs
    
*   carbon\_records
    
*   user\_profiles
    

Prediction Output
-----------------

 `   - Monthly prediction  - 30-day trend  - 1-year projection   `

Behavior
--------

 `   - NOT real-time  - Retrained periodically   `

18\. AQI SYSTEM
===============

Behavior
--------

*   Fetch city-based AQI
    
*   Cache in DB
    

Rule
----

 `   AQI does NOT affect emission calculation   `

19\. LEADERBOARD ENGINE
=======================

Trigger
-------

*   After emission calculation
    

Data Source
-----------

*   carbon\_records
    

Output
------

*   Ranked user list
    

20\. BADGE ENGINE
=================

Trigger
-------

*   After:
    
    *   submission
        
    *   streak update
        

Checks
------

 `   - streak_days  - tasks_completed  - eco_actions  - emission reduction   `

Output
------

*   Insert into user\_badges
    

21\. DAILY USER JOURNEY
=======================

 `   Open App ↓  Streak Updated ↓  View Dashboard  ↓  Log Daily Activity  ↓  Emission Calculated   ↓  Badges Checked  ↓  Leaderboard Updated   `

22\. WEEKLY USER JOURNEY
========================

 `   End of Week  ↓  Weekly Unlock  ↓  Submit Weekly Data  ↓  Recalculation   `

23\. ERROR HANDLING
===================

No Data
-------

*   Show empty charts
    

API Failure
-----------

*   Retry + fallback UI
    

FINAL SYSTEM DEFINITION
=======================

 `   CarbonSense =  Behavior Tracking + Scientific Calculation + ML Prediction + Gamification  Core Drivers:  - Daily consistency  - Awareness  - Feedback loops  - Motivation via rewards   `