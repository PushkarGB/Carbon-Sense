import { TaskTemplate } from '../schemas/task-template.schema';

/** Gregorian calendar helpers for canonical YYYY-MM-DD (India business date strings). */
export function addDaysToYmd(ymd: string, deltaDays: number): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const base = new Date(Date.UTC(y, m - 1, d));
  base.setUTCDate(base.getUTCDate() + deltaDays);
  const yy = base.getUTCFullYear();
  const mm = String(base.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(base.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

export function daysBetweenYmd(fromYmd: string, toYmd: string): number {
  const [y1, m1, d1] = fromYmd.split('-').map(Number);
  const [y2, m2, d2] = toYmd.split('-').map(Number);
  const ms = Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1);
  return Math.round(ms / 86_400_000);
}

export type EmissionTrend = 'increasing' | 'stable' | 'decreasing';

export type UserTaskLevel = 'beginner' | 'intermediate' | 'advanced';

export type EngagementBand = 'low' | 'medium' | 'high';

export type EmissionLevelBand = 'low' | 'medium' | 'high';

export type ConsistencyBand = 'low' | 'medium' | 'high';

/**
 * Full user personalization snapshot (Task Personalization Engine v1 §3).
 * Built from signals at generation time.
 */
export interface UserPersonalizationProfile {
  emission_level: EmissionLevelBand;
  engagement_level: EngagementBand;
  consistency_level: ConsistencyBand;
  user_task_level: UserTaskLevel;
  behavior_tags: string[];
  avg_emission_7d: number;
  emission_trend: EmissionTrend;
  task_completion_rate: number;
  streak_days: number;
}

export interface TaskGenerationSignals {
  todayYmd: string;
  userRegisteredYmd: string;
  templates: TaskTemplate[];
  yesterdayTaskIds: Set<string>;
  lastCompletionYmdByTaskId: Map<string, string>;
  behaviorProfile: {
    avg_transport_mode: string;
    avg_distance: number;
    avg_ac_hours: number;
    avg_energy_usage: number;
    /**
     * Maps Personalization Engine doc `eco_task_completion_rate` to a v1 proxy: mean count of
     * `eco_actions` entries per day over the last-7 daily logs (habit frequency, not task DB completion).
     */
    eco_action_score: number;
    /**
     * See `computeDietNonVegDayFraction`. Feeds diet-aware task matching (Daily Task doc §7.2).
     */
    diet_non_veg_day_fraction: number;
  };
  /** Doc §2.1 / §2.2 — rolling 7-day mean of `carbon_records.total_emission` (calendar window when possible). */
  avgEmission7d: number;
  /** Chronological oldest → newest daily totals for percentile-based emission level (doc §3.1). */
  emissionHistoryTotals: number[];
  baselineEmission: number;
  baselineStatus: 'pending' | 'locked';
  currentAvgEmission: number;
  taskCompletionRate: number;
  streakDays: number;
  emissionTrend: EmissionTrend;
  relaxCooldown: boolean;
  /** Fallback only (doc §9): allow yesterday’s task_ids back into the pool. */
  relaxYesterday?: boolean;
  /** Fallback only: ignore template `conditions` gating. */
  relaxConditionGate?: boolean;
}

export interface GeneratedDailyTaskItem {
  task_id: string;
  category: TaskTemplate['category'];
  completion_type: TaskTemplate['completion_type'];
}

/** Per-component scores (doc §5); each dimension is 0–5. */
export interface TaskPersonalizationScoreBreakdown {
  relevance_score: number;
  behavior_impact_score: number;
  engagement_fit_score: number;
  difficulty_score: number;
  total: number;
}

const AC_HIGH_THRESHOLD_HOURS = 4;
const ENERGY_HIGH_THRESHOLD = 10;
const LONG_DISTANCE_KM = 12;
const PRIVATE_TRANSPORT_MODES = new Set(['car', 'bike']);
const PUBLIC_TRANSPORT_MODES = new Set(['bus', 'metro']);

const SAFE_FALLBACK_ECO_IDS = [
  'eco_bag',
  'eco_bottle',
  'eco_waste_segregation',
  'eco_no_litter',
] as const;

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((s, v) => s + v, 0) / values.length;
}

/**
 * Diet signal from last-7 daily logs: fraction in [0,1].
 * Counts `non_veg` as 1, `mixed` as 0.5, `veg` as 0, averaged over logs present.
 * Used for personalization (e.g. meatless / local food tasks), not persisted on user_profiles.
 */
export function computeDietNonVegDayFraction(
  logs: Array<{ food: { diet_type: 'veg' | 'non_veg' | 'mixed' } }>,
): number {
  if (logs.length === 0) {
    return 0;
  }
  let weight = 0;
  for (const log of logs) {
    if (log.food.diet_type === 'non_veg') {
      weight += 1;
    } else if (log.food.diet_type === 'mixed') {
      weight += 0.5;
    }
  }
  return weight / logs.length;
}

function percentileRank(sortedAsc: number[], value: number): number {
  if (sortedAsc.length === 0) {
    return 0.5;
  }
  let below = 0;
  for (const x of sortedAsc) {
    if (x < value) {
      below += 1;
    }
  }
  return below / sortedAsc.length;
}

export function computeEmissionTrendFromTotals(
  recentDailyTotals: number[],
): EmissionTrend {
  if (recentDailyTotals.length < 4) {
    return 'stable';
  }
  const mid = Math.floor(recentDailyTotals.length / 2);
  const first = recentDailyTotals.slice(0, mid);
  const second = recentDailyTotals.slice(mid);
  const a =
    first.reduce((s, v) => s + v, 0) / Math.max(1, first.length);
  const b =
    second.reduce((s, v) => s + v, 0) / Math.max(1, second.length);
  const delta = b - a;
  const epsilon = 0.01;
  if (delta > epsilon) {
    return 'increasing';
  }
  if (delta < -epsilon) {
    return 'decreasing';
  }
  return 'stable';
}

/**
 * Doc §2.2 — average emission over the last 7 calendar days ending `todayYmd`, else mean of up to 7 most recent records.
 */
export function computeAvgEmission7dFromRecords(
  records: Array<{ date: string; total_emission: number }>,
  todayYmd: string,
): number {
  if (records.length === 0) {
    return 0;
  }
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
  const windowStart = addDaysToYmd(todayYmd, -6);
  const inWindow = sorted.filter(
    (r) => r.date >= windowStart && r.date <= todayYmd,
  );
  const slice = inWindow.length > 0 ? inWindow : sorted.slice(-7);
  return average(slice.map((r) => r.total_emission));
}

/**
 * Doc §3.1 — LOW / MEDIUM / HIGH using user history percentiles when enough data,
 * else baseline ratio when baseline is locked, else MEDIUM.
 */
export function computeEmissionLevel(
  avgEmission7d: number,
  emissionHistoryTotals: number[],
  baselineEmission: number,
  baselineStatus: 'pending' | 'locked',
  currentAvgEmission: number,
): EmissionLevelBand {
  const history = emissionHistoryTotals.filter((n) => Number.isFinite(n));
  if (history.length >= 9) {
    const sorted = [...history].sort((a, b) => a - b);
    const p = percentileRank(sorted, avgEmission7d);
    if (p <= 0.33) {
      return 'low';
    }
    if (p >= 0.67) {
      return 'high';
    }
    return 'medium';
  }
  if (
    baselineStatus === 'locked' &&
    baselineEmission > 0 &&
    Number.isFinite(avgEmission7d)
  ) {
    const ratio = avgEmission7d / baselineEmission;
    if (ratio <= 0.9) {
      return 'low';
    }
    if (ratio >= 1.1) {
      return 'high';
    }
    return 'medium';
  }
  if (currentAvgEmission > 0 && Number.isFinite(avgEmission7d)) {
    const ratio = avgEmission7d / currentAvgEmission;
    if (ratio <= 0.9) {
      return 'low';
    }
    if (ratio >= 1.1) {
      return 'high';
    }
    return 'medium';
  }
  return 'medium';
}

export function computeEngagementBand(
  taskCompletionRate: number,
): EngagementBand {
  if (taskCompletionRate < 0.4) {
    return 'low';
  }
  if (taskCompletionRate <= 0.7) {
    return 'medium';
  }
  return 'high';
}

/** Doc §3.3 — streak-based consistency. */
export function computeConsistencyBand(streakDays: number): ConsistencyBand {
  if (streakDays < 3) {
    return 'low';
  }
  if (streakDays <= 10) {
    return 'medium';
  }
  return 'high';
}

/**
 * Doc §6 — difficulty / progression level from completion, streak, and emission trend.
 */
export function computeUserTaskLevel(
  taskCompletionRate: number,
  streakDays: number,
  emissionTrend: EmissionTrend,
  consistency: ConsistencyBand,
): UserTaskLevel {
  const lowEngagement = taskCompletionRate < 0.4;
  const fragileHabit =
    consistency === 'low' && taskCompletionRate < 0.55;

  if (lowEngagement || fragileHabit) {
    return 'beginner';
  }

  const strongEngagement = taskCompletionRate > 0.7 && consistency === 'high';
  const veryStrongEngagement =
    taskCompletionRate > 0.7 && streakDays > 10;
  const improving = emissionTrend === 'decreasing';
  const stressed = emissionTrend === 'increasing';

  if (
    (veryStrongEngagement && (improving || !stressed)) ||
    (strongEngagement && improving) ||
    (taskCompletionRate >= 0.75 && streakDays >= 14)
  ) {
    return 'advanced';
  }

  if (taskCompletionRate > 0.7 && streakDays > 10 && stressed) {
    return 'intermediate';
  }

  return 'intermediate';
}

export function shouldIncludeWeeklyInput(
  todayYmd: string,
  userRegisteredYmd: string,
): boolean {
  const daysSince = daysBetweenYmd(userRegisteredYmd, todayYmd);
  return daysSince >= 7 && daysSince % 7 === 0;
}

function deriveBehaviorTags(
  behaviorProfile: TaskGenerationSignals['behaviorProfile'],
  emissionTrend: EmissionTrend,
): Set<string> {
  const tags = new Set<string>();
  const mode = behaviorProfile.avg_transport_mode;

  if (PRIVATE_TRANSPORT_MODES.has(mode)) {
    tags.add('PRIVATE_TRANSPORT_USER');
  }
  if (PUBLIC_TRANSPORT_MODES.has(mode)) {
    tags.add('PUBLIC_TRANSPORT_USER');
  }
  if (mode === 'walk') {
    tags.add('WALK_PRIMARY_USER');
  }

  if (behaviorProfile.avg_ac_hours >= AC_HIGH_THRESHOLD_HOURS) {
    tags.add('HIGH_AC_USER');
  }
  if (behaviorProfile.avg_energy_usage >= ENERGY_HIGH_THRESHOLD) {
    tags.add('HIGH_ENERGY_USER');
  }
  if (behaviorProfile.avg_distance >= LONG_DISTANCE_KM) {
    tags.add('LONG_DISTANCE_USER');
  }

  if (behaviorProfile.eco_action_score < 1) {
    tags.add('LOW_ECO_ACTIVITY');
  } else if (behaviorProfile.eco_action_score >= 2.5) {
    tags.add('HIGH_ECO_ACTIVITY');
  }

  if (behaviorProfile.diet_non_veg_day_fraction >= 0.35) {
    tags.add('NON_VEG_DIET_PATTERN');
  }

  if (emissionTrend === 'increasing') {
    tags.add('HIGH_EMISSION_SPIKES');
  }

  return tags;
}

export function buildPersonalizationProfile(
  signals: TaskGenerationSignals,
): UserPersonalizationProfile {
  const tags = deriveBehaviorTags(
    signals.behaviorProfile,
    signals.emissionTrend,
  );
  const engagement = computeEngagementBand(signals.taskCompletionRate);
  const consistency = computeConsistencyBand(signals.streakDays);
  const emissionLevel = computeEmissionLevel(
    signals.avgEmission7d,
    signals.emissionHistoryTotals,
    signals.baselineEmission,
    signals.baselineStatus,
    signals.currentAvgEmission,
  );
  const userLevel = computeUserTaskLevel(
    signals.taskCompletionRate,
    signals.streakDays,
    signals.emissionTrend,
    consistency,
  );

  return {
    avg_emission_7d: signals.avgEmission7d,
    behavior_tags: [...tags].sort(),
    consistency_level: consistency,
    emission_level: emissionLevel,
    emission_trend: signals.emissionTrend,
    engagement_level: engagement,
    streak_days: signals.streakDays,
    task_completion_rate: signals.taskCompletionRate,
    user_task_level: userLevel,
  };
}

/** Doc §8 — thematic overload cap (transport vs AC/energy vs performance). */
export function taskAntiOverloadTheme(
  template: TaskTemplate,
): 'transport' | 'ac_energy' | 'performance' | 'general' {
  const id = template.task_id;
  if (
    id.startsWith('transport_') ||
    id === 'fuel_save' ||
    id === 'short_trip_replace'
  ) {
    return 'transport';
  }
  if (
    id === 'ac_reduce' ||
    id === 'fan_prefer' ||
    id === 'lights_off' ||
    id === 'device_unplug' ||
    id === 'eco_cooking'
  ) {
    return 'ac_energy';
  }
  if (
    id === 'beat_yesterday' ||
    id === 'below_average' ||
    id === 'low_impact_day'
  ) {
    return 'performance';
  }
  return 'general';
}

type TaskConditions = {
  min_avg_distance_km?: unknown;
  max_avg_distance_km?: unknown;
  min_avg_ac_hours?: unknown;
  max_avg_ac_hours?: unknown;
  min_avg_energy_usage?: unknown;
  max_avg_energy_usage?: unknown;
  require_behavior_tags_all?: unknown;
  require_behavior_tags_any?: unknown;
};

function readConditions(template: TaskTemplate): TaskConditions {
  const c = template.conditions;
  if (!c || typeof c !== 'object' || Array.isArray(c)) {
    return {};
  }
  return c as TaskConditions;
}

/**
 * Doc §4 STAGE 1 — drop templates whose `conditions` cannot be met from current behavior/tags.
 */
export function templateConditionsMet(
  template: TaskTemplate,
  behaviorProfile: TaskGenerationSignals['behaviorProfile'],
  behaviorTags: Set<string>,
): boolean {
  const c = readConditions(template);
  const num = (v: unknown): number | null =>
    typeof v === 'number' && Number.isFinite(v) ? v : null;
  const strArr = (v: unknown): string[] | null =>
    Array.isArray(v) && v.every((x) => typeof x === 'string')
      ? (v as string[])
      : null;

  const minD = num(c.min_avg_distance_km);
  if (minD !== null && behaviorProfile.avg_distance < minD) {
    return false;
  }
  const maxD = num(c.max_avg_distance_km);
  if (maxD !== null && behaviorProfile.avg_distance > maxD) {
    return false;
  }

  const minAc = num(c.min_avg_ac_hours);
  if (minAc !== null && behaviorProfile.avg_ac_hours < minAc) {
    return false;
  }
  const maxAc = num(c.max_avg_ac_hours);
  if (maxAc !== null && behaviorProfile.avg_ac_hours > maxAc) {
    return false;
  }

  const minE = num(c.min_avg_energy_usage);
  if (minE !== null && behaviorProfile.avg_energy_usage < minE) {
    return false;
  }
  const maxE = num(c.max_avg_energy_usage);
  if (maxE !== null && behaviorProfile.avg_energy_usage > maxE) {
    return false;
  }

  const allTags = strArr(c.require_behavior_tags_all);
  if (allTags) {
    for (const t of allTags) {
      if (!behaviorTags.has(t)) {
        return false;
      }
    }
  }

  const anyTags = strArr(c.require_behavior_tags_any);
  if (anyTags && anyTags.length > 0) {
    if (!anyTags.some((t) => behaviorTags.has(t))) {
      return false;
    }
  }

  return true;
}

function effectiveCooldownDays(
  template: TaskTemplate,
  relaxCooldown: boolean,
): number {
  const base = template.cooldown_days;
  if (!relaxCooldown) {
    return base;
  }
  return Math.max(0, base - 1);
}

export function isTaskCoolingDown(
  todayYmd: string,
  template: TaskTemplate,
  lastCompletionYmd: string | undefined,
  relaxCooldown: boolean,
): boolean {
  if (!lastCompletionYmd) {
    return false;
  }
  const cd = effectiveCooldownDays(template, relaxCooldown);
  if (cd === 0) {
    return false;
  }
  const daysSince = daysBetweenYmd(lastCompletionYmd, todayYmd);
  return daysSince < cd;
}

/**
 * Doc §4 STAGE 2 — context matching layered on relevance (transport / AC / eco / spikes / emission tier).
 */
function contextMatchingRelevanceBoost(
  template: TaskTemplate,
  tags: Set<string>,
  profile: UserPersonalizationProfile,
): number {
  let boost = 0;
  const id = template.task_id;
  const cat = template.category;

  if (tags.has('PRIVATE_TRANSPORT_USER')) {
    if (
      id.startsWith('transport_') ||
      id === 'fuel_save' ||
      id === 'short_trip_replace' ||
      id === 'transport_carpool'
    ) {
      boost += 2;
    }
  }

  if (tags.has('HIGH_AC_USER')) {
    if (id === 'ac_reduce' || id === 'fan_prefer') {
      boost += 2;
    }
    if (id === 'lights_off' || id === 'device_unplug') {
      boost += 1;
    }
  }

  if (tags.has('HIGH_ENERGY_USER')) {
    if (
      id === 'lights_off' ||
      id === 'device_unplug' ||
      id === 'eco_cooking'
    ) {
      boost += 1;
    }
  }

  if (tags.has('LONG_DISTANCE_USER')) {
    if (
      id === 'transport_carpool' ||
      id === 'fuel_save' ||
      id === 'transport_public'
    ) {
      boost += 1;
    }
  }

  if (tags.has('LOW_ECO_ACTIVITY') && cat === 'eco_action') {
    boost += 2;
  }

  if (tags.has('HIGH_EMISSION_SPIKES')) {
    if (cat === 'emission_reduction') {
      boost += 1;
    }
    if (
      id === 'beat_yesterday' ||
      id === 'below_average' ||
      id === 'low_impact_day'
    ) {
      boost += 2;
    }
  }

  if (profile.emission_level === 'high') {
    if (
      id === 'beat_yesterday' ||
      id === 'below_average' ||
      id === 'low_impact_day' ||
      id === 'ac_reduce' ||
      id === 'transport_public'
    ) {
      boost += 1;
    }
  }

  if (profile.emission_level === 'low') {
    if (cat === 'awareness' || cat === 'eco_action') {
      boost += 1;
    }
    if (
      id === 'view_insights' ||
      id === 'trend_watch' ||
      id === 'compare_day'
    ) {
      boost += 1;
    }
  }

  if (tags.has('PUBLIC_TRANSPORT_USER') && id === 'transport_public') {
    boost -= 1;
  }
  if (tags.has('WALK_PRIMARY_USER') && id === 'transport_walk') {
    boost -= 1;
  }

  return boost;
}

/** Doc §5.1 — relevance 0–5; irrelevant baseline 1. */
function relevanceScore(
  template: TaskTemplate,
  tags: Set<string>,
  profile: UserPersonalizationProfile,
): number {
  let score = 1;
  const id = template.task_id;
  const cat = template.category;

  if (
    id.startsWith('transport_') ||
    id === 'fuel_save' ||
    id === 'short_trip_replace' ||
    id === 'transport_carpool'
  ) {
    score = Math.max(score, tags.has('PRIVATE_TRANSPORT_USER') ? 4 : 2);
  }

  if (id === 'transport_public') {
    score = Math.max(
      score,
      tags.has('PRIVATE_TRANSPORT_USER') || tags.has('LONG_DISTANCE_USER')
        ? 5
        : 2,
    );
  }

  if (id === 'ac_reduce' || id === 'fan_prefer') {
    score = Math.max(score, tags.has('HIGH_AC_USER') ? 5 : 2);
  }

  if (
    id === 'lights_off' ||
    id === 'device_unplug' ||
    id === 'eco_cooking'
  ) {
    score = Math.max(
      score,
      tags.has('HIGH_ENERGY_USER') || tags.has('HIGH_AC_USER') ? 4 : 2,
    );
  }

  if (id === 'eco_meatless') {
    score = Math.max(score, tags.has('NON_VEG_DIET_PATTERN') ? 5 : 3);
  }
  if (id === 'eco_local_food') {
    score = Math.max(score, tags.has('NON_VEG_DIET_PATTERN') ? 4 : 3);
  }

  if (cat === 'eco_action') {
    score = Math.max(score, tags.has('LOW_ECO_ACTIVITY') ? 5 : 3);
    if (tags.has('HIGH_ECO_ACTIVITY')) {
      score = Math.min(5, Math.max(score, 3));
    }
  }

  if (cat === 'emission_reduction') {
    score = Math.max(score, tags.has('HIGH_EMISSION_SPIKES') ? 4 : 2);
  }

  if (
    id === 'beat_yesterday' ||
    id === 'below_average' ||
    id === 'low_impact_day'
  ) {
    score = Math.max(
      score,
      tags.has('HIGH_EMISSION_SPIKES') || profile.emission_level === 'high'
        ? 5
        : 2,
    );
  }

  if (cat === 'awareness') {
    score = Math.max(score, profile.emission_level === 'low' ? 4 : 2);
  }

  score += contextMatchingRelevanceBoost(template, tags, profile);
  return Math.max(0, Math.min(5, score));
}

/** Doc §5.2 — behavior impact potential 0–5. */
function behaviorImpactScore(template: TaskTemplate): number {
  const id = template.task_id;
  const cat = template.category;

  if (cat === 'awareness') {
    if (id === 'check_aqi' || id === 'view_insights') {
      return 2;
    }
    if (id === 'compare_day' || id === 'trend_watch') {
      return 3;
    }
    return 2;
  }

  if (cat === 'eco_action') {
    if (template.priority >= 4) {
      return 4;
    }
    return 3;
  }

  if (cat === 'emission_reduction') {
    if (
      id.startsWith('transport_') ||
      id === 'fuel_save' ||
      id === 'short_trip_replace'
    ) {
      return 5;
    }
    if (id === 'ac_reduce') {
      return 5;
    }
    if (
      id === 'beat_yesterday' ||
      id === 'below_average' ||
      id === 'low_impact_day'
    ) {
      return 4;
    }
    if (
      id === 'fan_prefer' ||
      id === 'lights_off' ||
      id === 'device_unplug' ||
      id === 'eco_cooking'
    ) {
      return 3;
    }
    return 3;
  }

  return 2;
}

/** Doc §5.3 — engagement fit 0–5. */
function engagementFitScore(
  template: TaskTemplate,
  band: EngagementBand,
): number {
  const simple =
    template.completion_type === 'manual' && template.priority <= 2;
  const challenging = template.priority >= 4;
  const hybridMid =
    template.completion_type === 'hybrid' && template.priority === 3;

  if (band === 'low') {
    if (simple) {
      return 5;
    }
    if (challenging) {
      return 2;
    }
    if (hybridMid) {
      return 3;
    }
    return 4;
  }

  if (band === 'high') {
    if (challenging || template.completion_type === 'hybrid') {
      return 5;
    }
    if (simple) {
      return 3;
    }
    return 4;
  }

  if (template.priority === 3 || template.completion_type === 'hybrid') {
    return 5;
  }
  if (template.priority <= 2) {
    return 4;
  }
  return 3;
}

/** Doc §5.4 — difficulty alignment 0–5 vs user_task_level. */
function difficultyAlignmentScore(
  template: TaskTemplate,
  level: UserTaskLevel,
): number {
  if (level === 'beginner') {
    if (template.priority <= 2 && template.completion_type === 'manual') {
      return 5;
    }
    if (template.priority <= 2) {
      return 5;
    }
    if (template.priority === 3) {
      return 4;
    }
    if (template.completion_type === 'auto' && template.priority <= 3) {
      return 4;
    }
    return 2;
  }

  if (level === 'advanced') {
    if (template.priority >= 4) {
      return 5;
    }
    if (template.completion_type === 'hybrid') {
      return 4;
    }
    if (
      template.task_id === 'beat_yesterday' ||
      template.task_id === 'below_average' ||
      template.task_id === 'low_impact_day'
    ) {
      return 5;
    }
    return 3;
  }

  if (template.priority === 3 || template.completion_type === 'hybrid') {
    return 5;
  }
  if (template.priority <= 2) {
    return 4;
  }
  return 4;
}

export function computeTaskPersonalizationScores(
  template: TaskTemplate,
  profile: UserPersonalizationProfile,
): TaskPersonalizationScoreBreakdown {
  const tags = new Set(profile.behavior_tags);
  const relevance = relevanceScore(template, tags, profile);
  const behaviorImpact = behaviorImpactScore(template);
  const engagementFit = engagementFitScore(
    template,
    profile.engagement_level,
  );
  const difficulty = difficultyAlignmentScore(template, profile.user_task_level);
  return {
    behavior_impact_score: behaviorImpact,
    difficulty_score: difficulty,
    engagement_fit_score: engagementFit,
    relevance_score: relevance,
    total: relevance + behaviorImpact + engagementFit + difficulty,
  };
}

function totalScore(
  template: TaskTemplate,
  profile: UserPersonalizationProfile,
): number {
  return computeTaskPersonalizationScores(template, profile).total;
}

function hardFilterCandidate(
  template: TaskTemplate,
  signals: TaskGenerationSignals,
  behaviorTags: Set<string>,
): boolean {
  if (!template.active) {
    return false;
  }
  if (template.task_id === 'daily_input' || template.task_id === 'weekly_input') {
    return false;
  }
  if (!signals.relaxYesterday && signals.yesterdayTaskIds.has(template.task_id)) {
    return false;
  }
  const last = signals.lastCompletionYmdByTaskId.get(template.task_id);
  if (
    isTaskCoolingDown(
      signals.todayYmd,
      template,
      last,
      signals.relaxCooldown,
    )
  ) {
    return false;
  }
  if (!signals.relaxConditionGate && !templateConditionsMet(template, signals.behaviorProfile, behaviorTags)) {
    return false;
  }
  return true;
}

function sortByScoreDesc(
  templates: TaskTemplate[],
  profile: UserPersonalizationProfile,
): TaskTemplate[] {
  return [...templates].sort(
    (a, b) => totalScore(b, profile) - totalScore(a, profile),
  );
}

const MAX_TASKS_PER_OVERLOAD_THEME = 2;

function pickWithCategoryAndThemeCap(
  sorted: TaskTemplate[],
  countMin: number,
  countMax: number,
  selectedIds: Set<string>,
  categoryCounts: Map<string, number>,
  maxPerCategory: number,
  themeCounts: Map<string, number>,
): TaskTemplate[] {
  const out: TaskTemplate[] = [];

  const tryPush = (
    t: TaskTemplate,
    respectTheme: boolean,
  ): boolean => {
    if (out.length >= countMax) {
      return false;
    }
    if (selectedIds.has(t.task_id)) {
      return false;
    }
    const c = categoryCounts.get(t.category) ?? 0;
    if (c >= maxPerCategory) {
      return false;
    }
    const theme = taskAntiOverloadTheme(t);
    if (
      respectTheme &&
      theme !== 'general' &&
      (themeCounts.get(theme) ?? 0) >= MAX_TASKS_PER_OVERLOAD_THEME
    ) {
      return false;
    }
    out.push(t);
    selectedIds.add(t.task_id);
    categoryCounts.set(t.category, c + 1);
    if (theme !== 'general') {
      themeCounts.set(theme, (themeCounts.get(theme) ?? 0) + 1);
    }
    return true;
  };

  for (const t of sorted) {
    if (out.length >= countMax) {
      break;
    }
    tryPush(t, true);
  }

  if (out.length < countMin) {
    for (const t of sorted) {
      if (out.length >= countMin) {
        break;
      }
      if (selectedIds.has(t.task_id)) {
        continue;
      }
      tryPush(t, false);
    }
  }

  return out;
}

function buildPool(
  allActive: TaskTemplate[],
  signals: TaskGenerationSignals,
  behaviorTags: Set<string>,
): TaskTemplate[] {
  return allActive.filter((t) => hardFilterCandidate(t, signals, behaviorTags));
}

/**
 * Doc §9 — relax cooldown → relax yesterday/conditions → safe eco list.
 */
function fallbackFill(
  allActive: TaskTemplate[],
  baseSignals: TaskGenerationSignals,
  selected: GeneratedDailyTaskItem[],
  minTotal: number,
  profile: UserPersonalizationProfile,
  behaviorTags: Set<string>,
): GeneratedDailyTaskItem[] {
  const selectedIds = new Set(selected.map((t) => t.task_id));
  const phases: TaskGenerationSignals[] = [
    { ...baseSignals, relaxCooldown: true, relaxYesterday: false, relaxConditionGate: false },
    { ...baseSignals, relaxCooldown: true, relaxYesterday: true, relaxConditionGate: false },
    { ...baseSignals, relaxCooldown: true, relaxYesterday: true, relaxConditionGate: true },
  ];

  let out = [...selected];

  for (const sig of phases) {
    if (out.length >= minTotal) {
      break;
    }
    const pool = buildPool(allActive, sig, behaviorTags);
    const sorted = sortByScoreDesc(pool, profile);
    for (const t of sorted) {
      if (out.length >= minTotal) {
        break;
      }
      if (selectedIds.has(t.task_id)) {
        continue;
      }
      out.push({
        task_id: t.task_id,
        category: t.category,
        completion_type: t.completion_type,
      });
      selectedIds.add(t.task_id);
    }
  }

  if (out.length < minTotal) {
    const relaxed: TaskGenerationSignals = {
      ...baseSignals,
      relaxCooldown: true,
      relaxYesterday: true,
      relaxConditionGate: true,
    };
    for (const id of SAFE_FALLBACK_ECO_IDS) {
      if (out.length >= minTotal) {
        break;
      }
      if (selectedIds.has(id)) {
        continue;
      }
      const tpl = allActive.find((x) => x.task_id === id);
      if (!tpl || !hardFilterCandidate(tpl, relaxed, behaviorTags)) {
        continue;
      }
      out.push({
        task_id: tpl.task_id,
        category: tpl.category,
        completion_type: tpl.completion_type,
      });
      selectedIds.add(id);
    }
  }

  return out;
}

/**
 * When over the 6-task cap, keep non-system tasks by documented priority:
 * emission_reduction and eco_action before optional awareness slots.
 */
function trimToMax(
  items: GeneratedDailyTaskItem[],
  maxTotal: number,
  profile: UserPersonalizationProfile,
  templateById: Map<string, TaskTemplate>,
): GeneratedDailyTaskItem[] {
  if (items.length <= maxTotal) {
    return items;
  }
  const systemIds = new Set(['daily_input', 'weekly_input']);
  const system = items.filter((i) => systemIds.has(i.task_id));
  const rest = items.filter((i) => !systemIds.has(i.task_id));

  const templateScore = (i: GeneratedDailyTaskItem): number => {
    const tpl = templateById.get(i.task_id);
    if (!tpl) {
      return 0;
    }
    return totalScore(tpl, profile);
  };

  const sortedRest = [...rest].sort(
    (a, b) =>
      templateScore(b) - templateScore(a) ||
      a.task_id.localeCompare(b.task_id),
  );
  const allowedRest = Math.max(0, maxTotal - system.length);
  return [...system, ...sortedRest.slice(0, allowedRest)];
}

/**
 * Dynamic personalized daily task set: 4–6 tasks (doc §7), unique task_ids,
 * composition rules, cooldown + anti-repetition (doc §8), three-stage pipeline (doc §4).
 */
export function generateDailyTaskSelection(
  signals: TaskGenerationSignals,
): GeneratedDailyTaskItem[] {
  const templateById = new Map(
    signals.templates.map((t) => [t.task_id, t]),
  );
  const allActive = signals.templates.filter((t) => t.active);

  const dailyTpl = templateById.get('daily_input');
  if (!dailyTpl?.active) {
    throw new Error('TASK_TEMPLATE_MISSING:daily_input');
  }

  const includeWeekly = shouldIncludeWeeklyInput(
    signals.todayYmd,
    signals.userRegisteredYmd,
  );
  const weeklyTpl = templateById.get('weekly_input');
  if (includeWeekly && !weeklyTpl?.active) {
    throw new Error('TASK_TEMPLATE_MISSING:weekly_input');
  }

  const profile = buildPersonalizationProfile(signals);
  const behaviorTags = new Set(profile.behavior_tags);

  const baseSignals: TaskGenerationSignals = {
    ...signals,
    relaxConditionGate: false,
    relaxCooldown: signals.relaxCooldown,
    relaxYesterday: false,
  };

  const pool = buildPool(allActive, baseSignals, behaviorTags);
  const ecoPool = pool.filter((t) => t.category === 'eco_action');
  const emissionPool = pool.filter((t) => t.category === 'emission_reduction');
  const awarenessPool = pool.filter((t) => t.category === 'awareness');

  const sortedEco = sortByScoreDesc(ecoPool, profile);
  const sortedEmission = sortByScoreDesc(emissionPool, profile);
  const sortedAwareness = sortByScoreDesc(awarenessPool, profile);

  const selectedIds = new Set<string>();
  const categoryCounts = new Map<string, number>();
  const themeCounts = new Map<string, number>();
  const maxPerCategory = 2;

  const ecoPick = pickWithCategoryAndThemeCap(
    sortedEco,
    1,
    2,
    selectedIds,
    categoryCounts,
    maxPerCategory,
    themeCounts,
  );
  const emissionPick = pickWithCategoryAndThemeCap(
    sortedEmission,
    1,
    2,
    selectedIds,
    categoryCounts,
    maxPerCategory,
    themeCounts,
  );
  const awarenessPick = pickWithCategoryAndThemeCap(
    sortedAwareness,
    0,
    1,
    selectedIds,
    categoryCounts,
    maxPerCategory,
    themeCounts,
  );

  const system: GeneratedDailyTaskItem[] = [
    {
      task_id: dailyTpl.task_id,
      category: dailyTpl.category,
      completion_type: dailyTpl.completion_type,
    },
  ];
  if (includeWeekly && weeklyTpl) {
    system.push({
      task_id: weeklyTpl.task_id,
      category: weeklyTpl.category,
      completion_type: weeklyTpl.completion_type,
    });
  }

  let combined: GeneratedDailyTaskItem[] = [
    ...system,
    ...ecoPick.map((t) => ({
      task_id: t.task_id,
      category: t.category,
      completion_type: t.completion_type,
    })),
    ...emissionPick.map((t) => ({
      task_id: t.task_id,
      category: t.category,
      completion_type: t.completion_type,
    })),
    ...awarenessPick.map((t) => ({
      task_id: t.task_id,
      category: t.category,
      completion_type: t.completion_type,
    })),
  ];

  const minTotal = 4;
  const maxTotal = 6;
  if (combined.length < minTotal) {
    combined = fallbackFill(
      allActive,
      baseSignals,
      combined,
      minTotal,
      profile,
      behaviorTags,
    );
  }
  combined = trimToMax(combined, maxTotal, profile, templateById);

  const seen = new Set<string>();
  let deduped: GeneratedDailyTaskItem[] = [];
  for (const row of combined) {
    if (seen.has(row.task_id)) {
      continue;
    }
    seen.add(row.task_id);
    deduped.push(row);
  }

  if (deduped.length < minTotal) {
    deduped = fallbackFill(
      allActive,
      baseSignals,
      deduped,
      minTotal,
      profile,
      behaviorTags,
    );
    deduped = trimToMax(deduped, maxTotal, profile, templateById);
    const seen2 = new Set<string>();
    const rededup: GeneratedDailyTaskItem[] = [];
    for (const row of deduped) {
      if (seen2.has(row.task_id)) {
        continue;
      }
      seen2.add(row.task_id);
      rededup.push(row);
    }
    deduped = rededup;
  }

  return deduped;
}
