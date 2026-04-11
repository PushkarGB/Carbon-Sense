\# CarbonSense — Task Personalization Engine (v1)
=================================================

\## OBJECTIVE
=============

Select the most relevant 4–6 tasks per user per day based on:
=============================================================

\- User behavior patterns
=========================

\- Emission trends
==================

\- Engagement level
===================

\- Difficulty progression
=========================

Goal:
=====

→ Maximize behavior change, not random task distribution
========================================================

\---
====

\# 1. ENGINE POSITION IN SYSTEM
===============================

Task Generation Flow:
=====================

Task Templates
==============

↓
=

Personalization Engine ← (THIS SYSTEM)
======================================

↓
=

Filtered + Ranked Tasks
=======================

↓
=

Final Daily Task Set
====================

\---
====

\# 2. INPUT SIGNALS (DATA SOURCES)
==================================

\## 2.1 Behavioral Signals
==========================

From last 7 days:
=================

\- avg\_transport\_mode
=======================

\- avg\_distance\_travelled
===========================

\- avg\_ac\_usage
=================

\- avg\_energy\_usage
=====================

\- eco\_task\_completion\_rate
==============================

\---
====

\## 2.2 Emission Signals
========================

\- avg\_emission (7 days)
=========================

\- emission\_trend (increasing / stable / decreasing)
=====================================================

\---
====

\## 2.3 Engagement Signals
==========================

\- task\_completion\_rate (%)
=============================

\- streak\_days
===============

\- app\_open\_frequency (optional future)
=========================================

\---
====

\## 2.4 Constraints
===================

\- cooldown\_days
=================

\- avoid yesterday tasks
========================

\- category balance
===================

\---
====

\# 3. USER PROFILING MODEL
==========================

Each user is classified dynamically:
====================================

\## 3.1 Emission Level
======================

\- LOW
======

\- MEDIUM
=========

\- HIGH
=======

Based on percentile or threshold
================================

\---
====

\## 3.2 Engagement Level
========================

\- LOW → completion < 40%
=========================

\- MEDIUM → 40–70%
==================

\- HIGH → > 70%
===============

\---
====

\## 3.3 Consistency Level
=========================

\- LOW → streak < 3
===================

\- MEDIUM → 3–10
================

\- HIGH → > 10
==============

\---
====

\## 3.4 Behavior Tags (Derived)
===============================

Examples:
=========

\- HIGH\_AC\_USER
=================

\- PRIVATE\_TRANSPORT\_USER
===========================

\- LOW\_ECO\_ACTIVITY
=====================

\- HIGH\_EMISSION\_SPIKES
=========================

\---
====

\# 4. TASK SELECTION STRATEGY
=============================

We do NOT randomly pick tasks.
==============================

We follow 3-stage filtering:
============================

\---
====

\## STAGE 1 — HARD FILTER
=========================

Remove:
=======

\- inactive tasks
=================

\- cooldown tasks
=================

\- yesterday tasks
==================

\- invalid conditions
=====================

\---
====

\## STAGE 2 — CONTEXT MATCHING
==============================

Match tasks based on behavior:
==============================

Examples:
=========

IF PRIVATE\_TRANSPORT\_USER:
============================

→ add transport reduction tasks
===============================

IF HIGH\_AC\_USER:
==================

→ add AC reduction tasks
========================

IF LOW\_ECO\_ACTIVITY:
======================

→ add eco\_action tasks
=======================

\---
====

\## STAGE 3 — SCORING + RANKING
===============================

Each task gets a score:
=======================

task\_score =
=============

relevance\_score +
==================

behavior\_impact\_score +
=========================

engagement\_fit\_score +
========================

difficulty\_score
=================

\---
====

\# 5. SCORING SYSTEM
====================

\## 5.1 Relevance Score (0–5)
=============================

How well task matches behavior
==============================

Example:
========

\- AC task for high AC user → 5
===============================

\- irrelevant task → 1
======================

\---
====

\## 5.2 Behavior Impact Score (0–5)
===================================

Estimated emission reduction potential
======================================

\- transport change → high
==========================

\- awareness → low
==================

\---
====

\## 5.3 Engagement Fit Score (0–5)
==================================

Based on user engagement:
=========================

LOW engagement:
===============

→ simple tasks get higher score
===============================

HIGH engagement:
================

→ challenging tasks get higher score
====================================

\---
====

\## 5.4 Difficulty Score (0–5)
==============================

Aligned with user level:
========================

Beginner:
=========

→ easy tasks score higher
=========================

Advanced:
=========

→ strict tasks score higher
===========================

\---
====

\# 6. DIFFICULTY PROGRESSION SYSTEM
===================================

\## Levels
==========

\### Beginner
=============

\- Simple manual tasks
======================

\- Awareness tasks
==================

\- Easy eco habits
==================

\---
====

\### Intermediate
=================

\- Hybrid tasks
===============

\- Behavior comparison tasks
============================

\- Light reduction goals
========================

\---
====

\### Advanced
=============

\- Strict reduction tasks
=========================

\- Performance-based tasks
==========================

\- Multi-condition tasks
========================

\---
====

\## Level Calculation
=====================

user\_level = f(
================

task\_completion\_rate,
=======================

streak\_days,
=============

emission\_trend
===============

)
=

\---
====

\# 7. FINAL TASK COMPOSITION
============================

Always enforce:
===============

\- 1 system task (mandatory)
============================

\- 1–2 eco\_action
==================

\- 1–2 emission\_reduction
==========================

\- 0–1 awareness
================

\---
====

\## Selection Logic
===================

From ranked tasks:
==================

Pick top tasks per category
===========================

Ensure:
=======

\- diversity
============

\- relevance
============

\- difficulty alignment
=======================

\---
====

\# 8. ANTI-REPETITION LOGIC
===========================

\- No task repeated from yesterday
==================================

\- Cooldown respected
=====================

\- Avoid same pattern overload
==============================

\---
====

\# 9. FALLBACK STRATEGY
=======================

If insufficient tasks:
======================

\- Relax cooldown
=================

\- Reduce strict filtering
==========================

\- Fill with safe eco tasks
===========================

\---
====

\# 10. OUTPUT
=============

\`\`\`json
==========

{
=

"user\_id": "...",
==================

"date": "...",
==============

"tasks": \[ ... \]
==================

}11. FUTURE EXTENSION (ML READY)
================================

This engine is designed to plug ML later:

*   Replace scoring with ML ranking model
    
*   Use reinforcement learning
    
*   Predict task success probability
    

FINAL DEFINITION
================

Personalization Engine =Rule-based adaptive task selectorthat evolves into ML-driven system