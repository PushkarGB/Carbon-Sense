\# CarbonSense — Error Handling & System Resilience (v1)

\## OBJECTIVE

Ensure:

\- Data consistency

\- Zero corruption

\- Graceful failure handling

\- Reliable retries for async systems

**Related:** *CarbonSense — Technology Stack (Finalized v1.2)* §5–§6 (Redis + BullMQ); *CarbonSense — Background Job Architecture (v1)* §3–§4 (queue/job payloads including **BADGE_RETRY**).

\---

\# 1. ERROR CLASSIFICATION

\## 1.1 Critical Errors (Blocking)

Affect core transaction:

\- Emission Factor fetch failure

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

*   Push a **BADGE_RETRY** job onto **badge_queue** (BullMQ) with the shape below so the worker can re-run the same evaluator with the original event context.

\### Retry job payload (queue / \`job.data\`)

Top-level \`type\` is always **BADGE_RETRY**. **trigger_event** selects which badge path to run; **payload** is the **full** in-process event object (same fields the badge engine already uses: **TASK_EVALUATED**, **STREAK_UPDATED**, or **EMISSION_UPDATED**), including string \`userId\` on nested payloads.

\`\`\`json

{

  "type": "BADGE_RETRY",

  "trigger_event": "TASK_EVALUATED",

  "payload": {

    "userId": "64a1b2c3d4e5f6789012345",

    "date": "2026-04-12",

    "completedTaskIds": ["eco_reuse"]

  }

}

\`\`\`

\`\`\`json

{

  "type": "BADGE_RETRY",

  "trigger_event": "STREAK_UPDATED",

  "payload": {

    "userId": "64a1b2c3d4e5f6789012345",

    "date": "2026-04-12",

    "streakDays": 7

  }

}

\`\`\`

\`\`\`json

{

  "type": "BADGE_RETRY",

  "trigger_event": "EMISSION_UPDATED",

  "payload": {

    "userId": "64a1b2c3d4e5f6789012345",

    "date": "2026-04-12",

    "totalEmission": 12.4,

    "breakdown": {

      "transport": 1,

      "electricity": 2,

      "food": 3,

      "waste": 4

    }

  }

}

\`\`\`

Bull **job.name** is **BADGE_RETRY**; queue default options apply **max 3** attempts with **exponential** backoff.

Retry Strategy
--------------

*   Max retries: 3
    
*   Backoff: exponential
    

Final Failure
-------------

*   Persist **job_logs** (failed job, retry count, serialized **job.data**) per *Background Job Architecture* / **Complete Database Schema** (\`job_logs.type\` = **BADGE_RETRY**).

*   For badge-scoped follow-up, also write **error_logs** with \`module\` = **badge** and \`user_id\` from \`payload.userId\` when present.

*   No impact on the user’s completed submission or open API responses.
    

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
    
*   Clients may call **POST /leaderboard/refresh** (authenticated) to recompute **only** the signed-in user’s **leaderboards** row without waiting for the scheduled **LEADERBOARD_UPDATE** job (see *Execution Flow* §9 and *Background Job Architecture* §3.3).

9\. JOB FAILURE HANDLING
========================

Applies to BullMQ workers (**task_queue**, **leaderboard_queue**, **badge_queue**): same retry and idempotency rules as *Background Job Architecture* §6.

Retry Policy
------------

*   Max retries: 3
    
*   Delay: exponential
    
10\. Emission Factor Fetch Failure
========================

Action
------------
- Abort transaction
- Return EMISSION_FACTOR_FETCH_FAILED
- no fallback emission factors allowed.

Reason:
→ Prevent incorrect emission results
→ Maintain scientific integrity

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

 