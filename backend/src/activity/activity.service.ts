import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model, Types } from 'mongoose';
import { CarbonRecord } from '../schemas/carbon-record.schema';
import { DailyActivityLog } from '../schemas/daily-activity-log.schema';
import { TaskTemplate } from '../schemas/task-template.schema';
import { UserDailyTask } from '../schemas/user-daily-task.schema';
import { UserProfile } from '../schemas/user-profile.schema';
import { User } from '../schemas/user.schema';
import {
  ActivityInput,
  calculateDailyEmission,
  evaluateTaskCompletion,
  getDateStringInTimeZone,
  INDIA_TIME_ZONE,
} from './activity.logic';
import { ActivityEventsService } from './activity-events.service';
import { CreateDailyActivityDto } from './dto/create-daily-activity.dto';
import { EmissionFactorService } from './emission-factor.service';
import {
  addDaysToYmd,
  computeEmissionTrendFromTotals,
  generateDailyTaskSelection,
  type TaskGenerationSignals,
  shouldIncludeWeeklyInput,
} from '../tasks/task-generation.engine';

type TaskStats = UserProfile['task_stats'];
type BehaviorProfile = UserProfile['behavior_profile'];
type PerformanceMetrics = UserProfile['performance_metrics'];

@Injectable()
export class ActivityService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel('CarbonRecord')
    private readonly carbonRecordModel: Model<CarbonRecord>,
    @InjectModel('DailyActivityLog')
    private readonly dailyActivityLogModel: Model<DailyActivityLog>,
    @InjectModel('TaskTemplate')
    private readonly taskTemplateModel: Model<TaskTemplate>,
    @InjectModel('UserDailyTask')
    private readonly userDailyTaskModel: Model<UserDailyTask>,
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('UserProfile')
    private readonly userProfileModel: Model<UserProfile>,
    private readonly activityEventsService: ActivityEventsService,
    private readonly emissionFactorService: EmissionFactorService,
  ) {}

  async submitDailyActivity(
    userId: Types.ObjectId,
    dto: CreateDailyActivityDto,
  ) {
    return this.submitActivity(userId, dto, 'daily');
  }

  async submitWeeklyActivity(
    userId: Types.ObjectId,
    dto: CreateDailyActivityDto,
  ) {
    return this.submitActivity(userId, dto, 'weekly');
  }

  private async submitActivity(
    userId: Types.ObjectId,
    dto: CreateDailyActivityDto,
    submissionType: 'daily' | 'weekly',
  ): Promise<{
    message: string;
    carbon_record: {
      date: string;
      total_emission: number;
      breakdown: {
        transport: number;
        electricity: number;
        food: number;
        waste: number;
      };
    };
    completed_task_ids: string[];
  }> {
    this.validateActivityInput(dto);
    const activityInput = dto as ActivityInput;

    const session = await this.connection.startSession();

    try {
      session.startTransaction();

      const user = await this.userModel.findById(userId).session(session).exec();
      if (!user) {
        throw new InternalServerErrorException({
          error: 'USER_NOT_FOUND',
          message: 'User not found',
        });
      }

      const existingLog = await this.dailyActivityLogModel
        .findOne({
          date: dto.date,
          type: submissionType,
          user_id: userId,
        })
        .session(session)
        .lean()
        .exec();

      if (existingLog) {
        throw new ConflictException({
          error:
            submissionType === 'daily'
              ? 'ALREADY_SUBMITTED'
              : 'WEEKLY_ALREADY_SUBMITTED',
          message:
            submissionType === 'daily'
              ? 'Daily activity already submitted'
              : 'Weekly activity already submitted',
        });
      }

      const userProfile = await this.userProfileModel
        .findOne({ user_id: userId })
        .session(session)
        .exec();

      if (!userProfile) {
        throw new InternalServerErrorException({
          error: 'PROFILE_NOT_FOUND',
          message: 'User profile not found',
        });
      }

      if (
        submissionType === 'weekly' &&
        !shouldIncludeWeeklyInput(
          dto.date,
          getDateStringInTimeZone(user.created_at, INDIA_TIME_ZONE),
        )
      ) {
        throw new BadRequestException({
          error: 'WEEKLY_SUBMISSION_NOT_AVAILABLE',
          message: 'Weekly activity is available only on the documented weekly unlock day',
        });
      }

      await this.ensureGeneratedDailyTasks(
        userId,
        dto.date,
        user,
        userProfile,
        session,
      );

      const now = new Date();
      const activityLog = new this.dailyActivityLogModel({
        created_at: now,
        date: dto.date,
        eco_actions: dto.eco_actions,
        electricity: dto.electricity,
        food: dto.food,
        transport: dto.transport,
        type: submissionType,
        user_id: userId,
        waste: dto.waste,
      });
      await activityLog.save({ session });

      const emissionFactors =
        await this.emissionFactorService.getEmissionFactors();
      const emissionResult = calculateDailyEmission(
        activityInput,
        emissionFactors,
      );

      const carbonRecord = new this.carbonRecordModel({
        breakdown: emissionResult.breakdown,
        created_at: now,
        date: dto.date,
        total_emission: emissionResult.totalEmission,
        user_id: userId,
      });
      await carbonRecord.save({ session });

      const dailyLogs = await this.dailyActivityLogModel
        .find({ type: 'daily', user_id: userId })
        .session(session)
        .lean()
        .exec();
      const carbonRecords = await this.carbonRecordModel
        .find({ user_id: userId })
        .sort({ date: 1 })
        .session(session)
        .lean()
        .exec();

      const nextBehaviorProfile = this.buildBehaviorProfile(dailyLogs);
      const nextPerformanceMetrics = this.buildPerformanceMetrics(
        userProfile.performance_metrics,
        carbonRecords,
      );

      const nextEngagementMetrics =
        submissionType === 'daily'
          ? {
              ...userProfile.engagement_metrics,
              total_days_logged: dailyLogs.length,
            }
          : userProfile.engagement_metrics;
      const profileUpdate: Record<string, unknown> = {
        behavior_profile: nextBehaviorProfile,
        engagement_metrics: nextEngagementMetrics,
        performance_metrics: nextPerformanceMetrics,
        updated_at: now,
      };
      if (submissionType === 'daily') {
        profileUpdate.last_submission_date = dto.date;
      }

      await this.userProfileModel.updateOne(
        { _id: userProfile._id },
        { $set: profileUpdate },
        { session },
      );

      const completedTaskIds = await this.evaluateTasks(
        userId,
        activityInput,
        submissionType,
        emissionResult.totalEmission,
        nextPerformanceMetrics.baseline_emission,
        nextPerformanceMetrics.current_avg_emission,
        getYesterdayEmission(carbonRecords),
        nextBehaviorProfile,
        userProfile.task_stats,
        session,
      );

      await session.commitTransaction();
      this.emitPostCommitEvents(
        userId,
        dto.date,
        emissionResult,
        completedTaskIds,
      );

      return {
        carbon_record: {
          breakdown: emissionResult.breakdown,
          date: dto.date,
          total_emission: emissionResult.totalEmission,
        },
        completed_task_ids: completedTaskIds,
        message:
          submissionType === 'daily'
            ? 'Daily activity submitted successfully'
            : 'Weekly activity submitted successfully',
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  private validateActivityInput(dto: CreateDailyActivityDto): void {
    const today = getDateStringInTimeZone(new Date(), INDIA_TIME_ZONE);

    if (dto.date !== today) {
      throw new BadRequestException({
        error: 'INVALID_SUBMISSION_DATE',
        message: 'Activity submission date must match today',
      });
    }
  }

  private async evaluateTasks(
    userId: Types.ObjectId,
    activity: ActivityInput,
    submissionType: 'daily' | 'weekly',
    latestEmission: number,
    baselineEmission: number,
    currentAverageEmission: number,
    yesterdayEmission: number,
    behaviorProfile: BehaviorProfile,
    existingTaskStats: TaskStats,
    session: ClientSession,
  ): Promise<string[]> {
    const userDailyTask = await this.userDailyTaskModel
      .findOne({ date: activity.date, user_id: userId })
      .session(session)
      .exec();

    if (!userDailyTask) {
      const taskCompletionRate = await this.calculateTaskCompletionRate(
        userId,
        session,
      );
      await this.userProfileModel.updateOne(
        { user_id: userId },
        {
          $set: {
            'engagement_metrics.task_completion_rate': taskCompletionRate,
            updated_at: new Date(),
          },
        },
        { session },
      );
      return [];
    }

    const recentVehicleDistanceAverage =
      await this.calculateRecentVehicleDistanceAverage(
        userId,
        activity.date,
        session,
      );

    const taskTemplates = await this.taskTemplateModel
      .find({
        active: true,
        task_id: { $in: userDailyTask.tasks.map((task) => task.task_id) },
      })
      .session(session)
      .lean()
      .exec();
    const templateMap = new Map(
      taskTemplates.map((template) => [template.task_id, template]),
    );

    const completedTaskIds: string[] = [];
    const nextTaskStats: TaskStats = { ...existingTaskStats };
    let tasksChanged = false;

    for (const task of userDailyTask.tasks) {
      if (task.status === 'completed') {
        continue;
      }

      const template = templateMap.get(task.task_id);
      if (!template) {
        continue;
      }

      const isCompleted = evaluateTaskCompletion(template, {
        submissionType,
        activity,
        baselineEmission,
        currentAverageEmission,
        yesterdayEmission,
        latestEmission,
        profileAverageAcHours: behaviorProfile.avg_ac_hours,
        profileAverageDistance: behaviorProfile.avg_distance,
        recentVehicleDistanceAverage,
      });

      if (!isCompleted) {
        continue;
      }

      task.completed_at = new Date();
      task.status = 'completed';
      tasksChanged = true;
      completedTaskIds.push(task.task_id);

      if (task.category in nextTaskStats) {
        const category = task.category as keyof TaskStats;
        nextTaskStats[category] += 1;
      }
    }

    if (tasksChanged) {
      await userDailyTask.save({ session });
    }

    const taskCompletionRate = await this.calculateTaskCompletionRate(
      userId,
      session,
    );

    await this.userProfileModel.updateOne(
      { user_id: userId },
      {
        $set: {
          'engagement_metrics.task_completion_rate': taskCompletionRate,
          task_stats: nextTaskStats,
          updated_at: new Date(),
        },
      },
      { session },
    );

    return completedTaskIds;
  }

  private async calculateRecentVehicleDistanceAverage(
    userId: Types.ObjectId,
    date: string,
    session: ClientSession,
  ): Promise<number> {
    const recentVehicleLogs = await this.dailyActivityLogModel
      .find({
        date: { $lt: date },
        type: 'daily',
        user_id: userId,
        'transport.mode': { $in: ['bike', 'bus', 'car', 'metro'] },
      })
      .sort({ date: -1 })
      .limit(7)
      .session(session)
      .lean()
      .exec();

    return average(
      recentVehicleLogs.map((log) => log.transport.distance),
    );
  }

  private async ensureGeneratedDailyTasks(
    userId: Types.ObjectId,
    todayYmd: string,
    user: Pick<User, 'created_at'>,
    profile: Pick<UserProfile, 'engagement_metrics' | 'streak_days'>,
    session: ClientSession,
  ): Promise<UserDailyTask> {
    const existing = await this.userDailyTaskModel
      .findOne({ date: todayYmd, user_id: userId })
      .session(session)
      .exec();
    if (existing) {
      return existing;
    }

    const templates = await this.taskTemplateModel
      .find({ active: true })
      .session(session)
      .lean()
      .exec();
    if (templates.length === 0) {
      throw new InternalServerErrorException({
        error: 'TASK_TEMPLATES_EMPTY',
        message: 'Task templates are not configured',
      });
    }

    const yesterdayYmd = addDaysToYmd(todayYmd, -1);
    const [yesterdayDoc, historyDocs, lastSevenLogs, recentCarbonRecords] =
      await Promise.all([
        this.userDailyTaskModel
          .findOne({ date: yesterdayYmd, user_id: userId })
          .session(session)
          .lean()
          .exec(),
        this.userDailyTaskModel
          .find({
            date: { $gte: addDaysToYmd(todayYmd, -120) },
            user_id: userId,
          })
          .session(session)
          .lean()
          .exec(),
        this.dailyActivityLogModel
          .find({ type: 'daily', user_id: userId })
          .sort({ date: -1 })
          .limit(7)
          .session(session)
          .lean()
          .exec(),
        this.carbonRecordModel
          .find({ user_id: userId })
          .sort({ date: -1 })
          .limit(14)
          .session(session)
          .lean()
          .exec(),
      ]);

    const yesterdayTaskIds = new Set(
      (yesterdayDoc?.tasks ?? []).map((task) => task.task_id),
    );
    const lastCompletionYmdByTaskId = this.buildLastCompletionMap(
      historyDocs,
      todayYmd,
    );
    const behaviorProfile = this.buildBehaviorProfile(lastSevenLogs);
    const emissionTrend = computeEmissionTrendFromTotals(
      [...recentCarbonRecords]
        .reverse()
        .map((record) => record.total_emission),
    );

    const selection = generateDailyTaskSelection({
      behaviorProfile,
      emissionTrend,
      lastCompletionYmdByTaskId,
      relaxCooldown: false,
      streakDays: profile.streak_days,
      taskCompletionRate: profile.engagement_metrics.task_completion_rate,
      templates: templates as TaskTemplate[],
      todayYmd,
      userRegisteredYmd: getDateStringInTimeZone(
        user.created_at,
        INDIA_TIME_ZONE,
      ),
      yesterdayTaskIds,
    } satisfies TaskGenerationSignals);

    const createdAt = new Date();
    const doc = new this.userDailyTaskModel({
      created_at: createdAt,
      date: todayYmd,
      tasks: selection.map((row) => ({
        category: row.category,
        completed_at: null,
        completion_type: row.completion_type,
        status: 'pending' as const,
        task_id: row.task_id,
      })),
      user_id: userId,
    });

    try {
      await doc.save({ session });
      return doc;
    } catch (error: unknown) {
      const code =
        error && typeof error === 'object' && 'code' in error
          ? (error as { code?: number | string }).code
          : undefined;
      if (code === 11_000 || code === '11000') {
        const raced = await this.userDailyTaskModel
          .findOne({ date: todayYmd, user_id: userId })
          .session(session)
          .exec();
        if (raced) {
          return raced;
        }
      }
      throw error;
    }
  }

  private buildLastCompletionMap(
    docs: Array<{ date: string; tasks: UserDailyTask['tasks'] }>,
    todayYmd: string,
  ): Map<string, string> {
    const map = new Map<string, string>();
    for (const doc of docs) {
      if (doc.date >= todayYmd) {
        continue;
      }
      for (const task of doc.tasks) {
        if (task.status !== 'completed') {
          continue;
        }
        const previous = map.get(task.task_id);
        if (!previous || doc.date > previous) {
          map.set(task.task_id, doc.date);
        }
      }
    }
    return map;
  }

  private async calculateTaskCompletionRate(
    userId: Types.ObjectId,
    session: ClientSession,
  ): Promise<number> {
    const taskDocuments = await this.userDailyTaskModel
      .find({ user_id: userId })
      .session(session)
      .lean()
      .exec();

    let totalTasks = 0;
    let completedTasks = 0;

    for (const document of taskDocuments) {
      totalTasks += document.tasks.length;
      completedTasks += document.tasks.filter(
        (task) => task.status === 'completed',
      ).length;
    }

    if (totalTasks === 0) {
      return 0;
    }

    return completedTasks / totalTasks;
  }

  private buildBehaviorProfile(
    dailyLogs: Array<
      Pick<
        DailyActivityLog,
        'eco_actions' | 'electricity' | 'food' | 'transport'
      >
    >,
  ): BehaviorProfile {
    const transportModeCounts = new Map<string, number>();

    for (const log of dailyLogs) {
      const currentCount = transportModeCounts.get(log.transport.mode) ?? 0;
      transportModeCounts.set(log.transport.mode, currentCount + 1);
    }

    let avgTransportMode = '';
    let maxCount = -1;
    for (const [mode, count] of transportModeCounts.entries()) {
      if (count > maxCount) {
        avgTransportMode = mode;
        maxCount = count;
      }
    }

    return {
      avg_ac_hours: average(
        dailyLogs.map((log) => log.electricity.ac_hours),
      ),
      avg_distance: average(
        dailyLogs.map((log) => log.transport.distance),
      ),
      avg_energy_usage: average(
        dailyLogs.map((log) => log.electricity.units_consumed),
      ),
      avg_transport_mode: avgTransportMode,
      eco_action_score: average(
        dailyLogs.map((log) => log.eco_actions.length),
      ),
    };
  }

  private buildPerformanceMetrics(
    existingMetrics: PerformanceMetrics,
    carbonRecords: CarbonRecord[],
  ): PerformanceMetrics {
    let baselineEmission = existingMetrics.baseline_emission;
    let baselineStatus = existingMetrics.baseline_status;

    if (baselineStatus !== 'locked' && carbonRecords.length >= 7) {
      baselineEmission = average(
        carbonRecords.slice(0, 7).map((record) => record.total_emission),
      );
      baselineStatus = 'locked';
    }

    const lastThirtyRecords = carbonRecords.slice(-30);
    const currentAverageEmission = average(
      lastThirtyRecords.map((record) => record.total_emission),
    );

    return {
      baseline_emission: baselineEmission,
      baseline_status: baselineStatus,
      current_avg_emission: currentAverageEmission,
      reduction_percent:
        baselineEmission > 0
          ? ((baselineEmission - currentAverageEmission) / baselineEmission) *
            100
          : 0,
    };
  }

  private emitPostCommitEvents(
    userId: Types.ObjectId,
    date: string,
    emissionResult: {
      breakdown: {
        transport: number;
        electricity: number;
        food: number;
        waste: number;
      };
      totalEmission: number;
    },
    completedTaskIds: string[],
  ): void {
    setImmediate(() => {
      try {
        this.activityEventsService.emitTaskEvaluated({
          completedTaskIds,
          date,
          userId: userId.toString(),
        });
        this.activityEventsService.emitEmissionUpdated({
          breakdown: emissionResult.breakdown,
          date,
          totalEmission: emissionResult.totalEmission,
          userId: userId.toString(),
        });
      } catch {
        // Async/event failures must not affect the committed submission.
      }
    });
  }
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getYesterdayEmission(carbonRecords: CarbonRecord[]): number {
  if (carbonRecords.length < 2) {
    return 0;
  }

  return carbonRecords[carbonRecords.length - 2]?.total_emission ?? 0;
}
