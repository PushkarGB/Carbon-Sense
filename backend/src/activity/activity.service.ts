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
    @InjectModel('UserProfile')
    private readonly userProfileModel: Model<UserProfile>,
    private readonly activityEventsService: ActivityEventsService,
    private readonly emissionFactorService: EmissionFactorService,
  ) {}

  async submitDailyActivity(
    userId: Types.ObjectId,
    dto: CreateDailyActivityDto,
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
    this.validateDailyInput(dto);
    const activityInput = dto as ActivityInput;

    const session = await this.connection.startSession();

    try {
      session.startTransaction();

      const existingLog = await this.dailyActivityLogModel
        .findOne({
          date: dto.date,
          type: 'daily',
          user_id: userId,
        })
        .session(session)
        .lean()
        .exec();

      if (existingLog) {
        throw new ConflictException({
          error: 'ALREADY_SUBMITTED',
          message: 'Daily activity already submitted',
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

      const now = new Date();
      const activityLog = new this.dailyActivityLogModel({
        created_at: now,
        date: dto.date,
        eco_actions: dto.eco_actions,
        electricity: dto.electricity,
        food: dto.food,
        transport: dto.transport,
        type: 'daily',
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

      await this.userProfileModel.updateOne(
        { _id: userProfile._id },
        {
          $set: {
            behavior_profile: nextBehaviorProfile,
            engagement_metrics: {
              ...userProfile.engagement_metrics,
              total_days_logged: dailyLogs.length,
            },
            last_submission_date: dto.date,
            performance_metrics: nextPerformanceMetrics,
            updated_at: now,
          },
        },
        { session },
      );

      const completedTaskIds = await this.evaluateTasks(
        userId,
        activityInput,
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
        message: 'Daily activity submitted successfully',
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  private validateDailyInput(dto: CreateDailyActivityDto): void {
    const today = getDateStringInTimeZone(new Date(), INDIA_TIME_ZONE);

    if (dto.date !== today) {
      throw new BadRequestException({
        error: 'INVALID_SUBMISSION_DATE',
        message: 'Daily activity date must match today',
      });
    }
  }

  private async evaluateTasks(
    userId: Types.ObjectId,
    activity: ActivityInput,
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
