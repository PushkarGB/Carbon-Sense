# CarbonSense — Complete Behavior Specification (v1)

> **UI Implementation Source of Truth** — If this document conflicts with older product notes, follow this document.

---

## 1. Purpose

This document defines every UI screen, API contract, and interaction behavior for the CarbonSense mobile application. It is backend-aligned and fully verified against the running codebase.

---

## 2. Global Product Rules

### 2.1 Backend-Backed Domains

| Domain | Status |
|--------|--------|
| Authentication (register, login, /me) | ✅ Live |
| Onboarding (POST /onboarding/complete) | ✅ Live |
| App open / streak tracking (GET /app/open) | ✅ Live |
| Daily activity submission | ✅ Live |
| Weekly activity submission | ✅ Live |
| Personalized daily tasks | ✅ Live |
| Manual + awareness task completion | ✅ Live |
| Dashboard home | ✅ Live |
| Insights summary | ✅ Live |
| Profile overview | ✅ Live |
| Badge gallery | ✅ Live |
| Leaderboard list + refresh | ✅ Live |
| AQI data (AQICN integration) | ✅ Live |
| Seed scripts (badges, tasks, emission factors) | ✅ Available via `npm run seed` |

### 2.2 Date & Time Rules

All behavior is based on `Asia/Kolkata` (IST, UTC+05:30).

- Daily submission `date` must equal today in IST.
- Weekly unlock is based on the user's `created_at` in IST.
- Daily task expiry: `{date}T23:59:59.999+05:30`.
- All date fields use `YYYY-MM-DD` format.

### 2.3 Error Contract

All API errors return:

```json
{
  "error": "STABLE_ERROR_CODE",
  "message": "Human readable message"
}
```

UI must switch on `error` codes, not `message` text.

### 2.4 Navigation

Bottom navigation: `Dashboard | Input | Insights | Leaderboard | Profile`

All five tabs are fully backend-wired.

---

## 3. Lottie Guidance

### 3.1 Required Lottie Usage

Use Lottie animations for:
- Login / signup hero areas
- Onboarding step headers (4 steps)
- Multi-page daily input headers
- Multi-page weekly input headers
- Success confirmations (submission, task completion)
- Error states
- Empty states (no data, no tasks, no badges)
- Loading skeletons

### 3.2 Lottie Rules
- Always loop idle/loading animations
- Play success/error once, then hold final frame
- Provide `SizedBox` constraints to prevent layout shift
- Use `LottieBuilder.asset` for bundled files

---

## 4. Authentication

### 4.1 Registration

**Endpoint:** `POST /auth/register`

**Request:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "city": "string (from Maharashtra city list)",
  "role": "student | faculty | staff",
  "profile_picture_url": "string (Cloudinary URL)"
}
```

**City Selection:** The UI must present a **searchable dropdown** of Maharashtra state cities. The list is defined in `src/constants/maharashtra-cities.ts` and includes 43 cities (Mumbai, Pune, Nagpur, Nashik, Kolhapur, etc.). No free-text city input.

**Profile Picture Flow:**
1. User captures/selects image in the Flutter app
2. Flutter uploads to Cloudinary (unsigned upload preset, client-side)
3. Cloudinary returns the hosted URL
4. Flutter sends the URL as `profile_picture_url` in the registration request
5. Backend stores the URL in `users.profile_picture_url`

**Flutter Cloudinary Config:**
- `CLOUDINARY_CLOUD_NAME` — your Cloudinary cloud name
- `CLOUDINARY_UPLOAD_PRESET` — unsigned upload preset name

**Response:** Returns JWT token + user object.

**After Registration:**
- `onboarding_completed` is `false`
- `onboarding_defaults` is `null`
- App should navigate to the onboarding flow

### 4.2 Login

**Endpoint:** `POST /auth/login`

**Request:** `{ "email": "string", "password": "string" }`

**Response:** JWT token + user object.

### 4.3 Me

**Endpoint:** `GET /auth/me` (JWT protected)

**Response:** Full user object. Use to refresh cached profile picture URL on app launch.

---

## 5. Onboarding

**Endpoint:** `POST /onboarding/complete` (JWT protected)

Accepts the user's lifestyle defaults. These serve as:
- Initial pre-fill values for daily/weekly input forms
- Baseline behavior signals for task personalization

**Request:**
```json
{
  "transport_mode": "car | bike | bus | metro | walk",
  "avg_daily_distance_km": 15,
  "electricity_units_per_day": 5,
  "ac_hours_per_day": 2,
  "diet_type": "veg | non_veg | mixed",
  "meals_per_day": 3,
  "waste_bags_per_day": 1
}
```

**Response:**
```json
{
  "message": "Onboarding completed",
  "onboarding_defaults": { ... }
}
```

**Behavior:**
- Idempotent: re-submission overwrites defaults
- Sets `onboarding_completed = true` in user profile
- Backend does NOT block app usage on missing onboarding
- UI should show onboarding if `onboarding_completed === false`

### 5.1 Onboarding Questionnaire (4 Steps)

Questions use **indirect/cryptic phrasing** while clearly conveying meaning.

#### Step 1 — Travel (Lottie: commuting animation)

| Question | Field | Input Type | Unit Note |
|----------|-------|------------|-----------|
| "How do you usually get around?" | `transport_mode` | Single-select: 🚗 Car · 🏍️ Bike · 🚌 Bus · 🚇 Metro · 🚶 Walk | — |
| "How far does your daily journey take you?" | `avg_daily_distance_km` | Slider 0–100 | km shown |

#### Step 2 — Energy (Lottie: electricity/power animation)

| Question | Field | Input Type | Unit Note |
|----------|-------|------------|-----------|
| "How much power does your day use?" | `electricity_units_per_day` | Slider 0–30 | kWh (tooltip: "1 unit = 1 kWh") |
| "How long does the cool breeze run?" | `ac_hours_per_day` | Slider 0–24 | hours |

#### Step 3 — Food (Lottie: food/dining animation)

| Question | Field | Input Type | Unit Note |
|----------|-------|------------|-----------|
| "What's on your plate most days?" | `diet_type` | Single-select: 🥗 Veg · 🍖 Non-Veg · 🥘 Mixed | — |
| "How many meals fill your day?" | `meals_per_day` | Stepper 1–6 | meals |

#### Step 4 — Waste (Lottie: recycling animation)

| Question | Field | Input Type | Unit Note |
|----------|-------|------------|-----------|
| "How many bags leave your doorstep?" | `waste_bags_per_day` | Stepper 0–10 | bags (show "1 bag ≈ 1 kg" below) |

---

## 6. App Open & Streak

**Endpoint:** `GET /app/open` (JWT protected)

Call this on every app launch (after JWT is available).

**Response:**
```json
{
  "message": "App open recorded",
  "streak_updated": true,
  "streak_days": 6
}
```

### 6.1 Streak Logic (Revised — Pure App-Open)

Streak is **decoupled from activity submissions**:

| Condition | Result |
|-----------|--------|
| `last_streak_update === today` | No change (already counted today) |
| `last_streak_update === yesterday` | `streak_days += 1` |
| `last_streak_update < yesterday` | `streak_days = 1` (reset) |

A user who opens the app daily but never submits data will still maintain a streak.

### 6.2 Consecutive Submission Days (Separate Counter)

`consecutive_submission_days` is tracked independently in `user_profiles`:

| Condition | Result |
|-----------|--------|
| Daily submission + `last_submission_date === yesterday` | `consecutive_submission_days += 1` |
| Daily submission + `last_submission_date !== yesterday` | `consecutive_submission_days = 1` |

This counter is used for future badge design (e.g., "submitted 7 days in a row") and is **not** the streak displayed to the user.

---

## 7. Daily Activity Submission

**Endpoint:** `POST /activity/daily` (JWT protected)

### 7.1 Daily Activity Questionnaire (5 Pages)

#### Page 1 — Move (Lottie: travel animation)

| Question | API Field | Input | Unit Note |
|----------|-----------|-------|-----------|
| "How did you travel today?" | `transport.mode` | Single-select: 🚗 Car · 🏍️ Bike · 🚌 Bus · 🚇 Metro · 🚶 Walk | — |
| "How far did the road take you?" | `transport.distance` | Slider 0–200 | km |

#### Page 2 — Power (Lottie: electricity animation)

| Question | API Field | Input | Unit Note |
|----------|-----------|-------|-----------|
| "How many units lit up your day?" | `electricity.units_consumed` | Slider 0–50 | kWh ("1 unit = 1 kWh") |
| "How long did the cool air flow?" | `electricity.ac_hours` | Slider 0–24 | hours |

#### Page 3 — Plate (Lottie: food animation)

| Question | API Field | Input | Unit Note |
|----------|-----------|-------|-----------|
| "What was the vibe on your plate?" | `food.diet_type` | Single-select: 🥗 Veg · 🍖 Non-Veg · 🥘 Mixed | — |
| "How many meals today?" | `food.meals_count` | Stepper 1–6 | meals |

#### Page 4 — Toss (Lottie: waste animation)

| Question | API Field | Input | Unit Note |
|----------|-----------|-------|-----------|
| "Did you sort before you tossed?" | `waste.segregation` | Toggle Yes/No | — |
| "How many bags went out?" | `waste.bags_used` | Stepper 0–10 | bags ("1 bag ≈ 1 kg") |

#### Page 5 — Green (Lottie: nature/eco animation)

| Question | API Field | Input | Unit Note |
|----------|-----------|-------|-----------|
| "Any green moves today?" | `eco_actions[]` | Multi-select chips | Eco action names from task templates |

### 7.2 Pre-fill Behavior

If `onboarding_defaults` is available (from `GET /dashboard/home`), pre-fill form fields:
- `transport.mode` ← `onboarding_defaults.transport_mode`
- `transport.distance` ← `onboarding_defaults.avg_daily_distance_km`
- `electricity.units_consumed` ← `onboarding_defaults.electricity_units_per_day`
- `electricity.ac_hours` ← `onboarding_defaults.ac_hours_per_day`
- `food.diet_type` ← `onboarding_defaults.diet_type`
- `food.meals_count` ← `onboarding_defaults.meals_per_day`
- `waste.bags_used` ← `onboarding_defaults.waste_bags_per_day`

### 7.3 Full Request Shape

```json
{
  "date": "2026-04-13",
  "transport": { "mode": "bus", "distance": 10 },
  "electricity": { "units_consumed": 5, "ac_hours": 2 },
  "food": { "diet_type": "veg", "meals_count": 3 },
  "waste": { "segregation": true, "bags_used": 1 },
  "eco_actions": ["eco_bag", "eco_bottle"]
}
```

### 7.4 Response

Returns `{ message, completed_task_ids, emission }` where `emission` contains the calculated breakdown and total.

---

## 8. Weekly Activity Submission

**Endpoint:** `POST /activity/weekly` (JWT protected)

Same request shape as daily. Uses weekly-themed Lottie headers. Framed as "Looking back at your week…"

**Key difference:** Weekly submissions are stored in a separate lane and do NOT affect the daily carbon record or leaderboard rankings. They update `weekly_insights` in the user profile.

---

## 9. Daily Tasks

### 9.1 Get Today's Tasks

**Endpoint:** `GET /tasks/today` (JWT protected)

If no tasks exist for today, they are generated on-demand using the personalization engine.

**Response:**
```json
{
  "date": "2026-04-13",
  "expires_at": "2026-04-13T23:59:59.999+05:30",
  "tasks": [
    {
      "task_id": "daily_input",
      "category": "system",
      "title": "Daily Log",
      "description": "Log your daily activity today",
      "status": "pending",
      "completion_type": "auto",
      "completed_at": null
    }
  ]
}
```

### 9.2 Complete Manual/Hybrid Task

**Endpoint:** `POST /tasks/complete` with `{ "task_id": "eco_bag" }`

Only for `manual` and `hybrid` completion types. Auto tasks are completed via submission or awareness signals.

### 9.3 Evaluate Awareness Tasks

**Endpoint:** `POST /tasks/evaluate`

**Request:**
```json
{
  "signals": {
    "aqi_screen_viewed": true,
    "insights_screen_viewed": true,
    "comparison_viewed": true,
    "trend_viewed": true
  }
}
```

### 9.4 Task Categories & Completion Types

| Category | Count | Completion | Examples |
|----------|-------|------------|----------|
| system | 2 | auto | daily_input, weekly_input |
| eco_action | 10 | manual | eco_bag, eco_bottle, eco_meatless |
| emission_reduction | 13 | auto / hybrid / manual | beat_yesterday, ac_reduce, lights_off |
| awareness | 4 | auto | check_aqi, view_insights, compare_day, trend_watch |

---

## 10. Dashboard Home

**Endpoint:** `GET /dashboard/home` (JWT protected)

### 10.1 Response Shape

```json
{
  "user": { "name", "email", "city", "role", "profile_picture_url" },
  "streak": { "streak_days": 6, "last_streak_update": "2026-04-13" },
  "today_emission": { "total_emission": 7.5, "breakdown": { ... }, "date": "..." } | null,
  "aqi": { "aqi": 87, "city": "mumbai", "pm25": 32, "pm10": 55, "no2": 10, "so2": 4, "co": 0.2, "fetched_at": "..." } | null,
  "tasks_progress": { "completed": 2, "pending": 3, "total": 5, "completion_rate": 0.4, "date": "...", "expires_at": "..." } | null,
  "performance_metrics": { "baseline_emission", "baseline_status", "current_avg_emission", "reduction_percent" },
  "weekly_insights": { ... },
  "onboarding_completed": true,
  "onboarding_defaults": { ... } | null,
  "projection": { "next_30_days": [...], "next_12_months": [...] } | null
}
```

### 10.2 Dashboard Layout

1. **Header:** User name, avatar (cached), streak badge
2. **Today's Emission Card:** Show total + breakdown donut chart (null → "No log today" with Lottie)
3. **AQI Card:** Color-coded AQI value + pollutant readings (null → "AQI unavailable")
4. **Task Progress Bar:** Completed/Total with tap-to-navigate to tasks list
5. **Performance Summary:** Baseline vs current emission, reduction percentage
6. **Projection Chart:** 30-day emission prediction line chart (null → hidden)
7. **Onboarding Banner:** Show if `onboarding_completed === false`, tap to navigate to onboarding

---

## 11. Insights Screen

**Endpoint:** `GET /insights/summary?range_days=7` or `?range_days=30` (JWT protected)

### 11.1 Response Shape

```json
{
  "range_days": 7,
  "emissions": [{ "date": "2026-04-10", "total_emission": 8 }, ...],
  "summary": { "average_emission", "total_emission", "min_emission", "max_emission", "days_with_data" },
  "trend": "increasing | stable | decreasing",
  "latest_breakdown": { "date", "values": { ... }, "percentages": { ... } } | null,
  "performance_metrics": { ... },
  "weekly_insights": { ... },
  "aqi": { ... } | null
}
```

### 11.2 Comparison Section (triggers `comparison_viewed`)

**UI:** A "Today vs Yesterday" card within the Insights screen.

- Shows today's total emission vs yesterday's total emission
- Visual: side-by-side bar comparison with delta indicator (↑/↓ percentage)
- Data source: use `emissions` array to find today's and yesterday's values
- **Trigger:** When the user scrolls to or taps into this panel, fire:
  ```
  POST /tasks/evaluate { "signals": { "comparison_viewed": true } }
  ```

### 11.3 Trend Section (triggers `trend_viewed`)

**UI:** A "Weekly Trend" chart within the Insights screen.

- Shows 7-day emission line/bar chart with trend arrow
- Uses `trend` field for classification (increasing/stable/decreasing)
- Data source: `emissions` array + `trend` field from `range_days=7` response
- **Trigger:** When the user scrolls to or taps into this chart, fire:
  ```
  POST /tasks/evaluate { "signals": { "trend_viewed": true } }
  ```

### 11.4 Layout

1. **Range Toggle:** 7 days / 30 days (segment control)
2. **Emission Chart:** Bar/line chart of daily emissions
3. **Summary Cards:** Average, min, max, total
4. **Comparison Card:** Today vs Yesterday (fires `comparison_viewed`)
5. **Trend Card:** Weekly trend with directional arrow (fires `trend_viewed`)
6. **Breakdown Donut:** Latest day's category percentages
7. **AQI Card:** Same display as dashboard

---

## 12. Profile Screen

**Endpoint:** `GET /profile/me` (JWT protected)

### 12.1 Response Shape

```json
{
  "user": { "name", "email", "city", "role", "profile_picture_url" },
  "summary": { "streak_days", "total_days_logged", "badges_unlocked", "avg_emission", "reduction_percent" },
  "badges": [{ "badge_id", "name", "description", "icon_url", "tier", "achieved": true/false, "awarded_at" }],
  "leaderboard": { "avg_emission", "total_days_logged", "total_emission", "updated_at" } | null,
  "performance_metrics": { ... },
  "task_stats": { "eco_action": 4, "emission_reduction": 2, "awareness": 1 },
  "engagement_metrics": { "task_completion_rate", "total_days_logged", "app_open_count" }
}
```

### 12.2 Layout

1. **Header:** Avatar (large, cached), name, city, role
2. **Stats Row:** Streak, days logged, badges unlocked
3. **Performance Card:** Baseline vs current, reduction %
4. **Badge Gallery:** Grid of badges with locked/unlocked state, tier indicators
5. **Leaderboard Snapshot:** User's position and avg emission

### 12.3 Profile Image Caching

- Cache profile image URL + decoded image in local storage (SharedPreferences / Hive)
- Used in: profile header, authenticated shell avatar, leaderboard self-row
- On `GET /auth/me`, refresh cached URL if it differs
- For other users: use `CachedNetworkImage` or equivalent
- Fallback: initials avatar for broken/slow URLs

---

## 13. Leaderboard

**Endpoint:** `GET /leaderboard?scope=global` or `?scope=city` (JWT protected)

### 13.1 Response Shape

Array of ranked entries with `user_id`, `name`, `city`, `profile_picture_url`, `avg_emission`, `total_emission`, `total_days_logged`.

### 13.2 Refresh

**Endpoint:** `POST /leaderboard/refresh` — triggers a recomputation (rate-limited).

Leaderboard is also refreshed by a background job every midnight.

---

## 14. AQI Data

### 14.1 Architecture

- **Source:** AQICN API (api.waqi.info)
- **Env var:** `AQICN_API_TOKEN` (use `demo` for development)
- **City matching:** User's city → `trim().toLowerCase()` → used as AQICN slug
- **Caching:** AQI data is stored in `aqi_data` collection, upserted per city
- **Stale threshold:** 2 hours — if cached data is older, a live fetch is triggered
- **Fallback:** Dashboard and Insights services call `AqiFetcherService.getAqiForCity()` which checks cache first, then fetches live if stale/missing

### 14.2 Response Fields

| Field | Source |
|-------|--------|
| `aqi` | `data.aqi` (overall AQI index) |
| `pm25` | `data.iaqi.pm25.v` |
| `pm10` | `data.iaqi.pm10.v` |
| `no2` | `data.iaqi.no2.v` |
| `so2` | `data.iaqi.so2.v` |
| `co` | `data.iaqi.co.v` |
| `city` | City slug used for the request |
| `fetched_at` | Timestamp of last fetch |

### 14.3 AQI Display Guide

| AQI Range | Level | Color |
|-----------|-------|-------|
| 0–50 | Good | Green (#00e400) |
| 51–100 | Moderate | Yellow (#ffff00) |
| 101–150 | Unhealthy for Sensitive Groups | Orange (#ff7e00) |
| 151–200 | Unhealthy | Red (#ff0000) |
| 201–300 | Very Unhealthy | Purple (#8f3f97) |
| 301–500 | Hazardous | Maroon (#7e0023) |

---

## 15. Emission Factors

Seeded via `npm run seed`. Values:

| Type | Value | Unit |
|------|-------|------|
| `electricity` | 0.716 | kg CO₂/kWh |
| `transport_car` | 0.12 | kg CO₂/km |
| `transport_bike` | 0.05 | kg CO₂/km |
| `transport_bus` | 0.03 | kg CO₂/km |
| `transport_metro` | 0.02 | kg CO₂/km |
| `transport_walk` | 0.0 | kg CO₂/km |

---

## 16. Seed Data

Run `npm run seed` (or `npx ts-node src/scripts/seed-all.ts`) to populate:

| Collection | Count | Script |
|------------|-------|--------|
| `badges` | 23 | seed-badges.ts |
| `task_templates` | 29 | seed-task-templates.ts |
| `emission_factors` | 6 | seed-emission-factors.ts |

All scripts use upsert logic — safe to re-run without creating duplicates.

---

## 17. Environment Variables

| Variable | Default | Notes |
|----------|---------|-------|
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/carbonsense` | MongoDB connection string |
| `REDIS_URL` | `redis://127.0.0.1:6379` | Redis for BullMQ |
| `DISABLE_BULLMQ` | `false` | Set `true` to run without Redis |
| `JWT_SECRET` | — | Required |
| `JWT_EXPIRES_IN` | `7d` | Token expiry |
| `AQICN_API_TOKEN` | `demo` | AQICN API token |

---

## 18. Capability Matrix

| Feature | Backend | UI |
|---------|---------|------|
| Register | ✅ | Build |
| Login | ✅ | Build |
| Onboarding | ✅ | Build |
| Daily Submission | ✅ | Build |
| Weekly Submission | ✅ | Build |
| Tasks (view, complete, evaluate) | ✅ | Build |
| Dashboard Home | ✅ | Build |
| Insights Summary | ✅ | Build |
| Profile Overview | ✅ | Build |
| Badge Gallery | ✅ | Build |
| Leaderboard | ✅ | Build |
| AQI Display | ✅ | Build |
| Profile Edit | ❌ Deferred | — |
| Profile Image Upload | Client-side Cloudinary | Build |
| Push Notifications | ❌ Not planned v1 | — |
