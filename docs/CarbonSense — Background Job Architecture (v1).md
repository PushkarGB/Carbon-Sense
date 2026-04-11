\# CarbonSense — Background Job Architecture (v1)

\## OBJECTIVE

Handle all non-critical, asynchronous, and scheduled operations:

\- Task generation

\- Task cleanup

\- Leaderboard updates

\- Badge retries

\- (Future) ML processing

Goal:

→ Keep main API fast, consistent, and failure-safe

\---

\# 1. ARCHITECTURE OVERVIEW

CRON SCHEDULER

↓

JOB DISPATCHER

↓

QUEUE SYSTEM

↓

WORKER SERVICES

↓

DATABASE / CACHE

\---

\# 2. CORE COMPONENTS

\## 2.1 Scheduler (Cron Layer)

Responsible for triggering jobs at specific intervals.

Examples:

\- Midnight jobs

\- Periodic jobs (every X hours)

\---

\## 2.2 Job Dispatcher

\- Converts cron triggers into queue jobs

\- Adds metadata (job type, payload)

\---

\## 2.3 Queue System

Recommended:

\- Redis-based queue (BullMQ / RabbitMQ)

Responsibilities:

\- Job buffering

\- Retry handling

\- Rate limiting

\---

\## 2.4 Worker Services

Dedicated processors for each job type:

\- Task Worker

\- Leaderboard Worker

\- Badge Retry Worker

\- (Future) ML Worker

\---

\# 3. JOB TYPES (DEFINED)

\---

\## 3.1 TASK DAILY RESET JOB (CRITICAL)

\### Schedule:

\- Every day at 00:00 (user timezone-aware optional future)

\---

\### Responsibilities:

For each user:

1\. DELETE yesterday tasks

2\. GENERATE today tasks (via personalization engine)

\---

\### Flow:

FOR each user:

DELETE user\_daily\_tasks WHERE date = yesterday

IF tasks for today not exist:

generate tasks

insert user\_daily\_tasks

\---

\### Guarantees:

\- No stale tasks

\- No late completion possible

\- Clean daily cycle

\---

\## 3.2 TASK GENERATION FALLBACK (NOT CRON)

Handled in API:

GET /tasks/today

IF not exist:

→ enqueue TASK\_GENERATE\_SINGLE job

\---

\---

\## 3.3 LEADERBOARD UPDATE JOB

\### Schedule:

\- Every 3–6 hours

\---

\### Responsibilities:

FOR each user:

avg\_emission =

total\_emission / total\_days\_logged

Update leaderboard collection

\---

\### Optimization:

\- Batch processing (100–500 users per job)

\- Avoid full-table scans

\---

\---

\## 3.4 BADGE RETRY JOB

\### Trigger:

\- Failed badge evaluation

\---

\### Responsibilities:

Retry badge assignment:

FOR each failed event:

re-evaluate condition

insert if valid

\---

\### Retry Strategy:

\- Max retries: 3

\- Backoff: exponential

\---

\---

\## 3.5 STREAK PRECOMPUTE JOB (OPTIONAL FUTURE)

⚠️ Current design:

→ Streak updates on app open (lazy)

Optional optimization:

\### Schedule:

\- Daily midnight

\### Purpose:

\- Precompute streak for all users

\- Reduce API latency

\---

\---

\## 3.6 ML PROCESSING JOB (FUTURE)

\### Schedule:

\- Daily / weekly

\### Tasks:

\- Train/update model

\- Generate predictions

\---

\# 4. JOB DATA STRUCTURE

Standard job format:

\`\`\`json

{

"job\_id": "...",

"type": "TASK\_RESET | LEADERBOARD\_UPDATE | BADGE\_RETRY",

"payload": { ... },

"priority": "low | medium | high",

"retry\_count": 0,

"created\_at": "timestamp"

}

5\. QUEUE STRATEGY
==================

Separate Queues
---------------

*   task\_queue
    
*   leaderboard\_queue
    
*   badge\_queue
    

Priority Handling
-----------------

*   High: task reset
    
*   Medium: leaderboard
    
*   Low: badge retry
    

6\. FAILURE HANDLING
====================

Job Failure
-----------

IF job fails:

→ retry (max 3 times)

Persistent Failure
------------------

→ log to error collection→ mark as failed→ manual inspection

Idempotency
-----------

All jobs must be safe to re-run:

*   Task generation → check existence
    
*   Leaderboard → overwrite safe
    
*   Badge → UNIQUE constraint
    

7\. SCALING STRATEGY
====================

Horizontal Scaling
------------------

*   Multiple workers per queue
    
*   Auto-scale based on load
    

Partitioning
------------

*   Users split across batches
    
*   Avoid single massive jobs
    

8\. MONITORING
==============

Track:

*   job success rate
    
*   job latency
    
*   failure rate
    
*   retry count
    

Tools:

*   Bull dashboard / custom logs
    

9\. SECURITY & SAFETY
=====================

*   Validate payload before execution
    
*   Prevent duplicate job execution
    
*   Rate limit job dispatching
    

10\. FINAL SYSTEM FLOW
======================

Midnight Flow
-------------

CRON↓Dispatch TASK\_RESET\_JOB↓Queue↓Task Worker:→ delete yesterday tasks→ generate today tasks

Leaderboard Flow
----------------

CRON↓Dispatch LEADERBOARD\_JOB↓Queue↓Leaderboard Worker:→ compute averages→ update leaderboard

Badge Retry Flow
----------------

Failure Event↓Queue BADGE\_RETRY↓Worker retries badge logic

FINAL DEFINITION
================

Background Job System =Queue-driven async processing layerthat handles non-blocking system operationsreliably and scalably