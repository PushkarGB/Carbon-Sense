CarbonSense — Daily Task System Documentation (Final v1)
========================================================

1\. OVERVIEW
============

The Daily Task System in CarbonSense is a **smart, dynamic, and behavior-driven engine** designed to:

*   Encourage sustainable habits
    
*   Guide users toward lower carbon emissions
    
*   Improve engagement through daily actionable tasks
    
*   Feed into badges, streak reinforcement, and long-term behavior change
    

2\. CORE PRINCIPLES
===================

 `   1. Tasks are dynamically generated (NOT fixed)  2. Tasks are personalized based on user behavior  3. Tasks are a mix of auto-evaluated and manual  4. Tasks expire daily (except weekly tasks)  5. Tasks directly contribute to badges and engagement   `

3\. TASK SYSTEM ARCHITECTURE
============================

 `   Task Templates (Master Data)          ↓  Task Generator Engine          ↓  User Daily Tasks (Generated per day)          ↓  Task Evaluation Engine          ↓  User Stats + Badges + UI Updates   `

4\. TASK CATEGORIES (FINAL)
===========================

4.1 System Tasks
----------------

*   Mandatory tasks required for app functionality
    

Examples:

*   Daily Activity Input
    
*   Weekly Activity Input
    

4.2 Eco Action Tasks
--------------------

*   Promote environmentally friendly actions
    

Examples:

*   Carry reusable bag
    
*   Use reusable bottle
    

4.3 Emission Reduction Tasks
----------------------------

*   Directly aim to reduce carbon emissions
    

Examples:

*   Use public transport
    
*   Reduce AC usage
    

4.4 Awareness Tasks
-------------------

*   Improve awareness of environmental impact
    

Examples:

*   Check AQI
    
*   View insights
    

5\. TASK TEMPLATE MODEL
=======================

Each task is defined as a reusable template.

 `   {    "task_id": "string",    "category": "system | eco_action | emission_reduction | awareness",    "title": "string (short, cryptic)",    "description": "string (one-line instruction)",    "completion_type": "auto | manual | hybrid",    "evaluation_logic": "condition or null",    "conditions": {},    "cooldown_days": "integer",    "priority": "integer (1-5)",    "active": true  }   `

6\. USER DAILY TASK MODEL
=========================

Tasks generated per user per day.

 `   {    "user_id": "string",    "date": "YYYY-MM-DD",    "tasks": [      {        "task_id": "string",        "category": "string",        "status": "pending | completed",        "completion_type": "auto | manual | hybrid",        "completed_at": "timestamp"      }    ]  }   `

7\. TASK GENERATION ENGINE
==========================

7.1 Trigger
-----------
## TASK GENERATION — FINAL LOGIC

Tasks are generated using a hybrid strategy:

1. Primary: Scheduled midnight job (daily)
2. Fallback: On first app open of the day

### Idempotency Rule:

- Tasks must be generated only once per user per day

Implementation:

IF (user_daily_tasks exists for today):
    → return existing tasks
ELSE:
    → generate tasks
    

7.2 Generation Steps
--------------------

### Step 1 — Add System Tasks

 `   Always add:  - Daily Activity Task  Conditionally add:  - Weekly Activity Task (if weekly unlock day)   `

### Step 2 — Extract User Context

From:

*   user\_profiles
    
*   last 7 days of daily\_activity\_logs
    

Extract:

 `   - average transport mode  - average travel distance  - average AC usage  - eco action frequency  - diet pattern   `

### Step 3 — Context-Based Task Matching

Examples:

 `   IF transport = two_wheeler  → Add "Use public transport"  IF AC usage high  → Add "Reduce AC usage"  IF eco actions low  → Add eco_action tasks   `

### Step 4 — Apply Filters

 `   - Remove tasks used yesterday  - Remove tasks under cooldown  - Remove duplicate category overload   `

### Step 5 — Final Selection

 `   Select:  - 1–2 eco_action tasks  - 1–2 emission_reduction tasks  - 0–1 awareness tasks   `

7.3 Final Task Count
--------------------

 `   Total tasks per day:  4 to 6 tasks (dynamic)   `

8\. TASK EVALUATION ENGINE
==========================

8.1 Trigger Points
------------------

Evaluation runs:

- After daily input submission (auto + hybrid tasks)
- After manual task completion (manual tasks)
    

8.2 Evaluation Types
--------------------

### 8.2.1 Auto Evaluation

Based on user data.

Example:

 `   Task: Use Public Transport  Condition:  transport.mode == bus OR metro   `

### 8.2.2 Manual Evaluation

User marks task as completed.

Example:

 `   Carry reusable bag → checkbox   `

### 8.2.3 Hybrid Evaluation

System validates improvement.

Example:

 `   Reduce AC usage  Condition:  today_ac_hours < user_avg_ac_hours   `

8.3 Evaluation Logic
--------------------

 `   For each task:      IF auto:          evaluate condition      IF manual:          wait for user input      IF hybrid:          evaluate + allow confirmation      IF completed:          update status          update user stats   `


8.4 TASK COMPLETION — ATOMIC EXECUTION
-------------------- 

Task completion must follow a transactional flow:

completeTask():
  → mark task as completed
  → update user_stats (task_stats)
  → trigger badge evaluation (task-based only)

All operations must succeed together or fail together

8.5 TASK EVALUATION TIMING
-------------------- 

AUTO tasks:
→ Evaluated ONLY after daily activity submission

MANUAL tasks:
→ Completed via user action (checkbox)

HYBRID tasks:
→ Evaluated after submission
→ AND user can manually confirm completion

9\. PERSONALIZATION ENGINE
==========================

9.1 Behavior Profile
--------------------

Stored per user:

 `   {    "avg_transport": "string",    "avg_ac_hours": "number",    "eco_action_score": "number"  }   `

9.2 Personalization Rules
-------------------------

 `   - High emissions → reduction tasks  - Low eco behavior → eco tasks  - Consistent users → advanced tasks   `

9.3 Difficulty Progression
--------------------------

 `   Beginner → simple tasks  Intermediate → mixed tasks  Advanced → strict tasks   `

10\. TASK COMPLETION RULES
==========================

10.1 Expiry
-----------

 `   Tasks expire at end of day (23:59 local time)   `

10.2 Late Submissions
---------------------

 Late submissions are NOT allowed 
 Tasks expire at end of day and cannot be completed later

10.3 Update Handling
--------------------

 ## FINAL SUBMISSION RULE

- Only ONE daily activity submission is allowed per day per user
- Updates / overwrites are NOT allowed under any condition
- Once submitted, the data is immutable

Implications:
- No re-evaluation of tasks
- No re-calculation of streak
- No badge re-triggering due to updates


11\. WEEKLY TASK LOGIC
======================

11.1 Unlock Rule
----------------

 `   - Activated after 7 days from onboarding  - Available only on last day of each user week   `

11.2 Completion
---------------

*   Auto-completed on weekly form submission
    

12\. DATA STORAGE
=================

12.1 Collections
----------------

 `   task_templates  user_daily_tasks   `

12.2 User Profile Extension
---------------------------

 `   {    "task_stats": {      "eco_action": 0,      "emission_reduction": 0,      "awareness": 0    }  }   `

13\. API DESIGN
===============

Get Today’s Tasks
-----------------

 `   GET /tasks/today   `

Complete Task
-------------

 `   POST /tasks/complete   `

Internal Evaluation
-------------------

 `   POST /tasks/evaluate   `

14\. UI BEHAVIOR
================

Dashboard
---------

 `   "3 / 5 tasks completed"   `

Tasks Screen
------------

Each task displays:

*   Title
    
*   Description
    
*   Status
    
*   Checkbox (if manual)

*   Tasks are visible as "pending" before submission

*   Auto tasks update after submission
    

15\. EDGE CASES
===============

User Does Not Open App
----------------------

 `   Tasks generated via cron  Expire automatically   `

Duplicate Generation
--------------------

 `   Prevent using unique (user_id + date)   `


16\. SYSTEM FLOW (END-TO-END)
=============================

 `   Midnight →  Generate Tasks →  User Opens App →  View Tasks →  Submit Daily Input →  Evaluate Tasks →  Update Stats →  Trigger Badges →  Update UI   `

FINAL DEFINITION
================

 `   Daily Task System =  Dynamic + Personalized + Auto-Evaluated Behavioral Engine  Goal:  Drive consistent sustainable habits, not just tracking.   `