# User Personalization and Badge Stats

This document maps the user-level stats that are tracked in CarbonSense and explains which ones are updated for:

- task personalization
- badge evaluation
- app-side UX that depends on those stats

It is based on the current backend and mobile app implementation, not just the design docs.

## 1. Backend source of truth

The main persistent source of truth is `backend/src/schemas/user-profile.schema.ts`.

### 1.1 Core persisted stats in `user_profiles`

| Area | Fields | Why it matters |
| --- | --- | --- |
| Onboarding | `onboarding_completed`, `onboarding_defaults.transport_mode`, `onboarding_defaults.avg_daily_distance_km`, `onboarding_defaults.electricity_units_per_day`, `onboarding_defaults.ac_hours_per_day`, `onboarding_defaults.diet_type`, `onboarding_defaults.meals_per_day`, `onboarding_defaults.waste_bags_per_day` | Seeds the user's baseline lifestyle profile and is reused by the app to prefill logging flows. |
| Streak and consistency | `streak_days`, `last_streak_update`, `consecutive_submission_days`, `last_submission_date` | `streak_days` is used in personalization and badge evaluation. `consecutive_submission_days` is tracked, but is not currently used by personalization or badges. |
| Task counters | `task_stats.eco_action`, `task_stats.emission_reduction`, `task_stats.awareness` | Direct input to task-category badge evaluation. |
| Performance | `performance_metrics.baseline_emission`, `performance_metrics.baseline_status`, `performance_metrics.current_avg_emission`, `performance_metrics.reduction_percent` | Used by personalization and performance badges. |
| Behavior profile | `behavior_profile.avg_transport_mode`, `behavior_profile.avg_distance`, `behavior_profile.avg_ac_hours`, `behavior_profile.avg_energy_usage`, `behavior_profile.eco_action_score` | Main stored behavioral inputs for personalization and some task auto-evaluation. |
| Engagement | `engagement_metrics.task_completion_rate`, `engagement_metrics.total_days_logged`, `engagement_metrics.app_open_count` | `task_completion_rate` and `app_open_count` are used for engagement tracking; `task_completion_rate` directly affects personalization. |
| Weekly insights | `weekly_insights.total_weeks_logged`, `weekly_insights.last_weekly_submission_date`, `weekly_insights.latest_weekly_emission`, `weekly_insights.average_weekly_emission`, `weekly_insights.emission_trend`, `weekly_insights.avg_transport_mode`, `weekly_insights.avg_distance`, `weekly_insights.avg_ac_hours`, `weekly_insights.avg_energy_usage`, `weekly_insights.eco_action_score`, `weekly_insights.diet_non_veg_day_fraction` | Used as a fallback or supplement when recent daily history is thin. |

### 1.2 When these stats are initialized

User profile defaults are created during registration in `backend/src/auth/auth.service.ts`.

Initial values include:

- all task counters at `0`
- streak at `0`
- app open count at `0`
- task completion rate at `0`
- total days logged at `0`
- behavior profile fields at `0` or `'none'`
- performance metrics at `0`, with `baseline_status = 'pending'`
- weekly insights at `0` and `last_weekly_submission_date = '1970-01-01'`
- onboarding not completed and `onboarding_defaults = null`

## 2. What gets updated, and by what flow

### 2.1 Onboarding completion

`backend/src/onboarding/onboarding.service.ts`

Updates:

- `onboarding_completed`
- `onboarding_defaults.*`
- `updated_at`

These values are later used by the app for prefilling daily and weekly logging, and they indirectly shape future personalization.

### 2.2 App open

`backend/src/app.service.ts`

Updates:

- `engagement_metrics.app_open_count` is incremented on every app open
- `streak_days` is incremented or reset based on consecutive app opens
- `last_streak_update` is set to today

Effects:

- emits `STREAK_UPDATED`
- badge engine uses the streak event for streak badges
- personalization uses `streak_days`

Important nuance:

- this streak is app-open based, not submission based
- `consecutive_submission_days` is tracked separately elsewhere

### 2.3 Daily activity submission

`backend/src/activity/activity.service.ts`

Daily submission updates:

- `behavior_profile.*`
- `performance_metrics.*`
- `engagement_metrics.total_days_logged`
- `last_submission_date`
- `consecutive_submission_days`
- `updated_at`

It also evaluates today's tasks and may update:

- `task_stats.*`
- `engagement_metrics.task_completion_rate`

It emits:

- `TASK_EVALUATED`
- `EMISSION_UPDATED`

These events are what trigger badge evaluation.

### 2.4 Weekly activity submission

`backend/src/activity/activity.service.ts`

Weekly submission updates:

- `weekly_insights.*`
- `updated_at`

It can also update task results for the weekly task set, which means it may also change:

- `task_stats.*`
- `engagement_metrics.task_completion_rate`

Weekly submissions do not update `performance_metrics`, because performance is based on daily `carbon_records`.

### 2.5 Manual and awareness task completion

`backend/src/tasks/tasks.service.ts`

Task completion endpoints update:

- `task_stats.*`
- `engagement_metrics.task_completion_rate`
- `updated_at`

They emit:

- `TASK_EVALUATED`

This is the path used by:

- manually completed tasks
- hybrid tasks confirmed manually
- awareness tasks auto-completed from app signals

## 3. Stats used for personalization

The personalization engine lives in:

- `backend/src/tasks/task-generation.engine.ts`
- `backend/src/tasks/tasks.service.ts`
- `backend/src/activity/activity.service.ts`

### 3.1 Stored stats directly used by personalization

These stored values are read when generating daily tasks:

- `behavior_profile.avg_transport_mode`
- `behavior_profile.avg_distance`
- `behavior_profile.avg_ac_hours`
- `behavior_profile.avg_energy_usage`
- `behavior_profile.eco_action_score`
- `weekly_insights.*` as a fallback blend with recent daily behavior
- `performance_metrics.baseline_emission`
- `performance_metrics.baseline_status`
- `performance_metrics.current_avg_emission`
- `engagement_metrics.task_completion_rate`
- `streak_days`

### 3.2 Derived signals used by personalization

These are computed at generation time and are not all persisted as top-level profile fields:

- `avgEmission7d`
- `emissionHistoryTotals`
- `emissionTrend`
- `user_task_level`
- `engagement_level`
- `consistency_level`
- `emission_level`
- `behavior_tags`

Behavior tags currently derived:

- `PRIVATE_TRANSPORT_USER`
- `PUBLIC_TRANSPORT_USER`
- `WALK_PRIMARY_USER`
- `HIGH_AC_USER`
- `HIGH_ENERGY_USER`
- `LONG_DISTANCE_USER`
- `LOW_ECO_ACTIVITY`
- `HIGH_ECO_ACTIVITY`
- `NON_VEG_DIET_PATTERN`
- `HIGH_EMISSION_SPIKES`

These tags influence both filtering and scoring of task templates.

### 3.3 Conditional stats used to filter tasks

Task template conditions can require:

- minimum or maximum average distance
- minimum or maximum AC hours
- minimum or maximum energy usage
- all required behavior tags
- any required behavior tags

So the main personalization filter inputs are:

- `avg_distance`
- `avg_ac_hours`
- `avg_energy_usage`
- derived behavior tags

### 3.4 Scoring stats used to rank tasks

Ranking uses:

- emission level
- engagement level
- consistency level
- user task level
- streak days
- task completion rate
- average 7 day emissions
- emission trend
- behavior tags

### 3.5 Important personalization nuance

`diet_non_veg_day_fraction` is computed from recent daily logs in `task-generation.engine.ts`, but it is not stored in `user_profiles.behavior_profile`.

Current behavior is:

- daily diet pattern is derived on the fly from recent daily logs
- weekly diet pattern is persisted in `weekly_insights.diet_non_veg_day_fraction`
- the merged task-generation behavior profile uses both

So diet is part of personalization, but only partially persisted.

## 4. Stats used for badge evaluation

Badge evaluation is handled in `backend/src/badge-engine/badge-engine.service.ts`.

### 4.1 Task-category badges

Uses:

- `task_stats.eco_action`
- `task_stats.emission_reduction`
- `task_stats.awareness`

These drive badge categories:

- `eco_action`
- `emission_reduction`
- `awareness`

### 4.2 First task badge

Uses:

- total tasks completed across all categories

Computed as:

- `task_stats.eco_action + task_stats.emission_reduction + task_stats.awareness`

If total is at least `1`, the `first_task` badge is awarded.

### 4.3 Streak badges

Uses:

- `streak_days`

This is read from the `STREAK_UPDATED` event payload.

It drives:

- threshold-based streak badges
- the special `perfect_week` badge at 7 days

### 4.4 Performance badges

Uses:

- `performance_metrics.reduction_percent`

This is read after `EMISSION_UPDATED` and compared with performance badge thresholds.

### 4.5 Badge master data

Seeded badges in `backend/src/scripts/seed-badges.ts` currently evaluate against:

- eco action task count
- emission reduction task count
- awareness task count
- streak day count
- reduction percent

## 5. App-side tracked state related to personalization and badges

The mobile app mostly reads backend stats rather than owning them, but it does track a few local values that support these flows.

### 5.1 App-local stats and flags

`mobile/lib/core/preferences/lifestyle_prefs.dart`

Local values stored on device:

- `lifestyle.electricity.units_per_month`
- `lifestyle.electricity.last_updated_yyyy_mm`
- `lifestyle.waste.bags_per_month`
- `lifestyle.waste.last_updated_yyyy_mm`
- `logs.daily.last_ymd`
- `logs.weekly.last_ymd`
- `streak.popup.pending_ymd`
- `streak.popup.shown_ymd`
- `streak.popup.value`

What they do:

- monthly electricity and waste values help the app derive daily submission payloads
- last daily and weekly log dates are UI duplicate guards
- streak popup fields are purely UX state for showing streak celebration

These are not the backend source of truth for personalization or badges.

### 5.2 App actions that feed awareness task progress

The mobile app sends awareness completion signals through `/tasks/evaluate`.

Current wired signals:

- `insights_screen_viewed`
- `comparison_viewed`
- `trend_viewed`

Files:

- `mobile/lib/features/shell/tabs/insights_tab.dart`
- `mobile/lib/features/tasks/awareness_signals.dart`
- `mobile/lib/features/tasks/tasks_evaluate_repository.dart`

These signals can cause awareness tasks to complete, which then increments:

- `task_stats.awareness`
- `engagement_metrics.task_completion_rate`

and can therefore unlock awareness badges.

### 5.3 App surfaces that display personalization and badge stats

Dashboard reads and shows:

- `streak_days`
- `performance_metrics.baseline_emission`
- `performance_metrics.current_avg_emission`
- `performance_metrics.reduction_percent`
- `weekly_insights.total_weeks_logged`
- `weekly_insights.last_weekly_submission_date`
- `onboarding_defaults.*`

Profile reads and shows:

- `streak_days`
- `badges_unlocked`
- badge `current_value`
- performance reduction percent
- leaderboard summary values

Badge gallery uses:

- `badge.threshold`
- `badge.current_value`
- `badge.achieved`

to show unlock progress and status.

## 6. End-to-end mapping

### 6.1 Personalization-critical stats

The most important stats for personalization are:

- `behavior_profile.avg_transport_mode`
- `behavior_profile.avg_distance`
- `behavior_profile.avg_ac_hours`
- `behavior_profile.avg_energy_usage`
- `behavior_profile.eco_action_score`
- `weekly_insights.diet_non_veg_day_fraction`
- `performance_metrics.baseline_emission`
- `performance_metrics.baseline_status`
- `performance_metrics.current_avg_emission`
- `engagement_metrics.task_completion_rate`
- `streak_days`
- recent `carbon_records` used to derive `avgEmission7d` and `emissionTrend`

### 6.2 Badge-critical stats

The most important stats for badge evaluation are:

- `task_stats.eco_action`
- `task_stats.emission_reduction`
- `task_stats.awareness`
- `streak_days`
- `performance_metrics.reduction_percent`

## 7. Notable implementation gaps and caveats

### 7.1 AQI awareness signal is defined on the backend but not sent by the app

Backend expects:

- `aqi_screen_viewed`

See:

- `backend/src/tasks/awareness-task.logic.ts`
- `backend/src/tasks/dto/evaluate-tasks.dto.ts`

But the mobile app currently sends only:

- `insights_screen_viewed`
- `comparison_viewed`
- `trend_viewed`

I could not find any mobile code sending `aqi_screen_viewed`.

Impact:

- the `check_aqi` awareness task appears to be configured in backend seed data
- but it may never auto-complete from current app behavior
- which also means its related awareness badge progress may stall unless completed another way

### 7.2 `consecutive_submission_days` is tracked but currently unused by badges and personalization

This stat is updated on daily activity submission, but current personalization and badge code does not consume it.

### 7.3 `app_open_count` is tracked but does not currently drive personalization or badges directly

It is part of engagement tracking, but current task generation uses `task_completion_rate`, not `app_open_count`.

## 8. Short answer

If the question is "which user stats actually matter today for personalization and badge evaluation?", the answer is:

- Personalization mainly depends on behavior averages, weekly insight fallbacks, emission performance, task completion rate, streak, and recent emission history.
- Badge evaluation mainly depends on task category counters, streak days, and reduction percent.
- The app mostly displays these backend stats and sends a few awareness-view signals, while keeping small local UX caches for onboarding baselines, log guards, and streak popups.
