import { InternalServerErrorException } from '@nestjs/common';
import { Types } from 'mongoose';
import { CarbonRecord } from '../schemas/carbon-record.schema';
import { ErrorLogService } from '../resilience/error-log.service';
import { UserProfile } from '../schemas/user-profile.schema';
import { ActivityEventsService } from './activity-events.service';
import { ActivityService } from './activity.service';
import { EmissionFactorService } from './emission-factor.service';

type PersistedModelMock = jest.Mock & {
  find?: jest.Mock;
  findOne?: jest.Mock;
};

describe('ActivityService', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('generates today’s tasks on-demand before evaluating a daily submission', async () => {
    const session = createSession();
    const connection = {
      startSession: jest.fn().mockResolvedValue(session),
    };

    const generatedTaskDocument = {
      date: '2026-04-12',
      save: jest.fn().mockResolvedValue(undefined),
      tasks: [
        {
          category: 'system',
          completed_at: null,
          completion_type: 'auto',
          status: 'pending',
          task_id: 'daily_input',
        },
        {
          category: 'eco_action',
          completed_at: null,
          completion_type: 'manual',
          status: 'pending',
          task_id: 'eco_bag',
        },
        {
          category: 'emission_reduction',
          completed_at: null,
          completion_type: 'auto',
          status: 'pending',
          task_id: 'transport_public',
        },
        {
          category: 'awareness',
          completed_at: null,
          completion_type: 'auto',
          status: 'pending',
          task_id: 'check_aqi',
        },
      ],
      user_id: new Types.ObjectId(),
    };

    const dailyActivityLogModel = createPersistedModel();
    dailyActivityLogModel.findOne = jest.fn().mockReturnValue(createQuery(null));
    dailyActivityLogModel.find = jest
      .fn()
      .mockReturnValueOnce(createQuery([]))
      .mockReturnValueOnce(
        createQuery([
          {
            eco_actions: ['eco_bag'],
            electricity: { ac_hours: 1, units_consumed: 5 },
            food: { diet_type: 'veg', meals_count: 2 },
            transport: { distance: 2, mode: 'walk' },
            waste: { bags_used: 1, segregation: true },
          },
        ]),
      )
      .mockReturnValueOnce(createQuery([]))
      .mockReturnValueOnce(createQuery([]));

    const carbonRecordModel = createPersistedModel();
    carbonRecordModel.find = jest
      .fn()
      .mockReturnValueOnce(createQuery([]))
      .mockReturnValueOnce(createQuery([createCarbonRecord('2026-04-12', 7)]));

    const userDailyTaskModelCtor = createPersistedModel();
    const userDailyTaskModel = userDailyTaskModelCtor as typeof userDailyTaskModelCtor & {
      find: jest.Mock;
      findOne: jest.Mock;
    };
    userDailyTaskModel.findOne = jest
      .fn()
      .mockReturnValueOnce(createQuery(null))
      .mockReturnValueOnce(createQuery(null))
      .mockReturnValueOnce(createQuery(generatedTaskDocument));
    userDailyTaskModel.find = jest
      .fn()
      .mockReturnValueOnce(createQuery([]))
      .mockReturnValueOnce(createQuery([generatedTaskDocument]));

    const userModel = {
      findById: jest.fn().mockReturnValue(createQuery(createUser())),
    };
    const userProfileModel = {
      findOne: jest.fn().mockReturnValue(createQuery(createUserProfile())),
      updateOne: jest.fn().mockResolvedValue(undefined),
    };
    const taskTemplateModel = {
      find: jest
        .fn()
        .mockReturnValueOnce(createQuery(createTaskTemplates()))
        .mockReturnValueOnce(
          createQuery([
            createTaskTemplate({
              category: 'system',
              completion_type: 'auto',
              task_id: 'daily_input',
            }),
            createTaskTemplate({
              category: 'emission_reduction',
              completion_type: 'auto',
              task_id: 'transport_public',
            }),
            createTaskTemplate({
              category: 'awareness',
              completion_type: 'auto',
              task_id: 'check_aqi',
            }),
          ]),
        ),
    };
    const activityEventsService = createActivityEventsService();
    const emissionFactorService = {
      getEmissionFactors: jest.fn().mockResolvedValue({
        electricity: 0.71,
        transport_bike: 0.02,
        transport_bus: 0.08,
        transport_car: 0.12,
        transport_metro: 0.03,
        transport_walk: 0,
      }),
    };
    const errorLogService = {
      logFailure: jest.fn(),
    };

    const service = new ActivityService(
      connection as never,
      carbonRecordModel as never,
      dailyActivityLogModel as never,
      taskTemplateModel as never,
      userDailyTaskModel as never,
      userModel as never,
      userProfileModel as never,
      activityEventsService as unknown as ActivityEventsService,
      emissionFactorService as unknown as EmissionFactorService,
      errorLogService as unknown as ErrorLogService,
    );

    const response = await service.submitDailyActivity(
      new Types.ObjectId(),
      createActivityDto(),
    );

    expect(response.completed_task_ids).toContain('daily_input');
    expect(userDailyTaskModelCtor).toHaveBeenCalledTimes(1);
    expect(generatedTaskDocument.save).toHaveBeenCalledTimes(1);
  });

  it('aborts the transaction and rolls back when factor fetch fails', async () => {
    const session = createSession();
    const connection = {
      startSession: jest.fn().mockResolvedValue(session),
    };
    const dailyActivityLogModel = createPersistedModel();
    dailyActivityLogModel.findOne = jest.fn().mockReturnValue(
      createQuery(null),
    );
    dailyActivityLogModel.find = jest
      .fn()
      .mockReturnValueOnce(createQuery([]));
    const carbonRecordModel = createPersistedModel();
    const userModel = {
      findById: jest.fn().mockReturnValue(createQuery(createUser())),
    };
    const userProfileModel = {
      findOne: jest.fn().mockReturnValue(createQuery(createUserProfile())),
      updateOne: jest.fn(),
    };
    const taskTemplateModel = { find: jest.fn() };
    const userDailyTaskModel = {
      find: jest.fn(),
      findOne: jest.fn().mockReturnValue(
        createQuery({
          date: '2026-04-12',
          tasks: [],
          user_id: new Types.ObjectId(),
        }),
      ),
    };
    const activityEventsService = createActivityEventsService();
    const emissionFactorService = {
      getEmissionFactors: jest.fn().mockRejectedValue(
        new InternalServerErrorException({
          error: 'EMISSION_FACTOR_FETCH_FAILED',
        }),
      ),
    };
    const errorLogService = {
      logFailure: jest.fn(),
    };

    const service = new ActivityService(
      connection as never,
      carbonRecordModel as never,
      dailyActivityLogModel as never,
      taskTemplateModel as never,
      userDailyTaskModel as never,
      userModel as never,
      userProfileModel as never,
      activityEventsService as unknown as ActivityEventsService,
      emissionFactorService as unknown as EmissionFactorService,
      errorLogService as unknown as ErrorLogService,
    );

    await expect(
      service.submitDailyActivity(new Types.ObjectId(), createActivityDto()),
    ).rejects.toMatchObject({
      response: {
        error: 'EMISSION_FACTOR_FETCH_FAILED',
      },
    });

    expect(session.startTransaction).toHaveBeenCalledTimes(1);
    expect(session.abortTransaction).toHaveBeenCalledTimes(1);
    expect(session.commitTransaction).not.toHaveBeenCalled();
    expect(carbonRecordModel).not.toHaveBeenCalled();
    expect(activityEventsService.emitTaskEvaluated).not.toHaveBeenCalled();
    expect(activityEventsService.emitEmissionUpdated).not.toHaveBeenCalled();
  });

  it('emits post-commit events only after the transaction commits', async () => {
    jest.useFakeTimers();

    const session = createSession();
    const connection = {
      startSession: jest.fn().mockResolvedValue(session),
    };
    const dailyLogsAfterSave = [
      {
        eco_actions: ['eco_bag'],
        electricity: { ac_hours: 1, units_consumed: 5 },
        food: { diet_type: 'veg', meals_count: 2 },
        transport: { distance: 2, mode: 'walk' },
      },
    ];
    const carbonRecordsAfterSave: CarbonRecord[] = [
      createCarbonRecord('2026-04-11', 8),
      createCarbonRecord('2026-04-12', 7),
    ];

    const dailyActivityLogModel = createPersistedModel();
    dailyActivityLogModel.findOne = jest.fn().mockReturnValue(
      createQuery(null),
    );
    dailyActivityLogModel.find = jest
      .fn()
      .mockReturnValueOnce(createQuery([]))
      .mockReturnValueOnce(createQuery(dailyLogsAfterSave))
      .mockReturnValueOnce(createQuery([]))
      .mockReturnValueOnce(createQuery([]));

    const carbonRecordModel = createPersistedModel();
    carbonRecordModel.find = jest.fn().mockReturnValue(
      createQuery(carbonRecordsAfterSave),
    );
    const userModel = {
      findById: jest.fn().mockReturnValue(createQuery(createUser())),
    };

    const userDailyTaskDocument = {
      date: '2026-04-12',
      save: jest.fn().mockResolvedValue(undefined),
      tasks: [
        {
          category: 'emission_reduction',
          completed_at: null,
          completion_type: 'auto',
          status: 'pending',
          task_id: 'beat_yesterday',
        },
      ],
      user_id: new Types.ObjectId(),
    };
    const userDailyTaskModel = {
      find: jest.fn().mockReturnValue(
        createQuery([
          {
            tasks: [{ status: 'completed' }],
          },
        ]),
      ),
      findOne: jest.fn().mockReturnValue(createQuery(userDailyTaskDocument)),
    };
    const userProfile = createUserProfile();
    const userProfileModel = {
      findOne: jest.fn().mockReturnValue(createQuery(userProfile)),
      updateOne: jest.fn().mockResolvedValue(undefined),
    };
    const taskTemplateModel = {
      find: jest.fn().mockReturnValue(
        createQuery([
          {
            active: true,
            category: 'emission_reduction',
            completion_type: 'auto',
            task_id: 'beat_yesterday',
          },
        ]),
      ),
    };
    const activityEventsService = createActivityEventsService();
    const emissionFactorService = {
      getEmissionFactors: jest.fn().mockResolvedValue({
        electricity: 0.71,
        transport_bike: 0.02,
        transport_bus: 0.08,
        transport_car: 0.12,
        transport_metro: 0.03,
        transport_walk: 0,
      }),
    };
    const errorLogService = {
      logFailure: jest.fn(),
    };

    const service = new ActivityService(
      connection as never,
      carbonRecordModel as never,
      dailyActivityLogModel as never,
      taskTemplateModel as never,
      userDailyTaskModel as never,
      userModel as never,
      userProfileModel as never,
      activityEventsService as unknown as ActivityEventsService,
      emissionFactorService as unknown as EmissionFactorService,
      errorLogService as unknown as ErrorLogService,
    );

    const response = await service.submitDailyActivity(
      new Types.ObjectId(),
      createActivityDto(),
    );

    expect(response.completed_task_ids).toEqual(['beat_yesterday']);
    expect(session.commitTransaction).toHaveBeenCalledTimes(1);
    expect(activityEventsService.emitTaskEvaluated).not.toHaveBeenCalled();
    expect(activityEventsService.emitEmissionUpdated).not.toHaveBeenCalled();

    jest.runAllTimers();

    expect(activityEventsService.emitTaskEvaluated).toHaveBeenCalledTimes(1);
    expect(activityEventsService.emitEmissionUpdated).toHaveBeenCalledTimes(1);
    expect(
      session.commitTransaction.mock.invocationCallOrder[0],
    ).toBeLessThan(
      activityEventsService.emitTaskEvaluated.mock.invocationCallOrder[0],
    );
    expect(
      session.commitTransaction.mock.invocationCallOrder[0],
    ).toBeLessThan(
      activityEventsService.emitEmissionUpdated.mock.invocationCallOrder[0],
    );
  });

  it('completes weekly_input on the documented weekly submission day', async () => {
    jest.useFakeTimers();

    const session = createSession();
    const connection = {
      startSession: jest.fn().mockResolvedValue(session),
    };
    const dailyActivityLogModel = createPersistedModel();
    dailyActivityLogModel.findOne = jest.fn().mockReturnValue(createQuery(null));
    dailyActivityLogModel.find = jest
      .fn()
      .mockReturnValueOnce(createQuery([]))
      .mockReturnValueOnce(
        createQuery([
          {
            date: '2026-04-12',
            eco_actions: ['eco_bag'],
            electricity: { ac_hours: 1, units_consumed: 5 },
            food: { diet_type: 'veg', meals_count: 2 },
            transport: { distance: 2, mode: 'walk' },
            waste: { bags_used: 1, segregation: true },
          },
        ]),
      )
      .mockReturnValueOnce(createQuery([]))
      .mockReturnValueOnce(createQuery([]));

    const carbonRecordModel = createPersistedModel();
    carbonRecordModel.find = jest.fn().mockReturnValue(
      createQuery([createCarbonRecord('2026-04-12', 6)]),
    );

    const weeklyTaskDocument = {
      date: '2026-04-12',
      save: jest.fn().mockResolvedValue(undefined),
      tasks: [
        {
          category: 'system',
          completed_at: null,
          completion_type: 'auto',
          status: 'pending',
          task_id: 'weekly_input',
        },
      ],
      user_id: new Types.ObjectId(),
    };
    const userDailyTaskModel = {
      find: jest.fn().mockReturnValue(createQuery([weeklyTaskDocument])),
      findOne: jest.fn().mockReturnValue(createQuery(weeklyTaskDocument)),
    };
    const userModel = {
      findById: jest.fn().mockReturnValue(
        createQuery(createUser('2026-04-05T00:00:00.000Z')),
      ),
    };
    const userProfileModel = {
      findOne: jest.fn().mockReturnValue(createQuery(createUserProfile())),
      updateOne: jest.fn().mockResolvedValue(undefined),
    };
    const taskTemplateModel = {
      find: jest.fn().mockReturnValue(
        createQuery([
          createTaskTemplate({
            category: 'system',
            completion_type: 'auto',
            evaluation_logic: 'weekly_submission_exists',
            task_id: 'weekly_input',
          }),
        ]),
      ),
    };
    const activityEventsService = createActivityEventsService();
    const emissionFactorService = {
      getEmissionFactors: jest.fn().mockResolvedValue({
        electricity: 0.71,
        transport_bike: 0.02,
        transport_bus: 0.08,
        transport_car: 0.12,
        transport_metro: 0.03,
        transport_walk: 0,
      }),
    };
    const errorLogService = {
      logFailure: jest.fn(),
    };

    const service = new ActivityService(
      connection as never,
      carbonRecordModel as never,
      dailyActivityLogModel as never,
      taskTemplateModel as never,
      userDailyTaskModel as never,
      userModel as never,
      userProfileModel as never,
      activityEventsService as unknown as ActivityEventsService,
      emissionFactorService as unknown as EmissionFactorService,
      errorLogService as unknown as ErrorLogService,
    );

    const response = await service.submitWeeklyActivity(
      new Types.ObjectId(),
      createActivityDto(),
    );

    expect(response.completed_task_ids).toEqual(['weekly_input']);
    expect(response.message).toBe('Weekly activity submitted successfully');
    expect(weeklyTaskDocument.save).toHaveBeenCalledTimes(1);
    expect(carbonRecordModel).not.toHaveBeenCalled();
    expect(
      userProfileModel.updateOne.mock.calls.some((call) => {
        const payload = call[1] as {
          $set?: {
            performance_metrics?: unknown;
            weekly_insights?: { total_weeks_logged?: number };
          };
        };
        return (
          JSON.stringify(payload?.$set?.performance_metrics) ===
            JSON.stringify(createUserProfile().performance_metrics) &&
          payload?.$set?.weekly_insights?.total_weeks_logged === 1
        );
      }),
    ).toBe(true);

    jest.runAllTimers();

    expect(activityEventsService.emitTaskEvaluated).toHaveBeenCalledTimes(1);
    expect(activityEventsService.emitEmissionUpdated).not.toHaveBeenCalled();
  });
});

function createSession() {
  return {
    abortTransaction: jest.fn().mockResolvedValue(undefined),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    endSession: jest.fn().mockResolvedValue(undefined),
    startTransaction: jest.fn(),
  };
}

function createPersistedModel(): PersistedModelMock {
  return jest.fn().mockImplementation(function PersistedModel(
    this: Record<string, unknown>,
    payload: Record<string, unknown>,
  ) {
    Object.assign(this, payload);
    this.save = jest.fn().mockResolvedValue(this);
  }) as PersistedModelMock;
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

function createActivityEventsService() {
  return {
    emitEmissionUpdated: jest.fn(),
    emitTaskEvaluated: jest.fn(),
  };
}

function createActivityDto() {
  return {
    date: '2026-04-12',
    eco_actions: ['eco_bag'],
    electricity: {
      ac_hours: 1,
      units_consumed: 5,
    },
    food: {
      diet_type: 'veg' as const,
      meals_count: 2,
    },
    transport: {
      distance: 2,
      mode: 'walk' as const,
    },
    waste: {
      bags_used: 1,
      segregation: true,
    },
  };
}

function createUserProfile(): UserProfile {
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
      emission_trend: 'stable',
      last_weekly_submission_date: '1970-01-01',
      latest_weekly_emission: 0,
      total_weeks_logged: 0,
    },
    last_streak_update: '1970-01-01',
    last_submission_date: '1970-01-01',
    onboarding_completed: true,
    performance_metrics: {
      baseline_emission: 0,
      baseline_status: 'pending',
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

function createUser(createdAt = '2026-04-01T00:00:00.000Z') {
  return {
    _id: new Types.ObjectId(),
    city: 'Kolkata',
    created_at: new Date(createdAt),
    email: 'user@example.com',
    name: 'Carbon User',
    password_hash: 'hash',
    profile_picture_url: 'https://example.com/avatar.png',
    role: 'student' as const,
    updated_at: new Date(createdAt),
  };
}

function createTaskTemplates() {
  return [
    createTaskTemplate({
      category: 'system',
      completion_type: 'auto',
      evaluation_logic: 'daily_submission_exists',
      priority: 1,
      task_id: 'daily_input',
    }),
    createTaskTemplate({
      category: 'system',
      completion_type: 'auto',
      evaluation_logic: 'weekly_submission_exists',
      priority: 1,
      task_id: 'weekly_input',
    }),
    createTaskTemplate({
      cooldown_days: 2,
      task_id: 'eco_bag',
    }),
    createTaskTemplate({
      category: 'emission_reduction',
      completion_type: 'auto',
      evaluation_logic: 'transport_mode == public',
      priority: 5,
      task_id: 'transport_public',
    }),
    createTaskTemplate({
      category: 'awareness',
      completion_type: 'auto',
      evaluation_logic: 'aqi_screen_viewed',
      priority: 1,
      task_id: 'check_aqi',
    }),
  ];
}

function createTaskTemplate(
  partial: Partial<{
    active: boolean;
    category: 'system' | 'eco_action' | 'emission_reduction' | 'awareness';
    completion_type: 'auto' | 'manual' | 'hybrid';
    conditions: Record<string, unknown>;
    cooldown_days: number;
    description: string;
    evaluation_logic: string | null;
    priority: number;
    task_id: string;
    title: string;
  }> &
    {
      task_id: string;
    },
) {
  return {
    active: true,
    category: 'eco_action' as const,
    completion_type: 'manual' as const,
    conditions: {},
    cooldown_days: 0,
    description: 'Task description',
    evaluation_logic: null,
    priority: 2,
    title: 'Task title',
    ...partial,
  };
}

function createCarbonRecord(date: string, totalEmission: number): CarbonRecord {
  return {
    breakdown: {
      electricity: 3.55,
      food: 3,
      transport: 0,
      waste: 0.5,
    },
    created_at: new Date(`${date}T00:00:00.000Z`),
    date,
    total_emission: totalEmission,
    user_id: new Types.ObjectId(),
  };
}
