import { TaskTemplate } from '../schemas/task-template.schema';
import {
  addDaysToYmd,
  buildPersonalizationProfile,
  computeAvgEmission7dFromRecords,
  computeConsistencyBand,
  computeDietNonVegDayFraction,
  computeEmissionLevel,
  computeUserTaskLevel,
  daysBetweenYmd,
  generateDailyTaskSelection,
  isTaskCoolingDown,
  shouldIncludeWeeklyInput,
  templateConditionsMet,
  type TaskGenerationSignals,
} from './task-generation.engine';

function tpl(partial: Partial<TaskTemplate> & { task_id: string }): TaskTemplate {
  return {
    active: true,
    category: 'eco_action',
    completion_type: 'manual',
    conditions: {},
    cooldown_days: 0,
    description: 'd',
    evaluation_logic: null,
    priority: 2,
    title: 't',
    ...partial,
  };
}

const baseTemplates: TaskTemplate[] = [
  tpl({
    task_id: 'daily_input',
    category: 'system',
    completion_type: 'auto',
    evaluation_logic: 'daily_submission_exists',
    priority: 1,
  }),
  tpl({
    task_id: 'weekly_input',
    category: 'system',
    completion_type: 'auto',
    evaluation_logic: 'weekly_submission_exists',
    priority: 1,
  }),
  tpl({ task_id: 'eco_bag', cooldown_days: 2 }),
  tpl({ task_id: 'eco_bottle', cooldown_days: 2 }),
  tpl({ task_id: 'eco_plastic_skip', cooldown_days: 3 }),
  tpl({ task_id: 'eco_waste_segregation', cooldown_days: 1 }),
  tpl({
    task_id: 'transport_public',
    category: 'emission_reduction',
    completion_type: 'auto',
    evaluation_logic: 'transport_mode == public',
    priority: 5,
  }),
  tpl({
    task_id: 'ac_reduce',
    category: 'emission_reduction',
    completion_type: 'hybrid',
    evaluation_logic: 'ac_hours < avg_ac_hours',
    cooldown_days: 1,
    priority: 5,
  }),
  tpl({
    task_id: 'beat_yesterday',
    category: 'emission_reduction',
    completion_type: 'auto',
    evaluation_logic: 'today_emission < yesterday_emission',
    priority: 5,
  }),
  tpl({
    task_id: 'check_aqi',
    category: 'awareness',
    completion_type: 'auto',
    evaluation_logic: 'aqi_screen_viewed',
    priority: 1,
  }),
];

function baseSignals(
  overrides: Partial<TaskGenerationSignals> = {},
): TaskGenerationSignals {
  return {
    avgEmission7d: 12,
    baselineEmission: 10,
    baselineStatus: 'locked',
    behaviorProfile: {
      avg_ac_hours: 0,
      avg_distance: 10,
      avg_energy_usage: 5,
      avg_transport_mode: 'car',
      diet_non_veg_day_fraction: 0,
      eco_action_score: 0.5,
    },
    currentAvgEmission: 11,
    emissionHistoryTotals: [8, 9, 10, 11, 12, 13, 14, 15, 16],
    emissionTrend: 'stable',
    lastCompletionYmdByTaskId: new Map(),
    relaxCooldown: false,
    streakDays: 5,
    taskCompletionRate: 0.5,
    templates: baseTemplates,
    todayYmd: '2026-04-12',
    userRegisteredYmd: '2026-04-01',
    yesterdayTaskIds: new Set<string>(),
    ...overrides,
  };
}

describe('task-generation.engine', () => {
  it('includes daily_input and yields 4–6 unique tasks', () => {
    const out = generateDailyTaskSelection(baseSignals());
    expect(out.map((t) => t.task_id)).toContain('daily_input');
    expect(new Set(out.map((t) => t.task_id)).size).toBe(out.length);
    expect(out.length).toBeGreaterThanOrEqual(4);
    expect(out.length).toBeLessThanOrEqual(6);
  });

  it('excludes tasks that appeared yesterday', () => {
    const out = generateDailyTaskSelection(
      baseSignals({
        yesterdayTaskIds: new Set(['eco_bag', 'transport_public']),
      }),
    );
    expect(out.map((t) => t.task_id)).not.toContain('eco_bag');
    expect(out.map((t) => t.task_id)).not.toContain('transport_public');
  });

  it('respects cooldown from last completion date', () => {
    const last = new Map([['eco_bag', '2026-04-11']]);
    const cooling = isTaskCoolingDown(
      '2026-04-12',
      baseTemplates.find((t) => t.task_id === 'eco_bag')!,
      last.get('eco_bag'),
      false,
    );
    expect(cooling).toBe(true);
  });

  it('includes weekly_input on the documented weekly milestone', () => {
    expect(shouldIncludeWeeklyInput('2026-04-08', '2026-04-01')).toBe(true);
    const out = generateDailyTaskSelection(
      baseSignals({
        todayYmd: '2026-04-08',
        userRegisteredYmd: '2026-04-01',
      }),
    );
    expect(out.map((t) => t.task_id)).toContain('weekly_input');
  });

  it('addDaysToYmd and daysBetweenYmd are consistent', () => {
    expect(addDaysToYmd('2026-04-12', -1)).toBe('2026-04-11');
    expect(daysBetweenYmd('2026-04-01', '2026-04-08')).toBe(7);
  });

  it('computeAvgEmission7dFromRecords uses a 7-day calendar window', () => {
    const avg = computeAvgEmission7dFromRecords(
      [
        { date: '2026-04-06', total_emission: 10 },
        { date: '2026-04-12', total_emission: 20 },
      ],
      '2026-04-12',
    );
    expect(avg).toBe(15);
  });

  it('computeEmissionLevel uses percentiles when enough history exists', () => {
    const hist = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    expect(computeEmissionLevel(1, hist, 5, 'locked', 0)).toBe('low');
    expect(computeEmissionLevel(10, hist, 5, 'locked', 0)).toBe('high');
  });

  it('computeEmissionLevel falls back to current average when history is short', () => {
    expect(
      computeEmissionLevel(5, [5, 5], 0, 'pending', 10),
    ).toBe('low');
    expect(
      computeEmissionLevel(12, [5, 5], 0, 'pending', 10),
    ).toBe('high');
  });

  it('computeConsistencyBand matches streak thresholds', () => {
    expect(computeConsistencyBand(2)).toBe('low');
    expect(computeConsistencyBand(5)).toBe('medium');
    expect(computeConsistencyBand(11)).toBe('high');
  });

  it('computeUserTaskLevel incorporates consistency and trend', () => {
    expect(
      computeUserTaskLevel(0.35, 5, 'stable', computeConsistencyBand(5)),
    ).toBe('beginner');
    expect(
      computeUserTaskLevel(0.85, 15, 'decreasing', computeConsistencyBand(15)),
    ).toBe('advanced');
  });

  it('buildPersonalizationProfile aggregates doc §3 dimensions', () => {
    const p = buildPersonalizationProfile(baseSignals());
    expect(p.behavior_tags).toContain('PRIVATE_TRANSPORT_USER');
    expect(p.engagement_level).toBe('medium');
    expect(['low', 'medium', 'high']).toContain(p.emission_level);
  });

  it('computeDietNonVegDayFraction weights non_veg and mixed days', () => {
    expect(
      computeDietNonVegDayFraction([
        { food: { diet_type: 'non_veg' } },
        { food: { diet_type: 'veg' } },
      ]),
    ).toBe(0.5);
    expect(
      computeDietNonVegDayFraction([{ food: { diet_type: 'mixed' } }]),
    ).toBe(0.5);
  });

  it('templateConditionsMet enforces optional template conditions object', () => {
    const t = tpl({
      task_id: 'cond_test',
      category: 'emission_reduction',
      conditions: { min_avg_distance_km: 20 },
    });
    const ok = templateConditionsMet(
      t,
      baseSignals().behaviorProfile,
      new Set(),
    );
    expect(ok).toBe(false);
  });
});
