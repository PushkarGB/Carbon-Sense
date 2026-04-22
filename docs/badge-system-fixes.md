# Badge System Fixes

## What Was Broken

1. `first_task` could fail to unlock.
   - Badge evaluation counted only category totals from `task_stats`.
   - System completions like `daily_input` and `weekly_input` did not increase that count, so the first completion path could be skipped.

2. Daily and weekly input completions were not contributing to total task progress.
   - Profile updates from activity submission completed system tasks, but there was no persisted `total_tasks_completed` metric that badge evaluation could trust.

3. Badge listeners were too easy to miss at app startup.
   - The badge engine module registration depended on module wiring that was not explicit enough for all runtime paths.

4. Badge popups could be missed after app relaunch or on app-open streak updates.
   - The app used an in-memory badge count, so badges awarded while the app was closed or during fresh startup were not always surfaced.

5. Awareness progress for AQI checking had a dead path on mobile.
   - The backend supported `aqi_screen_viewed`, but the mobile dashboard was not sending that signal.

6. Back-to-back badge awards could race on the app side.
   - If a second badge update arrived while a badge dialog was already open, the older popup flow could skip showing the later unlock cleanly.

## Fixes Applied

### Backend

- Added `engagement_metrics.total_tasks_completed` to `user_profiles`.
- Initialize `total_tasks_completed` during signup.
- Increment `total_tasks_completed` when tasks are completed through:
  - daily input / weekly input auto-completion in `ActivityService`
  - manual and automatic task completion in `TasksService`
- Updated badge evaluation so `first_task` uses `engagement_metrics.total_tasks_completed`.
- Kept category badges based on `task_stats` so category-specific badge rules still behave as intended.
- Updated profile badge progress mapping so `first_task` reflects the new total completion metric.
- Imported `BadgeEngineModule` directly in the root app module so badge listeners are registered consistently.

### Mobile App

- Added persisted badge-popup tracking via `LifestylePrefs`.
- Reworked the shell badge unlock flow to:
  - detect newly unlocked badges from the profile response
  - show missed unlocks after relaunch
  - queue later unlocks if another badge dialog is already being shown
- Added a cinematic unlock dialog with:
  - one-shot Lottie success animation
  - delayed badge reveal animation
  - animated title and premium presentation
- Sent `aqi_screen_viewed` from the dashboard so AQI awareness task completion can trigger.

## Trigger Coverage After Fix

### Daily / Weekly Inputs

- User submits daily or weekly input.
- Backend updates profile stats.
- System tasks such as `daily_input` / `weekly_input` are evaluated.
- `total_tasks_completed` is incremented.
- Badge evaluation can now unlock:
  - `first_task`
  - any streak badge if streak also changed
  - any related badge surfaced through the updated profile fetch

### Manual or Auto Task Completion

- Task is marked completed manually or auto-completed by awareness signals.
- Backend updates:
  - `engagement_metrics.total_tasks_completed`
  - category counters in `task_stats` where applicable
  - `task_completion_rate`
- Badge evaluation can now unlock:
  - `first_task`
  - category badges like eco action / awareness / emission reduction milestones

### Streak Updates

- App open and activity flows that update `streak_days` continue to trigger badge evaluation.
- The app-side popup flow now reliably shows newly awarded streak badges, including badges earned across launches.

## Files Changed

### Backend

- `backend/src/app.module.ts`
- `backend/src/auth/auth.service.ts`
- `backend/src/activity/activity.service.ts`
- `backend/src/tasks/tasks.service.ts`
- `backend/src/badge-engine/badge-engine.service.ts`
- `backend/src/experience/profile.service.ts`
- `backend/src/schemas/user-profile.schema.ts`

### Tests

- `backend/src/activity/activity.service.spec.ts`
- `backend/src/tasks/tasks.service.spec.ts`
- `backend/src/badge-engine/badge-engine.service.spec.ts`
- `backend/src/experience/profile.service.spec.ts`

### Mobile

- `mobile/lib/core/preferences/lifestyle_prefs.dart`
- `mobile/lib/features/profile/profile_models.dart`
- `mobile/lib/features/shell/shell_screen.dart`
- `mobile/lib/features/shell/tabs/dashboard_tab.dart`

## Verification

- `backend`: `npm run build` passed.
- `backend`: `badge-engine.service.spec.ts` passed.
- `backend`: `tasks.service.spec.ts` passed.
- `mobile`: focused `flutter analyze` on updated badge-related files passed with no issues.

## Known Follow-Up

- `activity.service.spec.ts` is currently failing because the test session mock does not implement `withTransaction(...)`.
- That failure is a pre-existing test harness mismatch and is not caused by the badge-system changes.
