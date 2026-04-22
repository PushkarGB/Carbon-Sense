import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model, Types } from 'mongoose';
import { ErrorLogService } from '../resilience/error-log.service';
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
  buildBehaviorProfileFromDailyLogs,
  computeAvgEmission7dFromRecords,
  computeEmissionTrendFromTotals,
  generateDailyTaskSelection,
  mergeBehaviorProfileWithWeeklyInsights,
  shouldIncludeWeeklyInput,
  type PersonalizationBehaviorProfile,
  type TaskGenerationSignals,
} from '../tasks/task-generation.engine';

type TaskStats = UserProfile['task_stats'];
type BehaviorProfile = UserProfile['behavior_profile'];
type PerformanceMetrics = UserProfile['performance_metrics'];
type WeeklyInsights = UserProfile['weekly_insights'];
type EngagementMetrics = UserProfile['engagement_metrics'];
const UNSET_PROFILE_DATE = '1970-01-01';

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
    private readonly errorLogService: ErrorLogService,
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
      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        throw new InternalServerErrorException({
          error: 'USER_NOT_FOUND',
          message: 'User not found',
        });
      }

      const userProfile = await this.userProfileModel
        .findOne({ user_id: userId })
        .exec();

      if (!userProfile) {
        throw new InternalServerErrorException({
          error: 'PROFILE_NOT_FOUND',
          message: 'User profile not found',
        });
      }

      await this.ensureGeneratedDailyTasks(
        userId,
        dto.date,
        user,
        userProfile,
      );

      let emissionResultToEmit: any;
      let completedTaskIdsToEmit: string[] = [];

      const result = await session.withTransaction(async () => {
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

      // Re-fetch userProfile inside transaction to lock it, though not strictly required if we just update
      const lockedUserProfile = await this.userProfileModel
        .findOne({ user_id: userId })
        .session(session)
        .exec();

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
      let emissionResult: ReturnType<typeof calculateDailyEmission>;
      try {
        emissionResult = calculateDailyEmission(activityInput, emissionFactors);
      } catch (error) {
        if (error instanceof HttpException) {
          throw error;
        }
        throw new InternalServerErrorException({
          error: 'EMISSION_CALC_FAILED',
          message: 'Unable to calculate emission',
        });
      }

      const dailyLogs = await this.dailyActivityLogModel
        .find({ type: 'daily', user_id: userId })
        .session(session)
        .lean()
        .exec();
      const weeklyLogs =
        submissionType === 'weekly'
          ? await this.dailyActivityLogModel
              .find({ type: 'weekly', user_id: userId })
              .sort({ date: 1 })
              .session(session)
              .lean()
              .exec()
          : [];

      let carbonRecords: CarbonRecord[] = [];
      if (submissionType === 'daily') {
        const carbonRecord = new this.carbonRecordModel({
          breakdown: emissionResult.breakdown,
          created_at: now,
          date: dto.date,
          total_emission: emissionResult.totalEmission,
          user_id: userId,
        });
        await carbonRecord.save({ session });

        carbonRecords = await this.carbonRecordModel
          .find({ user_id: userId })
          .sort({ date: 1 })
          .session(session)
          .lean()
          .exec();
      }

      const nextBehaviorProfile = this.buildBehaviorProfile(dailyLogs);
      const nextWeeklyInsights =
        submissionType === 'weekly'
          ? this.buildWeeklyInsights(weeklyLogs, emissionFactors)
          : this.getWeeklyInsightsOrDefault(lockedUserProfile!.weekly_insights);
      const nextPerformanceMetrics =
        submissionType === 'daily'
          ? this.buildPerformanceMetrics(
              lockedUserProfile!.performance_metrics,
              carbonRecords,
            )
          : lockedUserProfile!.performance_metrics;

      const nextEngagementMetrics =
        submissionType === 'daily'
          ? {
              ...lockedUserProfile!.engagement_metrics,
              total_days_logged: dailyLogs.length,
            }
          : lockedUserProfile!.engagement_metrics;
      const profileUpdate: Record<string, unknown> = {
        behavior_profile: nextBehaviorProfile,
        engagement_metrics: nextEngagementMetrics,
        performance_metrics: nextPerformanceMetrics,
        weekly_insights: nextWeeklyInsights,
        updated_at: now,
      };
      if (submissionType === 'daily') {
        profileUpdate.last_submission_date = dto.date;

        // Track consecutive daily submissions (decoupled from app-open streak).
        const yesterdayYmd = addDaysToYmd(dto.date, -1);
        if (lockedUserProfile!.last_submission_date === yesterdayYmd) {
          profileUpdate.consecutive_submission_days =
            (lockedUserProfile!.consecutive_submission_days ?? 0) + 1;
        } else {
          profileUpdate.consecutive_submission_days = 1;
        }
      }

      await this.userProfileModel.updateOne(
        { _id: lockedUserProfile!._id },
        { $set: profileUpdate },
        { session },
      );

      let completedTaskIds: string[];
      try {
        completedTaskIds = await this.evaluateTasks(
          userId,
          activityInput,
          submissionType,
          emissionResult.totalEmission,
          nextPerformanceMetrics.baseline_emission,
          nextPerformanceMetrics.current_avg_emission,
          submissionType === 'daily' ? getYesterdayEmission(carbonRecords) : 0,
          nextBehaviorProfile,
          lockedUserProfile!.task_stats,
          lockedUserProfile!.engagement_metrics,
          session,
        );
      } catch (error) {
        if (error instanceof HttpException) {
          throw error;
        }
        throw new InternalServerErrorException({
          error: 'TASK_EVALUATION_FAILED',
          message: 'Unable to evaluate tasks',
        });
      }

      emissionResultToEmit = { breakdown: emissionResult.breakdown, totalEmission: emissionResult.totalEmission };
      completedTaskIdsToEmit = completedTaskIds;

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
    });

    this.emitPostCommitEvents(
      userId,
      dto.date,
      submissionType,
      emissionResultToEmit,
      completedTaskIdsToEmit,
    );

    return result;
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
    existingEngagementMetrics: EngagementMetrics,
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

    const [recentVehicleDistanceAverage, profileAverageWalkDistance] =
      await Promise.all([
        this.calculateRecentVehicleDistanceAverage(
          userId,
          activity.date,
          session,
        ),
        this.calculateRecentWalkDistanceAverage(
          userId,
          activity.date,
          session,
        ),
      ]);

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
    const nextEngagementMetrics: EngagementMetrics = {
      ...existingEngagementMetrics,
    };
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
        profileAverageWalkDistance,
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
      nextEngagementMetrics.total_tasks_completed += 1;
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
          engagement_metrics: {
            ...nextEngagementMetrics,
            task_completion_rate: taskCompletionRate,
          },
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

  /** Prior walk distances (walk mode only) for `transport_walk` baseline. */
  private async calculateRecentWalkDistanceAverage(
    userId: Types.ObjectId,
    date: string,
    session: ClientSession,
  ): Promise<number> {
    const recentWalkLogs = await this.dailyActivityLogModel
      .find({
        date: { $lt: date },
        type: 'daily',
        user_id: userId,
        'transport.mode': 'walk',
      })
      .sort({ date: -1 })
      .limit(7)
      .session(session)
      .lean()
      .exec();

    return average(recentWalkLogs.map((log) => log.transport.distance));
  }

  private async ensureGeneratedDailyTasks(
    userId: Types.ObjectId,
    todayYmd: string,
    user: Pick<User, 'created_at'>,
    profile: Pick<
      UserProfile,
      'engagement_metrics' | 'streak_days' | 'performance_metrics' | 'weekly_insights'
    >,
    session?: ClientSession,
  ): Promise<UserDailyTask> {
    const query = this.userDailyTaskModel.findOne({ date: todayYmd, user_id: userId });
    if (session) {
      query.session(session);
    }
    const existing = await query.exec();
    if (existing) {
      return existing;
    }

    const templateQuery = this.taskTemplateModel.find({ active: true });
    if (session) {
      templateQuery.session(session);
    }
    const templates = await templateQuery.lean().exec();
    if (templates.length === 0) {
      throw new InternalServerErrorException({
        error: 'TASK_TEMPLATES_EMPTY',
        message: 'Task templates are not configured',
      });
    }

    const yesterdayYmd = addDaysToYmd(todayYmd, -1);
    
    let q1 = this.userDailyTaskModel.findOne({ date: yesterdayYmd, user_id: userId });
    let q2 = this.userDailyTaskModel.find({ date: { $gte: addDaysToYmd(todayYmd, -120) }, user_id: userId });
    let q3 = this.dailyActivityLogModel.find({ type: 'daily', user_id: userId }).sort({ date: -1 }).limit(7);
    let q4 = this.carbonRecordModel.find({ user_id: userId }).sort({ date: -1 }).limit(90);

    if (session) {
      q1 = q1.session(session) as any;
      q2 = q2.session(session) as any;
      q3 = q3.session(session) as any;
      q4 = q4.session(session) as any;
    }

    const [yesterdayDoc, historyDocs, lastSevenLogs, recentCarbonRecords] =
      await Promise.all([
        q1.lean().exec(),
        q2.lean().exec(),
        q3.lean().exec(),
        q4.lean().exec(),
      ]);

    const yesterdayTaskIds = new Set(
      (yesterdayDoc?.tasks ?? []).map((task) => task.task_id),
    );
    const lastCompletionYmdByTaskId = this.buildLastCompletionMap(
      historyDocs,
      todayYmd,
    );
    const behaviorProfile = this.buildTaskGenerationBehaviorProfile(
      lastSevenLogs,
      profile.weekly_insights,
    );
    const chronologicalTotals = [...recentCarbonRecords]
      .reverse()
      .map((record) => record.total_emission);
    const emissionTrend = computeEmissionTrendFromTotals(chronologicalTotals);
    const avgEmission7d = computeAvgEmission7dFromRecords(
      recentCarbonRecords,
      todayYmd,
    );

    const selection = generateDailyTaskSelection({
      avgEmission7d,
      baselineEmission: profile.performance_metrics.baseline_emission,
      baselineStatus: profile.performance_metrics.baseline_status,
      behaviorProfile,
      currentAvgEmission: profile.performance_metrics.current_avg_emission,
      emissionHistoryTotals: chronologicalTotals,
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
      if (code === 11_000 || code === '11000' || code === 112 || String(error).includes('WriteConflict') || String(error).includes('TransientTransactionError')) {
        const raceQuery = this.userDailyTaskModel.findOne({ date: todayYmd, user_id: userId });
        if (session) {
          raceQuery.session(session);
        }
        const raced = await raceQuery.exec();
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

  private buildTaskGenerationBehaviorProfile(
    dailyLogs: Array<
      Pick<
        DailyActivityLog,
        'eco_actions' | 'electricity' | 'food' | 'transport'
      >
    >,
    weeklyInsights: WeeklyInsights | undefined,
  ): PersonalizationBehaviorProfile {
    const dailyProfile = buildBehaviorProfileFromDailyLogs(dailyLogs);
    return mergeBehaviorProfileWithWeeklyInsights(
      dailyProfile,
      dailyLogs.length,
      weeklyInsights,
    );
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

  private buildWeeklyInsights(
    weeklyLogs: Array<
      Pick<
        DailyActivityLog,
        'date' | 'eco_actions' | 'electricity' | 'food' | 'transport' | 'waste'
      >
    >,
    emissionFactors: Parameters<typeof calculateDailyEmission>[1],
  ): WeeklyInsights {
    if (weeklyLogs.length === 0) {
      return this.getWeeklyInsightsOrDefault(undefined);
    }

    const behaviorProfile = buildBehaviorProfileFromDailyLogs(weeklyLogs);
    const weeklyEmissions = weeklyLogs.map((log) =>
      calculateDailyEmission(
        {
          date: log.date,
          eco_actions: log.eco_actions,
          electricity: log.electricity,
          food: log.food,
          transport: log.transport,
          waste: log.waste,
        },
        emissionFactors,
      ).totalEmission,
    );
    const latestLog = weeklyLogs[weeklyLogs.length - 1];

    return {
      average_weekly_emission: average(weeklyEmissions),
      avg_ac_hours: behaviorProfile.avg_ac_hours,
      avg_distance: behaviorProfile.avg_distance,
      avg_energy_usage: behaviorProfile.avg_energy_usage,
      avg_transport_mode: behaviorProfile.avg_transport_mode,
      diet_non_veg_day_fraction:
        behaviorProfile.diet_non_veg_day_fraction,
      eco_action_score: behaviorProfile.eco_action_score,
      emission_trend: computeEmissionTrendFromTotals(weeklyEmissions),
      last_weekly_submission_date: latestLog?.date ?? UNSET_PROFILE_DATE,
      latest_weekly_emission:
        weeklyEmissions[weeklyEmissions.length - 1] ?? 0,
      total_weeks_logged: weeklyLogs.length,
    };
  }

  private getWeeklyInsightsOrDefault(
    weeklyInsights: Partial<WeeklyInsights> | undefined,
  ): WeeklyInsights {
    return {
      average_weekly_emission: weeklyInsights?.average_weekly_emission ?? 0,
      avg_ac_hours: weeklyInsights?.avg_ac_hours ?? 0,
      avg_distance: weeklyInsights?.avg_distance ?? 0,
      avg_energy_usage: weeklyInsights?.avg_energy_usage ?? 0,
      avg_transport_mode: weeklyInsights?.avg_transport_mode ?? '',
      diet_non_veg_day_fraction:
        weeklyInsights?.diet_non_veg_day_fraction ?? 0,
      eco_action_score: weeklyInsights?.eco_action_score ?? 0,
      emission_trend: weeklyInsights?.emission_trend ?? 'stable',
      last_weekly_submission_date:
        weeklyInsights?.last_weekly_submission_date ?? UNSET_PROFILE_DATE,
      latest_weekly_emission: weeklyInsights?.latest_weekly_emission ?? 0,
      total_weeks_logged: weeklyInsights?.total_weeks_logged ?? 0,
    };
  }

  private emitPostCommitEvents(
    userId: Types.ObjectId,
    date: string,
    submissionType: 'daily' | 'weekly',
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
        if (submissionType === 'daily') {
          this.activityEventsService.emitEmissionUpdated({
            breakdown: emissionResult.breakdown,
            date,
            totalEmission: emissionResult.totalEmission,
            userId: userId.toString(),
          });
        }
      } catch (error) {
        void this.errorLogService.logFailure({
          type: 'NON_CRITICAL',
          module: 'badge',
          userId,
          message: 'Failed to emit post-commit badge evaluation events',
          payload: {
            completedTaskIds,
            date,
            totalEmission: emissionResult.totalEmission,
          },
          error,
        });
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
