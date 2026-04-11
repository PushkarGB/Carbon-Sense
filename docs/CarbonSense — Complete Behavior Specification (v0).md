CarbonSense — Complete Behavior Specification (v0)
==================================================

1\. GLOBAL SYSTEM BEHAVIOR
==========================

1.1 Core Objective
------------------

The application tracks user lifestyle data, calculates daily carbon emissions, visualizes insights, predicts future emissions, and gamifies sustainability through streaks, badges, and leaderboards.

1.2 Core Rules
--------------

 `   1. One daily activity submission per day per user  2. One weekly submission per week per user  3. Duplicate submissions are NOT allowed (no update logic) 4. Once submitted, daily activity data is immutable  5. Images stored on Cloudinary, URLs stored in MongoDB  6. AQI data is informational only (not used in emission calculation)  7. ML predictions are periodic (not real-time per submission)   `

1.3 Navigation
--------------

Bottom Navbar (Fixed):

 `   Dashboard | Input | Insights | Leaderboard | Profile   `

2\. APP LAUNCH FLOW
===================

2.1 Splash Screen
-----------------

### Behavior:

*   Displays:
    
    *   App logo
        
    *   Tagline (static motivational message)
        

### Duration:

*   2–3 seconds
    

### Navigation:

*   If user logged in → Dashboard
    
*   Else → Login/Register
    

3\. AUTHENTICATION FLOW
=======================

3.1 Registration Screen
-----------------------

### Fields:

*   Name
    
*   Role (student | working\_professional | other)
    
*   Email
    
*   Password
    
*   Profile Picture (mandatory upload)
    

### Image Upload Flow:

 `   User selects image → Preview → Upload → Backend → Cloudinary → URL stored in MongoDB   `

### On Submit:

*   POST /auth/register
    

### Success:

*   Redirect → Onboarding
    

3.2 Login Screen
----------------

### Fields:

*   Email
    
*   Password
    

### On Submit:

*   POST /auth/login
    

### Success:

*   Redirect → Dashboard
    

4\. ONBOARDING FLOW
===================

4.1 Purpose
-----------

Collect baseline lifestyle data for emission calculation.

4.2 Structure
-------------

Multi-step questionnaire:

 `   1. Basic Profile  2. Transport  3. Electricity  4. Food & Lifestyle   `

4.3 Behavior
------------

*   Navigation:
    
    *   Next / Previous arrows
        
*   Final Step:
    
    *   Submit → POST /profile/setup
        

4.4 Post Completion
-------------------

*   Redirect → Dashboard
    
*   Mark onboarding as complete
    

5\. DASHBOARD (HOME SCREEN)
===========================

5.1 Layout Priority (Top → Bottom)
----------------------------------

5.2 Component 1 — Today's Carbon Emission
-----------------------------------------

### Data:

*   carbon\_records.total\_emission (today)
    

### Display:

*   Large KPI value
    
*   Unit: kg CO₂
    

5.3 Component 2 — AQI Summary
-----------------------------

### Data:

*   City-based AQI
    

### Display:

*   AQI value
    
*   PM2.5, PM10
    

### Action:

*   Tap → Detailed AQI Screen
    

5.4 Component 3 — Carbon Shadow Graph
-------------------------------------

### Type:

*   Shaded line chart
    

### Behavior:

*   Starts from current average emission
    
*   Shows:
    
    *   Next 30 days prediction
        
    *   1-year projection
        

5.5 Component 4 — Daily Tasks Progress
--------------------------------------

### Display:

 `   X / 8 Tasks Completed   `

### Action:

*   Tap → Daily Tasks Screen
    

6\. DAILY TASKS SCREEN
======================

6.1 Behavior
------------

### Display:

*   List of tasks:
    
    *   Name
        
    *   Description
        

### Interaction:

*   User can mark task as completed
    

### Update:

*   Increment tasks\_completed
    

7\. INPUT MODULE
================

7.1 Input Selection Screen
--------------------------

### Options:

 `   1. Daily Activity  2. Weekly Activity   `

7.2 Daily Activity Rules
------------------------

 `   - Available once per day  - - If already submitted: Show → "Already submitted for today" Block further action (no update allowed) `

7.3 Weekly Activity Rules
-------------------------

 `   - Available only after 7 days from onboarding  - Visible only on last day of each week  - - Only one submission allowed per week - No update allowed once submitted `

8\. QUESTIONNAIRE FLOW
======================

8.1 UI Behavior
---------------

*   Multi-step form
    
*   Navigation:
    
    *   Next / Previous
        
*   Final:
    
    *   Submit button
        

8.2 Submission Flow
-------------------

 `   1. Save → daily_activity_logs  2. Trigger → Emission Calculation Engine  3. Store → carbon_records  4. Trigger → Badge + Streak evaluation   `

8.3 Update Behavior
-------------------

- Updates are NOT allowed
- Once submitted, data cannot be modified
- Any attempt to resubmit is blocked

9\. EMISSION CALCULATION
========================

9.1 Formula
-----------

 `   Total = Transport + Electricity + Food + Waste   `

9.2 Trigger
-----------

*   On every submission only
    

10\. INSIGHTS SCREEN
====================

10.1 Purpose
------------

Historical analytics (NO predictions)

10.2 Component 1 — Daily Emission Bar Chart
-------------------------------------------

### Behavior:

*   Shows last 7 / 30 days
    
*   Colorful bars
    

10.3 Component 2 — Pie Chart
----------------------------

### Displays:

*   Contribution:
    
    *   Transport
        
    *   Electricity
        
    *   Food
        
    *   Waste
        

### Format:

*   Percentage + labels
    

11\. LEADERBOARD SCREEN
=======================

11.1 Tabs
---------

 `   1. By Role  2. By City   `

11.2 Ranking Logic
------------------

 `   average_emission = total_emission / total_days_logged   `

11.3 Sorting
------------

*   Ascending (lowest emission first)
    

11.4 List Item
--------------

 `   - Profile Picture  - Name  - Average Emission (kg CO₂)   `

12\. PROFILE SCREEN
===================

12.1 Section 1 — User Info
--------------------------

*   Profile Picture
    
*   Name
    
*   City
    
*   Role
    

12.2 Section 2 — Badges
-----------------------

### Rules:

 `   - Minimum 20 badges  - Each badge has:      - Image (Cloudinary)      - Name      - Description   `

12.3 Badge Types
----------------

### Streak:

*   5, 15, 30, 100 days
    

### Tasks:

*   5, 15, 30, 50, 100
    

### Additional:

*   Eco actions
    
*   Consistency
    
*   Performance reduction
    
*   Milestones
    

12.4 Badge Unlock Behavior
--------------------------

### Trigger:

*   After submission / streak update
    

### UI:

 `   Popup:  [Icon]  "Badge Unlocked"  "Description"   `

12.5 Badge Gallery
------------------

### Behavior:

 `   - All badges visible  - Achieved → colored  - Locked → greyed   `

13\. STREAK SYSTEM
==================

13.1 Definition
---------------

 `   Consecutive days of daily activity logging   `

13.2 Rules
----------

### Increment:

*   If user logs today
    

### Reset:

 `If 1 day missed → streak resets and next valid submission starts from 1`

13.3 Backend Logic
------------------

 `   if (today - last_log_date == 1):      streak += 1  else:      streak = 1   `

14\. ML PREDICTION SYSTEM
=========================

14.1 Behavior
-------------

*   Uses historical data
    
*   Predicts:
    
    *   Monthly emissions
        
    *   Yearly projection
        

14.2 Display
------------

*   ONLY on Dashboard
    

15\. DAILY USER JOURNEY
=======================

15.1 Typical Day Flow
---------------------

 `   User opens app →  Sees dashboard →  Logs daily activity →  Emission calculated →  Dashboard updated →  Streak updated →  Badges checked →  Leaderboard updated   `

16\. WEEKLY USER JOURNEY
========================

 `   End of week →  Weekly questionnaire unlocks →  User submits →  Emission updated →  Insights improved   `

17\. ERROR & EDGE CASE HANDLING
===============================

17.1 Duplicate Entry
--------------------

*   Show update dialog
    

17.2 No Data
------------

*   Show empty state (graphs)
    

17.3 API Failure
----------------

*   Retry mechanism + fallback UI
    

FINAL SUMMARY
=============

 `   CarbonSense =  Tracking + Calculation + Prediction + Gamification  Core Drivers:  - Daily logging  - Consistency (streak)  - Awareness (AQI + insights)  - Motivation (badges + leaderboard)   `