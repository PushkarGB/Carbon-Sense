\# CarbonSense — Execution Flow (Refined v2)

\## CORE CHANGES APPLIED

1\. Streak system is now:

\- Independent of submission

\- Triggered on first app open of the day

\- Non-blocking (async)

2\. Task lifecycle updated:

\- Yesterday’s tasks are removed daily

\- Prevents late submissions completely

\---

\# 1. PRIMARY ENTRY POINT

POST /activity/daily

This remains the ONLY write entry for:

\- emissions

\- task evaluation

\- stats update

\---

\# 2. MAIN TRANSACTION FLOW (STRICT)

\## Atomic Block (MANDATORY TRANSACTION)

1\. Validate submission

2\. Store daily\_activity\_logs

3\. Calculate emissions
→ Fetch emission factors (cached)
→ Apply calculation logic

4\. Store carbon\_records

5\. Update user\_stats

6\. Evaluate tasks (auto + hybrid)

7\. Update task\_stats

If ANY step fails → rollback everything

\---

\# 3. REMOVED FROM TRANSACTION

These are now OUTSIDE the atomic block:

\- Streak update

\- Badge evaluation

\- Leaderboard update

Reason:

→ Reduce coupling

→ Improve reliability

→ Avoid blocking critical write path

\---

\# 4. ASYNC EVENT TRIGGERS

After successful transaction:

Trigger async events:

\- TASK\_EVALUATED

\- EMISSION\_UPDATED

These feed:

\- Badge Engine

\- Analytics (future)

\---

\# 5. STREAK SYSTEM (RE-DESIGNED)

\## Trigger

GET /app/open (or dashboard load)

\## Execution Rule

Runs ONLY once per day per user

\---

\## Flow

1\. Check last\_submission\_date

2\. Compare with today & yesterday

IF (submitted yesterday):

→ streak += 1

ELSE:

→ streak = 1

3\. Update user\_profile.streak\_days

\---

\## Properties

\- Independent of submission

\- Lazy evaluation

\- Non-blocking

\- No transaction dependency

\---

\# 6. TASK GENERATION + CLEANUP FLOW

\## CRON (MIDNIGHT)

For each user:

\### Step 1 — Cleanup

DELETE user\_daily\_tasks WHERE date = yesterday

\---

\### Step 2 — Generate Tasks

IF tasks for today DO NOT exist:

→ generate new tasks

\---

\## FALLBACK (APP OPEN)

GET /tasks/today

IF not exists:

→ generate tasks

\---

\## GUARANTEES

\- No stale tasks

\- No late completion possible

\- Clean daily reset

\---

\# 7. TASK EVALUATION FLOW (UPDATED)

Triggered ONLY after submission

For each task:

IF auto:

→ evaluate condition

IF hybrid:

→ evaluate + allow manual confirmation

IF completed:

→ update task status

→ increment task\_stats

\---

\# 8. BADGE ENGINE (ASYNC)

\## Trigger Sources

\- TASK\_EVALUATED

\- STREAK\_UPDATED

\- EMISSION\_UPDATED

\---

\## Execution

For relevant badge category only:

IF condition met

AND badge not exists:

→ insert into user\_badges

\---

\## Properties

\- Non-blocking

\- Idempotent (UNIQUE constraint)

\- Event-driven

\---

\# 9. LEADERBOARD SYSTEM

\## Cron-Based

Runs every X hours:

avg\_emission = total\_emission / total\_days\_logged

Update leaderboard

\---

\## Manual Refresh

POST /leaderboard/refresh

→ recompute for user only

\---

\# 10. FINAL SYSTEM PIPELINE

\## Submission Flow

POST /activity/daily

↓

\[TRANSACTION START\]

Validate

Store activity

Calculate emission

Store emission

Update stats

Evaluate tasks

\[TRANSACTION END\]

↓

Trigger async events

↓

Badge engine (async)

\---

\## App Open Flow

GET /app/open

↓

Check if streak updated today

↓

Update streak (if needed)

↓

Trigger streak badge evaluation (async)

\---

\## Midnight Flow

CRON

↓

Delete yesterday tasks

↓

Generate today tasks

\---

\# 11. FAILURE HANDLING (UPDATED)

\## Transaction Failure

→ Full rollback

\---

\## Async Failure (Badge / Streak)

→ Retry mechanism

→ Does NOT affect user submission

\---

\# FINAL RESULT

✔ Clean separation of concerns

✔ Reduced coupling

✔ No blocking dependencies

✔ Deterministic + scalable system

✔ No late task issues

✔ Streak logic simplified and robust

---

## Note — What this API does today

- **Daily and weekly submit** still own **saving the log**, **emissions**, **profile numbers**, and **auto / hybrid task checks** on the server. **Manual task complete** and **awareness “evaluate”** are separate endpoints; they only update **tasks** and **task stats**, not the activity log.

- **Streak** is updated on **GET /app/open** (lazy). When the backend is configured with **Redis and BullMQ** (*Background Job Architecture*), **midnight cron** dispatches **TASK_RESET** on **task_queue** (delete yesterday’s `user_daily_tasks` per user, ensure today’s row). **GET /tasks/today** still on-demand creates today’s tasks if missing and, when workers are enabled, may enqueue **TASK_GENERATE_SINGLE** for the same operation. If workers are disabled, rely on **GET /tasks/today** and submit-time generation as in the Daily Task doc, section 17.

- **Leaderboard:** With workers enabled, a cron job dispatches **LEADERBOARD_UPDATE** on **leaderboard_queue** to refresh **`leaderboards`** from **`carbon_records`**. **POST /leaderboard/refresh** (JWT, §9) recomputes the signed-in user’s leaderboard row only.