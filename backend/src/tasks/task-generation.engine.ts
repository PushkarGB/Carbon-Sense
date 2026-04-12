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
    eco_action_score: number;
  };
  taskCompletionRate: number;
  streakDays: number;
  emissionTrend: EmissionTrend;
  relaxCooldown: boolean;
}

export interface GeneratedDailyTaskItem {
  task_id: string;
  category: TaskTemplate['category'];
  completion_type: TaskTemplate['completion_type'];
}

const AC_HIGH_THRESHOLD_HOURS = 4;
const PRIVATE_TRANSPORT_MODES = new Set(['car', 'bike']);
const TWO_WHEELER_MODES = new Set(['bike']);

const SAFE_FALLBACK_ECO_IDS = [
  'eco_bag',
  'eco_bottle',
  'eco_waste_segregation',
  'eco_no_litter',
] as const;

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

export function computeUserTaskLevel(
  taskCompletionRate: number,
  streakDays: number,
  emissionTrend: EmissionTrend,
): UserTaskLevel {
  const highEngaged =
    taskCompletionRate > 0.7 && streakDays > 10;
  const lowEngaged =
    taskCompletionRate < 0.4 && streakDays < 3;

  if (highEngaged && emissionTrend === 'decreasing') {
    return 'advanced';
  }
  if (lowEngaged) {
    return 'beginner';
  }
  return 'intermediate';
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
  if (
    PRIVATE_TRANSPORT_MODES.has(behaviorProfile.avg_transport_mode) ||
    TWO_WHEELER_MODES.has(behaviorProfile.avg_transport_mode)
  ) {
    tags.add('PRIVATE_TRANSPORT_USER');
  }
  if (TWO_WHEELER_MODES.has(behaviorProfile.avg_transport_mode)) {
    tags.add('TWO_WHEELER_USER');
  }
  if (behaviorProfile.avg_ac_hours >= AC_HIGH_THRESHOLD_HOURS) {
    tags.add('HIGH_AC_USER');
  }
  if (behaviorProfile.eco_action_score < 1) {
    tags.add('LOW_ECO_ACTIVITY');
  }
  if (emissionTrend === 'increasing') {
    tags.add('HIGH_EMISSION_SPIKES');
  }
  return tags;
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

function relevanceScore(
  template: TaskTemplate,
  tags: Set<string>,
): number {
  let score = 2;

  if (
    template.task_id === 'transport_public' &&
    (tags.has('PRIVATE_TRANSPORT_USER') || tags.has('TWO_WHEELER_USER'))
  ) {
    score = 5;
  }
  if (template.task_id === 'fuel_save' && tags.has('PRIVATE_TRANSPORT_USER')) {
    score = Math.max(score, 4);
  }
  if (
    template.task_id === 'short_trip_replace' &&
    tags.has('PRIVATE_TRANSPORT_USER')
  ) {
    score = Math.max(score, 4);
  }
  if (template.task_id === 'ac_reduce' && tags.has('HIGH_AC_USER')) {
    score = 5;
  }
  if (template.task_id === 'fan_prefer' && tags.has('HIGH_AC_USER')) {
    score = Math.max(score, 4);
  }
  if (template.category === 'eco_action' && tags.has('LOW_ECO_ACTIVITY')) {
    score = Math.max(score, 4);
  }
  if (
    template.category === 'emission_reduction' &&
    tags.has('HIGH_EMISSION_SPIKES')
  ) {
    score = Math.max(score, 4);
  }
  if (
    ['beat_yesterday', 'below_average', 'low_impact_day'].includes(
      template.task_id,
    ) &&
    tags.has('HIGH_EMISSION_SPIKES')
  ) {
    score = Math.max(score, 5);
  }

  return Math.min(5, score);
}

function behaviorImpactScore(template: TaskTemplate): number {
  if (template.category === 'awareness') {
    return 2;
  }
  if (template.category === 'eco_action') {
    return 3;
  }
  if (template.category === 'emission_reduction') {
    if (
      template.task_id.startsWith('transport_') ||
      template.task_id === 'fuel_save' ||
      template.task_id === 'short_trip_replace'
    ) {
      return 5;
    }
    if (template.task_id === 'ac_reduce') {
      return 5;
    }
    return 3;
  }
  return 2;
}

function engagementFitScore(
  template: TaskTemplate,
  band: EngagementBand,
): number {
  const simple = template.completion_type === 'manual' && template.priority <= 2;
  const challenging = template.priority >= 4;

  if (band === 'low' && simple) {
    return 5;
  }
  if (band === 'low' && challenging) {
    return 2;
  }
  if (band === 'high' && challenging) {
    return 5;
  }
  if (band === 'high' && simple) {
    return 3;
  }
  return 4;
}

function difficultyAlignmentScore(
  template: TaskTemplate,
  level: UserTaskLevel,
): number {
  if (level === 'beginner') {
    if (template.priority <= 2) {
      return 5;
    }
    if (template.priority === 3) {
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
    return 3;
  }
  if (template.priority === 3 || template.completion_type === 'hybrid') {
    return 5;
  }
  return 4;
}

function totalScore(
  template: TaskTemplate,
  tags: Set<string>,
  band: EngagementBand,
  level: UserTaskLevel,
): number {
  return (
    relevanceScore(template, tags) +
    behaviorImpactScore(template) +
    engagementFitScore(template, band) +
    difficultyAlignmentScore(template, level)
  );
}

function hardFilterCandidate(
  template: TaskTemplate,
  signals: TaskGenerationSignals,
): boolean {
  if (!template.active) {
    return false;
  }
  if (template.task_id === 'daily_input' || template.task_id === 'weekly_input') {
    return false;
  }
  if (signals.yesterdayTaskIds.has(template.task_id)) {
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
  return true;
}

function sortByScoreDesc(
  templates: TaskTemplate[],
  tags: Set<string>,
  band: EngagementBand,
  level: UserTaskLevel,
): TaskTemplate[] {
  return [...templates].sort(
    (a, b) => totalScore(b, tags, band, level) - totalScore(a, tags, band, level),
  );
}

function pickWithCategoryCap(
  sorted: TaskTemplate[],
  countMin: number,
  countMax: number,
  selectedIds: Set<string>,
  categoryCounts: Map<string, number>,
  maxPerCategory: number,
): TaskTemplate[] {
  const out: TaskTemplate[] = [];
  for (const t of sorted) {
    if (out.length >= countMax) {
      break;
    }
    if (selectedIds.has(t.task_id)) {
      continue;
    }
    const c = categoryCounts.get(t.category) ?? 0;
    if (c >= maxPerCategory) {
      continue;
    }
    out.push(t);
    selectedIds.add(t.task_id);
    categoryCounts.set(t.category, c + 1);
  }
  if (out.length < countMin) {
    for (const t of sorted) {
      if (out.length >= countMin) {
        break;
      }
      if (selectedIds.has(t.task_id)) {
        continue;
      }
      out.push(t);
      selectedIds.add(t.task_id);
      const c = categoryCounts.get(t.category) ?? 0;
      categoryCounts.set(t.category, c + 1);
    }
  }
  return out;
}

function fallbackFill(
  allActive: TaskTemplate[],
  signals: TaskGenerationSignals,
  selected: GeneratedDailyTaskItem[],
  minTotal: number,
): GeneratedDailyTaskItem[] {
  const selectedIds = new Set(selected.map((t) => t.task_id));
  const relaxedSignals: TaskGenerationSignals = {
    ...signals,
    relaxCooldown: true,
  };

  const pool = allActive.filter((t) =>
    hardFilterCandidate(t, relaxedSignals),
  );
  const tags = deriveBehaviorTags(
    signals.behaviorProfile,
    signals.emissionTrend,
  );
  const band = computeEngagementBand(signals.taskCompletionRate);
  const level = computeUserTaskLevel(
    signals.taskCompletionRate,
    signals.streakDays,
    signals.emissionTrend,
  );
  const sorted = sortByScoreDesc(pool, tags, band, level);

  const out = [...selected];
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

  if (out.length < minTotal) {
    for (const id of SAFE_FALLBACK_ECO_IDS) {
      if (out.length >= minTotal) {
        break;
      }
      if (selectedIds.has(id)) {
        continue;
      }
      const tpl = allActive.find((x) => x.task_id === id);
      if (!tpl || !hardFilterCandidate(tpl, relaxedSignals)) {
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
): GeneratedDailyTaskItem[] {
  if (items.length <= maxTotal) {
    return items;
  }
  const systemIds = new Set(['daily_input', 'weekly_input']);
  const system = items.filter((i) => systemIds.has(i.task_id));
  const rest = items.filter((i) => !systemIds.has(i.task_id));
  const keepPriority = (i: GeneratedDailyTaskItem): number => {
    if (i.category === 'emission_reduction') {
      return 0;
    }
    if (i.category === 'eco_action') {
      return 1;
    }
    return 2;
  };
  const sortedRest = [...rest].sort(
    (a, b) =>
      keepPriority(a) - keepPriority(b) ||
      a.task_id.localeCompare(b.task_id),
  );
  const allowedRest = Math.max(0, maxTotal - system.length);
  return [...system, ...sortedRest.slice(0, allowedRest)];
}

/**
 * Dynamic personalized daily task set: 4–6 tasks, unique task_ids, system tasks first,
 * category balance (max 2 non-system per category), cooldown + anti-repetition,
 * scoring per Task Personalization Engine (v1).
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

  const tags = deriveBehaviorTags(
    signals.behaviorProfile,
    signals.emissionTrend,
  );
  const band = computeEngagementBand(signals.taskCompletionRate);
  const level = computeUserTaskLevel(
    signals.taskCompletionRate,
    signals.streakDays,
    signals.emissionTrend,
  );

  const pool = allActive.filter((t) => hardFilterCandidate(t, signals));
  const ecoPool = pool.filter((t) => t.category === 'eco_action');
  const emissionPool = pool.filter((t) => t.category === 'emission_reduction');
  const awarenessPool = pool.filter((t) => t.category === 'awareness');

  const sortedEco = sortByScoreDesc(ecoPool, tags, band, level);
  const sortedEmission = sortByScoreDesc(emissionPool, tags, band, level);
  const sortedAwareness = sortByScoreDesc(awarenessPool, tags, band, level);

  const selectedIds = new Set<string>();
  const categoryCounts = new Map<string, number>();
  const maxPerCategory = 2;

  const ecoPick = pickWithCategoryCap(
    sortedEco,
    1,
    2,
    selectedIds,
    categoryCounts,
    maxPerCategory,
  );
  const emissionPick = pickWithCategoryCap(
    sortedEmission,
    1,
    2,
    selectedIds,
    categoryCounts,
    maxPerCategory,
  );
  const awarenessPick = pickWithCategoryCap(
    sortedAwareness,
    0,
    1,
    selectedIds,
    categoryCounts,
    maxPerCategory,
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
    combined = fallbackFill(allActive, signals, combined, minTotal);
  }
  combined = trimToMax(combined, maxTotal);

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
    deduped = fallbackFill(allActive, signals, deduped, minTotal);
    deduped = trimToMax(deduped, maxTotal);
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
