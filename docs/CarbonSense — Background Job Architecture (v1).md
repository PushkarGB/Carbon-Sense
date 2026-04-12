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

**Related:** *CarbonSense — Technology Stack (Finalized v1.2)* §5 (cache + queue layer) and §6 (background job system) summarize Redis, BullMQ, and cron placement; this document is the **contract** for job names, payloads (**§4**), and flows (**§3**, **§10**). Badge retry logging details: *CarbonSense — Error Handling & System Resilience (v1.2)* §6–§9.

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

Dedicated processors for each queue:

\- **task_queue** — one worker handles **TASK_RESET** (midnight batch) and **TASK_GENERATE_SINGLE** (single user + date from §3.2), distinguished by Bull **job.name**.

\- **leaderboard_queue** — **LEADERBOARD_UPDATE** (scheduled full refresh).

\- **badge_queue** — **BADGE_RETRY** (§3.4).

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

\### Live notes (NestJS + BullMQ reference)

\- **Queue:** **task_queue**. **Bull job name:** **TASK_GENERATE_SINGLE**.

\- **Payload (job.data):** \`type\` = \`TASK_GENERATE_SINGLE\`; \`user_id\` (string ObjectId); \`date\` (YYYY-MM-DD for the IST “today” row); string \`priority\` (e.g. \`medium\`); \`created_at\` (ISO). BullMQ also stores a numeric **priority** on the job (medium tier).

\- **Dedup:** stable Bull \`jobId\` per user + date (e.g. \`task-gen-{userId}-{date}\`) so repeated **GET /tasks/today** does not flood the queue.

\- **API behavior:** The handler still runs the same idempotent personalization path in-process so the **HTTP response** returns today’s tasks immediately; the queue records the fallback for durability and worker-side retries.

\- **Without Redis / workers:** When background jobs are disabled (e.g. \`DISABLE_BULLMQ\` in tests), enqueue is skipped and generation remains API-only.

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

\### Manual refresh (Execution Flow §9)

\- **POST /leaderboard/refresh** (authenticated): recomputes **only** the signed-in user’s **leaderboards** document from **carbon_records** (same aggregation rules as the cron job; upserts zeros if the user has no carbon rows). Does **not** require the cron queue; uses the shared computation service.

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

BullMQ supplies **job.id** (use as \`job\_id\` when writing **job_logs**). The application stores a **logical** \`type\` string and optional fields on **job.data** (and sets Bull numeric **priority** on \`Queue.add\`).

\### Shared shape (illustrative)

\`\`\`json

{

  "type": "TASK_RESET | TASK_GENERATE_SINGLE | LEADERBOARD_UPDATE | BADGE_RETRY",

  "priority": "high | medium | low",

  "created_at": "ISO-8601 timestamp",

  "...": "job-specific fields (see below)"

}

\`\`\`

\### TASK\_RESET (cron → task_queue)

\`\`\`json

{

  "type": "TASK_RESET",

  "priority": "high",

  "created_at": "2026-04-12T18:30:00.000Z"

}

\`\`\`

\### TASK\_GENERATE\_SINGLE (GET /tasks/today → task_queue)

\`\`\`json

{

  "type": "TASK_GENERATE_SINGLE",

  "priority": "medium",

  "user_id": "64a1b2c3d4e5f6789012345",

  "date": "2026-04-12",

  "created_at": "2026-04-12T10:15:00.000Z"

}

\`\`\`

\### LEADERBOARD\_UPDATE (cron → leaderboard_queue)

\`\`\`json

{

  "type": "LEADERBOARD_UPDATE",

  "priority": "medium",

  "created_at": "2026-04-12T14:00:00.000Z"

}

\`\`\`

\### BADGE\_RETRY (failure hook → badge_queue)

Aligns with *Error Handling & System Resilience* §6. **trigger_event** selects which evaluator to run; **payload** is the full original event object (same fields as **TASK_EVALUATED** / **STREAK_UPDATED** / **EMISSION\_UPDATED** API events, including \`userId\`).

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

\### Persistence note (**job_logs** collection)

The **Complete Database Schema** defines \`job_logs.type\` as \`TASK_RESET | LEADERBOARD | BADGE_RETRY\` (not \`LEADERBOARD_UPDATE\`). Implementations should map Bull job names to that enum when persisting failures (e.g. **LEADERBOARD\_UPDATE** → **LEADERBOARD**).

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

CRON → dispatch **TASK_RESET** → **task_queue** → worker: delete yesterday’s **user_daily_tasks** per user → ensure today’s row (personalization engine).

Task fallback (same queue)
---------------------------

**GET /tasks/today** (no row for today) → dispatch **TASK_GENERATE_SINGLE** → **task_queue** → worker: idempotent **ensure** today’s **user_daily_tasks** (validates \`user_id\` + \`date\` in payload).

Leaderboard Flow
----------------

CRON → dispatch **LEADERBOARD_UPDATE** → **leaderboard_queue** → worker: aggregate **carbon_records** → upsert **leaderboards**.

Manual leaderboard (API, not queued)
------------------------------------

**POST /leaderboard/refresh** → same aggregation rules for **one** user (Execution Flow §9).

Badge Retry Flow
----------------

In-process badge evaluation throws → enqueue **BADGE_RETRY** on **badge_queue** → worker re-runs evaluation from **job.data** → **user_badges** insert remains idempotent (unique index).

FINAL DEFINITION
================

Background Job System =Queue-driven async processing layerthat handles non-blocking system operationsreliably and scalably