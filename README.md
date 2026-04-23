# Carbon-Sense

> **A gamified carbon footprint tracking platform** that empowers users to monitor, reduce, and compete on their environmental impact through intelligent task personalization, real-time feedback, and community engagement.

## 🌱 Project Overview

Carbon-Sense is a comprehensive environmental impact tracking system that combines **gamification**, **machine learning**, and **community dynamics** to help users understand and reduce their carbon footprint. The platform provides personalized daily tasks, badges for achievements, streaks for consistency, and leaderboards for social engagement.

### Core Features
- 📊 **Daily Carbon Tracking** - Real-time emission monitoring across transport, food, electricity, and eco-actions
- 🎯 **Personalized Tasks** - ML-driven daily tasks adapted to user behavior and emission patterns
- 🏆 **Badge System** - Unlock achievements across multiple categories (eco-action, emissions reduction, awareness, performance, streaks)
- 🔥 **Streak System** - Maintain consecutive app open streaks with milestone rewards
- 🥇 **Leaderboard** - Compete globally and locally on emissions reduction percentage
- 📈 **Performance Analytics** - Baseline tracking, emission trends, and reduction metrics

---

## 🏗️ System Architecture

### High-Level Flow Diagram

```mermaid
graph TD
    User["👤 User App"]
    API["🌐 Backend API<br/>NestJS + Express"]
    MongoDB["🗄️ MongoDB<br/>User Profiles, Tasks, Badges"]
    Redis["⚡ Redis<br/>Job Queue Broker"]
    BullMQ["📦 BullMQ<br/>Job Queue Manager"]
    CronJobs["⏰ Cron Jobs<br/>Scheduled Tasks"]
    MLEngine["🤖 ML Engine<br/>Task Generation"]
    EventBus["📢 Event Bus<br/>In-Memory Events"]
    
    User -->|API Calls| API
    API -->|Read/Write| MongoDB
    API -->|Enqueue| Redis
    Redis -->|Process| BullMQ
    BullMQ -->|Execute| CronJobs
    CronJobs -->|Generate Tasks| MLEngine
    MLEngine -->|Query Data| MongoDB
    API -->|Emit| EventBus
    EventBus -->|Trigger| BullMQ
    
    style User fill:#e1f5ff
    style API fill:#fff3e0
    style MongoDB fill:#f3e5f5
    style Redis fill:#e8f5e9
    style BullMQ fill:#e8f5e9
    style MLEngine fill:#fce4ec
    style EventBus fill:#f1f8e9
```

---

## 🎯 Module Architecture

```mermaid
graph LR
    Auth["🔐 Auth Module"]
    Activity["📝 Activity Module"]
    Tasks["🎯 Tasks Module"]
    Badge["🏆 Badge Engine"]
    Experience["⭐ Experience Module"]
    Leaderboard["🥇 Leaderboard Module"]
    AQI["💨 AQI Module"]
    Jobs["📦 Jobs Module"]
    
    Activity -->|Events| Badge
    Activity -->|Events| Leaderboard
    Tasks -->|Emit| Activity
    Badge -->|Enqueue Retry| Jobs
    Leaderboard -->|Compute Rankings| Jobs
    Experience -->|Update Metrics| Activity
    
    Auth -.->|User Context| Activity
    Auth -.->|User Context| Tasks
    
    style Auth fill:#e3f2fd
    style Activity fill:#fff9c4
    style Tasks fill:#c8e6c9
    style Badge fill:#ffccbc
    style Experience fill:#d1c4e9
    style Leaderboard fill:#f8bbd0
    style AQI fill:#b3e5fc
    style Jobs fill:#ffe0b2
```

--- 

## 🎯 Task System

### Task Generation Flow

```mermaid
graph TD
    GetTasks["User Requests Tasks"]
    CheckCache["Check if tasks<br/>exist for today"]
    CacheHit["Return Cached Tasks"]
    CacheMiss["Cache Miss"]
    Enqueue["Enqueue Task<br/>Generation Job"]
    Generate["Task Generation Engine"]
    
    GetTasks --> CheckCache
    CheckCache -->|Hit| CacheHit
    CheckCache -->|Miss| CacheMiss
    CacheMiss --> Enqueue
    Enqueue --> Generate
    
    Generate -->|Fetch Signals| Signals["📊 Personalization Signals"]
    Signals -->|User Behavior| Behavior["Behavior Profile<br/>eco_actions, transport, food<br/>electricity patterns"]
    Signals -->|Emission Data| Emissions["Emission Metrics<br/>baseline, trend, 7d avg<br/>reduction %"]
    Signals -->|Task History| History["Task History<br/>last completion dates<br/>completion rate"]
    Signals -->|User Profile| Profile["User Profile<br/>streak days, registration date<br/>task stats"]
    
    Behavior --> Selection["🎲 Generate Daily<br/>Task Selection"]
    Emissions --> Selection
    History --> Selection
    Profile --> Selection
    
    Selection -->|Save| DB["💾 MongoDB:<br/>user_daily_tasks"]
    DB --> Response["Return Tasks"]
    Response --> User["👤 User App"]
    
    style GetTasks fill:#c8e6c9
    style Generate fill:#fce4ec
    style Signals fill:#fff9c4
    style Selection fill:#ffe0b2
    style DB fill:#f3e5f5
    style Response fill:#e0f2f1
```

### Task Categories & Completion Types

```mermaid
graph LR
    TaskCategories["Task Categories"]
    Eco["🌱 Eco-Action<br/>Manual Completion"]
    Reduction["💡 Emission Reduction<br/>Auto-Evaluated"]
    Awareness["📚 Awareness<br/>Hybrid Evaluation"]
    
    Eco -->|User Confirms| Complete["✅ Complete"]
    Reduction -->|System Checks Activity| Auto["🤖 Auto-Evaluate"]
    Awareness -->|Combined Logic| Hybrid["⚙️ Hybrid"]
    
    Auto -->|Validated| Complete
    Hybrid -->|User + System| Complete
    
    style TaskCategories fill:#e1f5ff
    style Eco fill:#c8e6c9
    style Reduction fill:#fff9c4
    style Awareness fill:#ffccbc
    style Complete fill:#e0f2f1
```

### Personalization Signals Details

```mermaid
graph TD
    PS["Personalization Signals"]
    
    BP["Behavior Profile"]
    BP -->|7-day logs| BP1["Eco-Actions Frequency"]
    BP -->|7-day logs| BP2["Transport Mode Distribution"]
    BP -->|7-day logs| BP3["Food Choices"]
    BP -->|7-day logs| BP4["Electricity Usage"]
    
    EM["Emission Metrics"]
    EM -->|Historical data| EM1["Baseline Emission"]
    EM -->|90-day records| EM2["Emission Trend"]
    EM -->|7-day average| EM3["Current Avg Emission"]
    EM -->|Performance calc| EM4["Reduction Percentage"]
    
    TH["Task History"]
    TH -->|120-day history| TH1["Last Completion Date"]
    TH -->|All tasks| TH2["Completion Rate"]
    TH -->|Yesterday tasks| TH3["Task Diversity"]
    
    UP["User Profile"]
    UP -->|Engagement| UP1["Streak Days"]
    UP -->|Registration| UP2["User Age"]
    UP -->|Stats| UP3["Category Counts"]
    
    style PS fill:#e8eaf6
    style BP fill:#c5e1a5
    style EM fill:#ffe0b2
    style TH fill:#ffccbc
    style UP fill:#d1c4e9
```

---  

## 🏆 Badge System

### Badge Evaluation Flow

```mermaid
graph TD
    Event["🎬 Activity Event"]
    
    TaskEval["TASK_EVALUATED<br/>Event"]
    StreakEval["STREAK_UPDATED<br/>Event"]
    PerfEval["EMISSION_UPDATED<br/>Event"]
    
    Event --> TaskEval
    Event --> StreakEval
    Event --> PerfEval
    
    TaskEval -->|Trigger| BadgeEngine["🏆 Badge Engine"]
    StreakEval -->|Trigger| BadgeEngine
    PerfEval -->|Trigger| BadgeEngine
    
    BadgeEngine -->|Evaluate| CatBadges["Category Badges<br/>eco_action, emission_reduction<br/>awareness, performance, streak"]
    BadgeEngine -->|Evaluate| SpecBadges["Special Badges<br/>first_task, perfect_week"]
    
    CatBadges -->|Check Threshold| Eligible["✅ Eligible?"]
    SpecBadges -->|Check Threshold| Eligible
    
    Eligible -->|Yes| CheckExists["Already<br/>Awarded?"]
    Eligible -->|No| Reject["❌ Reject"]
    
    CheckExists -->|No| Award["🎉 Award Badge"]
    CheckExists -->|Yes| Ignore["⏭️ Skip"]
    
    Award -->|Save| UserBadge["💾 user_badges<br/>Collection"]
    
    Award -->|On Error| Retry["🔄 Enqueue<br/>Badge Retry Job"]
    Reject -->|Discard| End["⏹️ End"]
    
    style Event fill:#c8e6c9
    style BadgeEngine fill:#ffccbc
    style CatBadges fill:#ffe0b2
    style SpecBadges fill:#ffe0b2
    style Award fill:#f8bbd0
    style Retry fill:#ffb74d
```

### Badge Categories & Thresholds

```mermaid
graph LR
    Badges["🏆 Badge Categories"]
    
    EcoAction["Eco-Action<br/>🌱 Green Guardian<br/>🌟 Eco Hero<br/>💚 Nature Ally"]
    EmissionRed["Emission Reduction<br/>💡 Carbon Cutter<br/>⚡ Emission Master<br/>🎯 Green Achiever"]
    Awareness["Awareness<br/>📚 Knowledge Keeper<br/>🧠 Eco Scholar<br/>💭 Green Thinker"]
    Performance["Performance<br/>📈 Rising Star<br/>🚀 Green Leader<br/>👑 Emission Champion"]
    Streak["Streak<br/>🔥 7-Day Streak<br/>🌊 30-Day Wave<br/>⚡ 100-Day Spark"]
    Special["Special<br/>🎯 First Task<br/>🎊 Perfect Week"]
    
    style Badges fill:#e1f5ff
    style EcoAction fill:#c8e6c9
    style EmissionRed fill:#fff9c4
    style Awareness fill:#ffccbc
    style Performance fill:#d1c4e9
    style Streak fill:#f8bbd0
    style Special fill:#ffb3ba
```

---  

## 🔥 Streak System

### Streak Tracking Flow

```mermaid
graph TD
    AppOpen["📱 App Opened"]
    
    CheckProfile["Fetch User Profile"]
    GetToday["Get Today's Date<br/>YYYY-MM-DD (IST)"]
    
    AppOpen --> CheckProfile
    CheckProfile --> GetToday
    
    GetToday -->|First time today| CheckLast["Check last_streak_update"]
    CheckLast -->|Today| AlreadyUpdated["✅ Streak Already<br/>Updated Today"]
    CheckLast -->|Not Today| ContinueCheck["Continue Processing"]
    
    ContinueUpdated -->|Increment App Opens| IncAppOpen["engagement_metrics<br/>app_open_count++"]
    
    ContinueCheck -->|Calculate Yesterday| YesterdayCalc["Yesterday = Now - 24h"]
    YesterdayCalc -->|Check Consistency| LastUpdate["Was last_streak_update<br/>yesterday?"]
    
    LastUpdate -->|Yes| Increment["streak_days++"]
    LastUpdate -->|No| Reset["streak_days = 1"]
    
    Increment -->|Update DB| SaveDB["💾 Update:<br/>streak_days<br/>last_streak_update<br/>app_open_count"]
    Reset -->|Update DB| SaveDB
    
    SaveDB -->|Fire Event| EmitEvent["🎬 Emit<br/>STREAK_UPDATED<br/>Event"]
    
    EmitEvent -->|Trigger| BadgeEngine["🏆 Badge Engine<br/>Evaluate Streak Badges"]
    BadgeEngine -->|Check Thresholds| Thresholds["7-day, 30-day<br/>100-day, etc."]
    
    Thresholds -->|Award| StreakyBadges["🎉 Streak Badges"]
    
    style AppOpen fill:#c8e6c9
    style GetToday fill:#fff9c4
    style LastUpdate fill:#ffe0b2
    style SaveDB fill:#f3e5f5
    style EmitEvent fill:#b3e5fc
    style BadgeEngine fill:#ffccbc
```

### Streak State Machine

```mermaid
stateDiagram-v2
    [*] --> NoStreak: First Open
    
    NoStreak --> Active: Open App Tomorrow
    NoStreak --> NoStreak: Open App Same Day
    
    Active --> Active: Open App Next Day<br/>streak_days++
    Active --> Broken: Skip a Day<br/>streak_days = 1
    Active --> Active: Open App Same Day
    
    Broken --> Active: Open App Next Day<br/>streak_days++
    Broken --> Broken: Open App Same Day
    
    note right of Active
        last_streak_update = yesterday
        streak_days >= 1
    end note
    
    note right of NoStreak
        streak_days = 0
        last_streak_update = unset
    end note
    
    note right of Broken
        Streak Lost Event
        (Optional Badge Penalty)
    end note
```

---  

## 🥇 Leaderboard System

### Leaderboard Computation Flow

```mermaid
graph TD
    CronJob["⏰ Cron Job<br/>Triggers Daily"]
    
    CronJob -->|Enqueue| Queue["📦 Leaderboard Job<br/>BullMQ Queue"]
    Queue -->|Process| Processor["🔄 Leaderboard Processor"]
    
    Processor -->|Fetch All Users| FetchUsers["SELECT * FROM user_profiles"]
    FetchUsers -->|Calculate Score| CalcScore["Compute Metrics:<br/>reduction_percent<br/>total_tasks_completed<br/>streak_days<br/>avg_daily_emission"]
    
    CalcScore -->|Sort by Primary| SortGlobal["Global Rank<br/>ORDER BY<br/>reduction_percent DESC"]
    
    SortGlobal -->|Compute Local| LocalRank["Local Rank<br/>By Region/Country"]
    
    SortGlobal -->|Tier Assignment| Tier["Tier Classification:<br/>Gold, Silver, Bronze,<br/>Standard"]
    
    LocalRank -->|Save Rankings| SaveRank["💾 Save Leaderboard<br/>Position & Tier"]
    Tier -->|Save Rankings| SaveRank
    
    SaveRank -->|API Query| APIQuery["User Queries<br/>GET /leaderboard"]
    APIQuery -->|Return Ranked Data| Response["📊 Ranked Users<br/>with Positions"]
    
    style CronJob fill:#fff9c4
    style Queue fill:#ffe0b2
    style Processor fill:#ffccbc
    style CalcScore fill:#d1c4e9
    style SortGlobal fill:#f8bbd0
    style LocalRank fill:#c8e6c9
    style SaveRank fill:#f3e5f5
    style Response fill:#e0f2f1
```

### Leaderboard Ranking Criteria

```mermaid
graph LR
    Criteria["🥇 Ranking Criteria"]
    
    Primary["Primary Score<br/>💡 Reduction %<br/>baseline vs current"]
    Secondary["Secondary Metrics<br/>✅ Tasks Completed<br/>🔥 Streak Days<br/>📈 Avg Daily Emission"]
    Tiers["Tier Classification<br/>🥇 Gold: >40%<br/>🥈 Silver: >20%<br/>🥉 Bronze: >5%<br/>⚪ Standard: ≤5%"]
    
    Criteria --> Primary
    Primary --> Secondary
    Secondary --> Tiers
    
    Tiers --> Global["Global Leaderboard<br/>All Users"]
    Tiers --> Regional["Regional Leaderboard<br/>By Country/City"]
    
    style Criteria fill:#e1f5ff
    style Primary fill:#ffccbc
    style Secondary fill:#fff9c4
    style Tiers fill:#c8e6c9
    style Global fill:#f8bbd0
    style Regional fill:#d1c4e9
```

---  

## 📥 Input & Activity Tracking

### User Activity Submission Flow

```mermaid
graph TD
    User["👤 User App"]
    Endpoint["📝 POST /activity/submit"]
    Validate["✅ Validate Input"]
    
    User -->|Submit Daily Activity| Endpoint
    Endpoint -->|Parse Payload| Validate
    
    Validate -->|Check Schema| Schema["Transport:<br/>mode, distance<br/>Food: items<br/>quantities<br/>Electricity: kWh<br/>Eco-Actions: types<br/>Waste: items"]
    
    Schema -->|Valid| Process["🔄 Process Activity"]
    Schema -->|Invalid| Error["❌ Return Error"]
    
    Process -->|Calculate Emission| CalcEmit["Compute CO2<br/>Transport: mode × distance<br/>Food: item × multiplier<br/>Electricity: kWh × factor<br/>Eco-Actions: -offset<br/>Waste: item × factor"]
    
    CalcEmit -->|Save Record| SaveCarbon["💾 Save:<br/>carbon_records"]
    SaveCarbon -->|Log Activity| SaveDaily["💾 Save:<br/>daily_activity_log"]
    
    SaveDaily -->|Emit Event| EmitEmiss["🎬 Emit<br/>EMISSION_UPDATED<br/>Event"]
    
    EmitEmiss -->|Update Metrics| UpdateProfile["🔄 Update user_profile:<br/>performance_metrics<br/>behavior_profile"]
    
    UpdateProfile -->|Trigger Badges| TriggerBadges["🏆 Badge Evaluation<br/>Performance Category"]
    
    style User fill:#c8e6c9
    style Endpoint fill:#fff9c4
    style Validate fill:#ffe0b2
    style CalcEmit fill:#ffccbc
    style SaveCarbon fill:#f3e5f5
    style SaveDaily fill:#f3e5f5
    style EmitEmiss fill:#b3e5fc
    style UpdateProfile fill:#d1c4e9
    style TriggerBadges fill:#f8bbd0
```

### Activity Data Schema

```mermaid
graph LR
    Activity["Daily Activity"]
    
    Transport["🚗 Transport<br/>mode: car/bike/bus/metro<br/>distance: km<br/>emission_factor"]
    Food["🍽️ Food<br/>items: [item_id]<br/>quantities<br/>emission_per_item"]
    Electricity["⚡ Electricity<br/>kWh_consumed<br/>ac_hours<br/>heater_hours"]
    EcoActions["🌱 Eco-Actions<br/>type: recycle/plant/cleanup<br/>quantity<br/>emission_offset"]
    Waste["♻️ Waste<br/>items: [type]<br/>quantities"]
    
    Activity --> Transport
    Activity --> Food
    Activity --> Electricity
    Activity --> EcoActions
    Activity --> Waste
    
    style Activity fill:#e1f5ff
    style Transport fill:#fff9c4
    style Food fill:#c8e6c9
    style Electricity fill:#ffccbc
    style EcoActions fill:#d1c4e9
    style Waste fill:#f8bbd0
```

---  

## ⏰ Cron Jobs & Background Processing

### Cron Job Architecture

```mermaid
graph TD
    Scheduler["⏰ NestJS Schedule<br/>@nestjs/schedule"]
    
    Midnight["🌙 Midnight IST<br/>00:00:00 +05:30"]
    Daily["📅 Daily<br/>08:00:00 +05:30"]
    Hourly["⏱️ Hourly<br/>Every Hour"]
    
    Scheduler --> Midnight
    Scheduler --> Daily
    Scheduler --> Hourly
    
    Midnight -->|Trigger| DailyReset["Daily Task Reset<br/>for ALL users"]
    Daily -->|Trigger| Leaderboard["Leaderboard Computation"]
    Hourly -->|Trigger| JobAudit["Job Audit & Cleanup"]
    
    DailyReset -->|Delete Yesterday| DelTask["Delete user_daily_tasks<br/>from yesterday"]
    DelTask -->|Enqueue Generation| EnqueueGen["TASK_GENERATE_SINGLE<br/>Job per User"]
    EnqueueGen -->|Queue| TaskQueue["BullMQ Task Queue"]
    
    Leaderboard -->|Enqueue| LeadQ["LEADERBOARD_COMPUTE<br/>Job"]
    LeadQ -->|Queue| BadgeQueue["BullMQ Badge Queue"]
    
    JobAudit -->|Clean Old Jobs| CleanJobs["Remove completed jobs<br/>older than 7 days"]
    
    style Scheduler fill:#fff9c4
    style Midnight fill:#ffccbc
    style Daily fill:#ffe0b2
    style Hourly fill:#b3e5fc
    style DailyReset fill:#c8e6c9
    style Leaderboard fill:#f8bbd0
    style JobAudit fill:#d1c4e9
```

### Daily Task Reset Cron Job

```mermaid
graph TD
    CronTrigger["⏰ Triggered at 00:00 IST"]
    
    CronTrigger -->|Fetch All User IDs| FetchUsers["SELECT DISTINCT user_id<br/>FROM user_profiles"]
    
    FetchUsers -->|For Each User| Loop["🔄 Loop Through Users"]
    
    Loop -->|Get Yesterday Date| GetYesterday["Yesterday = Now - 24h"]
    GetYesterday -->|Delete Old Tasks| DeleteYest["DELETE user_daily_tasks<br/>WHERE date = yesterday"]
    
    DeleteYest -->|Enqueue Job| EnqueueJob["TASK_GENERATE_SINGLE<br/>jobId: task-gen-{userId}-{todayYmd}<br/>priority: MEDIUM"]
    
    EnqueueJob -->|To Queue| Queue["📦 Task Queue<br/>Redis via BullMQ"]
    
    Queue -->|Process Async| Processor["🔄 Task Queue Processor"]
    
    Processor -->|Call Service| Service["TasksService<br/>runTaskGenerateSingleJob"]
    
    Service -->|Generate Tasks| Gen["Task Generation Engine<br/>Personalization Signals"]
    
    Gen -->|Save| SaveDB["💾 user_daily_tasks<br/>for today"]
    
    style CronTrigger fill:#fff9c4
    style Loop fill:#ffe0b2
    style GetYesterday fill:#ffccbc
    style EnqueueJob fill:#c8e6c9
    style Queue fill:#ffe0b2
    style Processor fill:#b3e5fc
    style Gen fill:#fce4ec
```

### Leaderboard Cron Job

```mermaid
graph TD
    CronTrigger["⏰ Triggered at 08:00 IST<br/>Daily"]
    
    CronTrigger -->|Enqueue| EnqueueJob["LEADERBOARD_COMPUTE<br/>Job"]
    
    EnqueueJob -->|To Queue| Queue["📦 Badge/Leaderboard Queue<br/>BullMQ"]
    
    Queue -->|Process| Processor["🔄 Leaderboard Processor"]
    
    Processor -->|Fetch All Users| FetchUsers["SELECT * FROM user_profiles<br/>with performance_metrics"]
    
    FetchUsers -->|For Each User| CalcMetrics["Calculate:<br/>reduction_percent<br/>total_tasks_completed<br/>streak_days<br/>avg_daily_emission<br/>badges_count"]
    
    CalcMetrics -->|Sort Globally| GlobalRank["RANK() OVER<br/>ORDER BY reduction_percent DESC"]
    
    GlobalRank -->|Sort by Region| RegionalRank["RANK() OVER PARTITION BY<br/>region"]
    
    RegionalRank -->|Assign Tier| AssignTier["IF reduction_percent >= 40<br/>THEN tier = Gold<br/>ELSE IF reduction_percent >= 20<br/>THEN tier = Silver<br/>... etc"]
    
    AssignTier -->|Bulk Update| BulkUpdate["💾 BULK UPDATE leaderboard<br/>SET rank, regional_rank,<br/>tier, last_computed"]
    
    BulkUpdate -->|Complete| Done["✅ Leaderboard Updated<br/>Ready for API Queries"]
    
    style CronTrigger fill:#fff9c4
    style EnqueueJob fill:#ffe0b2
    style Queue fill:#ffccbc
    style Processor fill:#c8e6c9
    style CalcMetrics fill:#d1c4e9
    style GlobalRank fill:#f8bbd0
    style RegionalRank fill:#b3e5fc
    style AssignTier fill:#ffb3ba
    style BulkUpdate fill:#f3e5f5
    style Done fill:#c8e6c9
```

---  

## 🤖 ML Service & Task Generation Engine

### ML-Driven Task Personalization

```mermaid
graph TD
    TaskReq["👤 User Requests Tasks"]
    GetSignals["🎬 Gather Personalization Signals"]
    
    GetSignals -->|Fetch 7-day logs| Behavior["📊 Behavior Profile<br/>eco_actions_freq<br/>transport_modes<br/>food_patterns<br/>electricity_usage<br/>waste_patterns"]
    
    GetSignals -->|Fetch 90-day records| Emissions["💨 Emission Data<br/>baseline_emission<br/>current_avg_emission<br/>emission_trend<br/>reduction_percent"]
    
    GetSignals -->|Query 120 days| History["📈 Task History<br/>last_completion_date<br/>completion_rate<br/>task_diversity"]
    
    GetSignals -->|Current state| Profile["👤 User Profile<br/>streak_days<br/>user_age<br/>task_stats<br/>engagement_metrics"]
    
    Behavior -->|Input| MLEngine["🤖 ML Task Generation<br/>Engine"]
    Emissions -->|Input| MLEngine
    History -->|Input| MLEngine
    Profile -->|Input| MLEngine
    
    MLEngine -->|Apply Rules| Rules["📋 Generation Rules:<br/>1. Avoid yesterday tasks<br/>2. Cooldown enforcement<br/>3. Difficulty scaling<br/>4. Category balancing"]
    
    Rules -->|Filter Templates| Filter["🔍 Template Filtering:<br/>User behavior match<br/>Emission reduction target<br/>Task difficulty level"]
    
    Filter -->|Weighted Selection| Weighted["⚖️ Weighted Random:<br/>High effort → emission tasks<br/>High engagement → variety<br/>Low engagement → easy wins"]
    
    Weighted -->|Generate| Selection["🎯 Daily Task Selection<br/>3-5 personalized tasks"]
    
    Selection -->|Save| SaveDB["💾 user_daily_tasks"]
    
    SaveDB -->|Return| Response["📱 User App<br/>Today's Tasks"]
    
    style TaskReq fill:#c8e6c9
    style GetSignals fill:#fff9c4
    style Behavior fill:#ffccbc
    style Emissions fill:#ffe0b2
    style History fill:#d1c4e9
    style Profile fill:#f8bbd0
    style MLEngine fill:#fce4ec
    style Rules fill:#ffb3ba
    style Filter fill:#b3e5fc
    style Weighted fill:#a5d6a7
    style Selection fill:#81c784
```

### Task Generation Logic: Personalization Signals

```mermaid
graph LR
    Signals["Personalization Signals"]
    
    SP1["⏰ User Engagement<br/>task_completion_rate<br/>streak_days<br/>app_open_count"]
    
    SP2["🌍 Behavior Patterns<br/>eco_actions_frequency<br/>transport_preference<br/>food_patterns<br/>avg_ac_hours<br/>avg_distance"]
    
    SP3["📊 Emission Trends<br/>baseline_emission<br/>current_avg_emission<br/>avg_7d_emission<br/>emission_trend<br/>reduction_percent"]
    
    SP4["⚙️ Task Constraints<br/>yesterday_tasks<br/>last_completion_dates<br/>cooldown_periods<br/>user_age_in_days"]
    
    Signals --> SP1
    Signals --> SP2
    Signals --> SP3
    Signals --> SP4
    
    SP1 --> Engine["🤖 Engine"]
    SP2 --> Engine
    SP3 --> Engine
    SP4 --> Engine
    
    style Signals fill:#e1f5ff
    style SP1 fill:#fff9c4
    style SP2 fill:#c8e6c9
    style SP3 fill:#ffe0b2
    style SP4 fill:#ffccbc
    style Engine fill:#fce4ec
```

### Task Complexity & Difficulty Scaling

```mermaid
graph TD
    UserProfile["👤 User Profile"]
    
    UserProfile -->|Analyze| CompletionRate["Task Completion Rate"]
    CompletionRate -->|>80%| Difficult["🔴 Difficult<br/>Challenging tasks<br/>High emission impact"]
    CompletionRate -->|50-80%| Medium["🟡 Medium<br/>Balanced tasks<br/>Good progress"]
    CompletionRate -->|<50%| Easy["🟢 Easy<br/>Achievable tasks<br/>Build momentum"]
    
    Difficult -->|Select Tasks| TaskPool1["Emission Reduction<br/>Behavior Change<br/>Technical Tasks"]
    Medium -->|Select Tasks| TaskPool2["Eco-Actions<br/>Awareness<br/>Mixed Category"]
    Easy -->|Select Tasks| TaskPool3["Quick Wins<br/>Eco-Actions<br/>Awareness"]
    
    TaskPool1 -->|Generate| Result["✅ Personalized<br/>Daily Tasks"]
    TaskPool2 -->|Generate| Result
    TaskPool3 -->|Generate| Result
    
    style UserProfile fill:#e1f5ff
    style Difficult fill:#ffccbc
    style Medium fill:#fff9c4
    style Easy fill:#c8e6c9
    style Result fill:#f8bbd0
```

---  

## 💾 Data Models

### User Profile Schema Highlights

```
UserProfile {
  _id: ObjectId
  user_id: ObjectId → User
  
  streak_days: Number (default: 0)
  last_streak_update: String (YYYY-MM-DD)
  
  task_stats: {
    eco_action: Number
    emission_reduction: Number
    awareness: Number
  }
  
  engagement_metrics: {
    app_open_count: Number
    total_tasks_completed: Number
    task_completion_rate: Number (0-1)
  }
  
  performance_metrics: {
    baseline_emission: Number
    current_avg_emission: Number
    reduction_percent: Number (0-100)
  }
  
  behavior_profile: {
    avg_ac_hours: Number
    avg_distance: Number
    eco_actions_frequency: Number
    transport_modes: Map
    food_preferences: Map
  }
  
  weekly_insights: {
    primary_transport: String
    primary_food_category: String
    high_emission_period: String
  }
  
  created_at: Date
  updated_at: Date
}
```

### Event-Driven Architecture

```mermaid
graph LR
    Events["🎬 Event Types"]
    
    E1["TASK_EVALUATED<br/>Triggered on task<br/>completion<br/>payload: userId, taskIds,<br/>date"]
    E2["STREAK_UPDATED<br/>Triggered on app open<br/>streak changes<br/>payload: userId, streakDays,<br/>date"]
    E3["EMISSION_UPDATED<br/>Triggered on activity<br/>submission<br/>payload: userId,<br/>emission values"]
    
    Events --> E1
    Events --> E2
    Events --> E3
    
    E1 -->|Listener| Badge1["🏆 Badge Engine:<br/>evaluateTaskBadges"]
    E2 -->|Listener| Badge2["🏆 Badge Engine:<br/>evaluateStreakBadges"]
    E3 -->|Listener| Badge3["🏆 Badge Engine:<br/>evaluatePerformanceBadges"]
    
    Badge1 --> Enqueue["📦 Enqueue<br/>on Error"]
    Badge2 --> Enqueue
    Badge3 --> Enqueue
    
    Enqueue -->|Job Type| Retry["BADGE_RETRY<br/>in badge_queue"]
    
    style Events fill:#e1f5ff
    style E1 fill:#fff9c4
    style E2 fill:#c8e6c9
    style E3 fill:#ffe0b2
    style Badge1 fill:#ffccbc
    style Badge2 fill:#ffccbc
    style Badge3 fill:#ffccbc
    style Retry fill:#f8bbd0
```

---  

## 📦 Job Queue Architecture

### BullMQ Queue Overview

```mermaid
graph TD
    Redis["⚡ Redis<br/>Message Broker"]
    
    TaskQueue["📋 Task Queue<br/>task_queue"]
    BadgeQueue["🏆 Badge Queue<br/>badge_queue"]
    LeaderQueue["🥇 Leaderboard Queue<br/>leaderboard_queue"]
    
    Redis --> TaskQueue
    Redis --> BadgeQueue
    Redis --> LeaderQueue
    
    TaskQueue -->|Jobs| TJ1["TASK_GENERATE_SINGLE<br/>Generate daily tasks<br/>Priority: MEDIUM"]
    
    BadgeQueue -->|Jobs| BJ1["BADGE_RETRY<br/>Retry failed badge evaluation<br/>Priority: LOW"]
    
    LeaderQueue -->|Jobs| LJ1["LEADERBOARD_COMPUTE<br/>Compute rankings<br/>Priority: MEDIUM"]
    
    TJ1 -->|Processor| TP["task-queue.processor"]
    BJ1 -->|Processor| BP["badge-retry.processor"]
    LJ1 -->|Processor| LP["leaderboard.processor"]
    
    TP -->|Calls| TS["TasksService"]
    BP -->|Calls| BE["BadgeEngineService"]
    LP -->|Calls| LC["LeaderboardComputationService"]
    
    TS -->|Update| DB[(MongoDB)]
    BE -->|Update| DB
    LC -->|Update| DB
    
    style Redis fill:#e8f5e9
    style TaskQueue fill:#fff9c4
    style BadgeQueue fill:#ffccbc
    style LeaderQueue fill:#ffe0b2
    style TJ1 fill:#c8e6c9
    style BJ1 fill:#f8bbd0
    style LJ1 fill:#d1c4e9
    style TP fill:#b3e5fc
    style BP fill:#ffb3ba
    style LP fill:#a5d6a7
    style DB fill:#f3e5f5
```

---  

## 🔄 Error Handling & Resilience

### Resilience Strategy

```mermaid
graph TD
    Error["❌ Error Occurs"]
    
    ErrorType{{"Error Type?"}}
    
    Error --> ErrorType
    
    ErrorType -->|CRITICAL| CritLog["🔴 Critical Log"]
    CritLog -->|Log to DB| ErrDB["error_logs<br/>Collection"]
    ErrDB -->|Alert| Admin["📧 Admin Alert"]
    
    ErrorType -->|NON_CRITICAL| NonCritLog["🟡 Non-Critical Log"]
    NonCritLog -->|Log to DB| ErrDB2["error_logs<br/>Collection"]
    ErrDB2 -->|Retry Queue?| RetryDecision{{"Has Retry Logic?"}}
    
    RetryDecision -->|Yes| Enqueue["📦 Enqueue<br/>Retry Job"]
    RetryDecision -->|No| Silent["Silent Fail<br/>w/ Logging"]
    
    Enqueue -->|Configure| RetryPolicy["Retry Policy:<br/>exponential backoff<br/>max 3 retries<br/>1min, 5min, 15min"]
    
    RetryPolicy -->|Retry| Attempt["🔄 Attempt Again"]
    Attempt -->|Success| Resolved["✅ Resolved"]
    Attempt -->|Fail Max| FinalFail["❌ Final Failure<br/>Log & Alert"]
    
    style Error fill:#ffcccc
    style ErrorType fill:#ffb3ba
    style CritLog fill:#ef5350
    style NonCritLog fill:#ffa726
    style Enqueue fill:#29b6f6
    style Attempt fill:#66bb6a
    style Resolved fill:#ab47bc
    style FinalFail fill:#d32f2f
```

---  

## 📊 API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/tasks/today` | GET | Get today's personalized tasks |
| `/tasks/complete` | POST | Mark task as completed |
| `/tasks/evaluate` | POST | Evaluate awareness tasks |
| `/activity/submit` | POST | Submit daily activity |
| `/badges` | GET | Get user's badges |
| `/leaderboard` | GET | Get global/regional leaderboard |
| `/profile` | GET | Get user profile & metrics |
| `/streak` | GET | Get streak information |

---  

## 🛠️ Technology Stack

### Backend
- **Framework**: NestJS (TypeScript)
- **Database**: MongoDB with Mongoose ODM
- **Job Queue**: BullMQ (with Redis backend)
- **Scheduling**: @nestjs/schedule (cron)
- **Authentication**: JWT with Passport
- **Validation**: class-validator, class-transformer
- **File Upload**: Cloudinary
- **Error Tracking**: ErrorLogService

### Deployment Infrastructure
- **Runtime**: Node.js
- **Port**: 3000 (default)
- **Environment Variables**: 
  - `MONGODB_URI`
  - `REDIS_URL`
  - `JWT_SECRET`
  - `CLOUDINARY_*`

---  

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB >= 5.0
- Redis >= 6.0

### Installation

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Seed database (optional)
npm run seed

# Development
npm run start:dev

# Production build
npm run build
npm run start:prod
```

### Environment Setup

Create `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/carbonsense
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
NODE_ENV=development
DISABLE_BULLMQ=false
```

---  

## 📈 Key Metrics & KPIs

- **Task Completion Rate** - % of assigned tasks completed
- **Streak Consistency** - Average user streak days
- **Emission Reduction** - % improvement vs baseline
- **Badge Achievement** - Avg badges per user
- **Daily Active Users** - App open frequency
- **Leaderboard Engagement** - Users viewing rankings

---  

## 🔮 Future Enhancements

- [ ] AI-powered task difficulty auto-adjustment
- [ ] Social features (friend challenges, team competitions)
- [ ] Real-time AQI integration for location-based tasks
- [ ] Mobile push notifications for streaks/badges
- [ ] Carbon credit marketplace
- [ ] Integration with wearables (fitness tracking)
- [ ] ML-based carbon offset recommendations

---  

## 📝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---  

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---  

## 👨‍💻 Author

**Pushkar GB** - [@PushkarGB](https://github.com/PushkarGB)

---  

## 🙏 Acknowledgments

- NestJS community for excellent framework
- BullMQ for robust job queue
- MongoDB for flexible data modeling
- All contributors and testers

---

**Made with 💚 for the planet** 🌍