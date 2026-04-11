\# CarbonSense — Error Handling & System Resilience (v1)

\## OBJECTIVE

Ensure:

\- Data consistency

\- Zero corruption

\- Graceful failure handling

\- Reliable retries for async systems

\---

\# 1. ERROR CLASSIFICATION

\## 1.1 Critical Errors (Blocking)

Affect core transaction:

\- Validation failure (duplicate submission)

\- Emission calculation failure

\- Task evaluation failure

\- DB write failure (activity / emission / stats)

→ MUST rollback

\---

\## 1.2 Non-Critical Errors (Non-Blocking)

Do NOT affect core flow:

\- Badge evaluation failure

\- Leaderboard update failure

\- Streak update failure

→ Retry async

\---

\## 1.3 External Errors

\- AQI API failure

\- Future ML service failure

→ fallback - show retry button or empty state lottie animation

\---

\# 2. TRANSACTION SAFETY (CORE GUARANTEE)

\## Atomic Block

daily submission transaction:

1.  validate
    
2.  insert daily\_activity\_logs
    
3.  calculate emission
    
4.  insert carbon\_records
    
5.  update user\_stats
    
6.  evaluate tasks
    

\---

\## Rule

IF any step fails:

→ FULL ROLLBACK

\---

\## Implementation

\- Use DB transactions (Mongo session / SQL txn)

\- No partial writes allowed

\---

\# 3. VALIDATION FAILURE HANDLING

\## Case: Duplicate Submission

Response:

\`\`\`json

{

"error": "ALREADY\_SUBMITTED",

"message": "Daily activity already submitted"

}

Behavior
--------

*   No DB operation
    
*   No retries
    

4\. EMISSION FAILURE HANDLING
=============================

Case: Calculation Error
-----------------------

Action:

*   Abort request
    
*   Rollback transaction
    

Response:

 `   {  "error": "EMISSION_CALC_FAILED",  "message": "Unable to calculate emission"}   `

5\. TASK EVALUATION FAILURE
===========================

Case: Logic / Data failure
--------------------------

Action:

*   Abort transaction
    
*   Rollback submission
    

Reason:→ Prevent inconsistent task\_stats

6\. BADGE ENGINE FAILURE
========================

Nature:
-------

Non-blocking

Handling
--------

*   Push failed event to retry queue
    

 `   {  "type": "BADGE_RETRY",  "payload": { user_id, trigger_event }}   `

Retry Strategy
--------------

*   Max retries: 3
    
*   Backoff: exponential
    

Final Failure
-------------

*   Log in error collection
    
*   No user impact
    

7\. STREAK FAILURE
==================

Nature:
-------

Non-critical

Handling
--------

*   Skip update
    
*   Retry next app open
    

Guarantee:→ self-healing system

8\. LEADERBOARD FAILURE
=======================

Nature:
-------

Non-critical

Handling
--------

*   Skip update
    
*   Next cron will fix
    

9\. JOB FAILURE HANDLING
========================

Retry Policy
------------

*   Max retries: 3
    
*   Delay: exponential
    

Idempotency Rules
-----------------

All jobs must be safe to retry:

*   Task generation → check existence
    
*   Badge insert → UNIQUE constraint
    
*   Leaderboard → overwrite safe
    

10\. LOGGING SYSTEM
===================

Error Log Structure
-------------------

 `   {  "error_id": "...",  "type": "CRITICAL | NON_CRITICAL",  "module": "submission | badge | task | leaderboard",  "user_id": "...",  "message": "...",  "payload": { ... },  "retry_count": 0,  "timestamp": "..."}   `

Logging Levels
--------------

*   ERROR → failures
    
*   WARN → retries
    
*   INFO → job execution
    

11\. CLIENT RESPONSE STRATEGY
=============================

Principles
----------

*   Clear error codes
    
*   No internal details
    
*   Deterministic responses
    

Examples
--------

Duplicate:→ ALREADY\_SUBMITTED

Server failure:→ INTERNAL\_ERROR

12\. FALLBACK STRATEGIES
========================

AQI API Failure
---------------

*   Show cached value OR
    
*   Show "Data unavailable"
    

Missing Data
------------

*   Show empty UI state
    
*   No crash
    

13\. SYSTEM GUARANTEES
======================

✔ No partial data writes✔ No duplicate submissions✔ Badge duplication prevented✔ Async failures recoverable✔ System self-healing via retries

FINAL DEFINITION
================

Error Handling System =Transaction-safe + retry-driven resilience layerensuring consistency, reliability, and fault tolerance

 