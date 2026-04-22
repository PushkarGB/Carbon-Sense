import { Types } from 'mongoose';
import { ErrorLogService } from '../resilience/error-log.service';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-04-12T06:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('rejects manual confirmation for hybrid tasks before the daily submission exists', async () => {
    const session = createSession();
    const service = createTasksService({
      connection: {
        startSession: jest.fn().mockResolvedValue(session),
      },
      dailyActivityLogModel: {
        findOne: jest.fn().mockReturnValue(createQuery(null)),
        find: jest.fn(),
      },
      taskTemplateModel: {
        findOne: jest.fn().mockReturnValue(
          createQuery({
            active: true,
            category: 'emission_reduction',
            completion_type: 'hybrid',
            task_id: 'ac_reduce',
          }),
        ),
      },
      userDailyTaskModel: {
        findOne: jest.fn().mockReturnValue(
          createQuery(createUserDailyTaskDocument('ac_reduce', 'hybrid')),
        ),
      },
      userProfileModel: {
        findOne: jest.fn().mockReturnValue(createQuery(createUserProfile())),
      },
    });

    await expect(
      service.completeTask(new Types.ObjectId(), { task_id: 'ac_reduce' }),
    ).rejects.toMatchObject({
      response: {
        error: 'HYBRID_CONFIRMATION_REQUIRES_DAILY_SUBMISSION',
      },
    });
  });

  it('rejects hybrid confirmation when the daily submission does not satisfy the task condition', async () => {
    const session = createSession();
    const service = createTasksService({
      connection: {
        startSession: jest.fn().mockResolvedValue(session),
      },
      dailyActivityLogModel: {
        findOne: jest.fn().mockReturnValue(
          createQuery({
            date: '2026-04-12',
            eco_actions: [],
            electricity: { ac_hours: 5, units_consumed: 4 },
            food: { diet_type: 'veg', meals_count: 2 },
            transport: { distance: 5, mode: 'walk' },
            waste: { bags_used: 1, segregation: true },
          }),
        ),
        find: jest.fn().mockReturnValue(createQuery([])),
      },
      taskTemplateModel: {
        findOne: jest.fn().mockReturnValue(
          createQuery({
            active: true,
            category: 'emission_reduction',
            completion_type: 'hybrid',
            task_id: 'ac_reduce',
          }),
        ),
      },
      userDailyTaskModel: {
        findOne: jest.fn().mockReturnValue(
          createQuery(createUserDailyTaskDocument('ac_reduce', 'hybrid')),
        ),
      },
      userProfileModel: {
        findOne: jest.fn().mockReturnValue(createQuery(createUserProfile())),
      },
    });

    await expect(
      service.completeTask(new Types.ObjectId(), { task_id: 'ac_reduce' }),
    ).rejects.toMatchObject({
      response: {
        error: 'HYBRID_TASK_NOT_ELIGIBLE',
      },
    });
  });
});

function createTasksService(overrides: Partial<Record<string, unknown>>) {
  return new TasksService(
    (overrides.connection ?? {
      startSession: jest.fn().mockResolvedValue(createSession()),
    }) as never,
    ((overrides.userModel ?? {}) as never),
    ((overrides.userProfileModel ?? {
      findOne: jest.fn().mockReturnValue(createQuery(createUserProfile())),
      updateOne: jest.fn(),
    }) as never),
    ((overrides.taskTemplateModel ?? {
      findOne: jest.fn(),
      find: jest.fn(),
    }) as never),
    ((overrides.userDailyTaskModel ?? {
      find: jest.fn(),
      findOne: jest.fn(),
    }) as never),
    ((overrides.dailyActivityLogModel ?? {
      find: jest.fn(),
      findOne: jest.fn(),
    }) as never),
    ((overrides.carbonRecordModel ?? {
      find: jest.fn(),
    }) as never),
    ((overrides.activityEventsService ?? {
      emitTaskEvaluated: jest.fn(),
    }) as never),
    ((overrides.errorLogService ?? {
      logFailure: jest.fn(),
    }) as unknown as ErrorLogService),
    (overrides.taskQueue as never) ?? undefined,
  );
}

function createSession() {
  return {
    abortTransaction: jest.fn().mockResolvedValue(undefined),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    endSession: jest.fn().mockResolvedValue(undefined),
    startTransaction: jest.fn(),
  };
}

function createQuery<T>(value: T) {
  return {
    exec: jest.fn().mockResolvedValue(value),
    lean: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    session: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
  };
}

function createUserDailyTaskDocument(
  taskId: string,
  completionType: 'auto' | 'manual' | 'hybrid',
) {
  return {
    date: '2026-04-12',
    save: jest.fn().mockResolvedValue(undefined),
    tasks: [
      {
        category: 'emission_reduction',
        completed_at: null,
        completion_type: completionType,
        status: 'pending',
        task_id: taskId,
      },
    ],
    user_id: new Types.ObjectId(),
  };
}

function createUserProfile() {
  return {
    behavior_profile: {
      avg_ac_hours: 3,
      avg_distance: 5,
      avg_energy_usage: 4,
      avg_transport_mode: 'bus',
      eco_action_score: 1,
    },
    created_at: new Date('2026-04-01T00:00:00.000Z'),
    engagement_metrics: {
      app_open_count: 0,
      task_completion_rate: 0,
      total_tasks_completed: 0,
      total_days_logged: 1,
    },
    weekly_insights: {
      average_weekly_emission: 0,
      avg_ac_hours: 0,
      avg_distance: 0,
      avg_energy_usage: 0,
      avg_transport_mode: '',
      diet_non_veg_day_fraction: 0,
      eco_action_score: 0,
      emission_trend: 'stable' as const,
      last_weekly_submission_date: '1970-01-01',
      latest_weekly_emission: 0,
      total_weeks_logged: 0,
    },
    last_streak_update: '1970-01-01',
    last_submission_date: '2026-04-12',
    onboarding_completed: true,
    performance_metrics: {
      baseline_emission: 0,
      baseline_status: 'pending' as const,
      current_avg_emission: 0,
      reduction_percent: 0,
    },
    streak_days: 0,
    task_stats: {
      awareness: 0,
      eco_action: 0,
      emission_reduction: 0,
    },
    updated_at: new Date('2026-04-01T00:00:00.000Z'),
    user_id: new Types.ObjectId(),
  };
}
