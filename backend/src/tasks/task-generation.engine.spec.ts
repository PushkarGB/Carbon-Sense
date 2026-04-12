import { TaskTemplate } from '../schemas/task-template.schema';
import {
  addDaysToYmd,
  daysBetweenYmd,
  generateDailyTaskSelection,
  isTaskCoolingDown,
  shouldIncludeWeeklyInput,
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
    behaviorProfile: {
      avg_ac_hours: 0,
      avg_distance: 10,
      avg_energy_usage: 5,
      avg_transport_mode: 'car',
      eco_action_score: 0.5,
    },
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
});
