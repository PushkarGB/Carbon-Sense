import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model, Types } from 'mongoose';
import { ActivityEventsService } from '../activity/activity-events.service';
import {
  getDateStringInTimeZone,
  INDIA_TIME_ZONE,
} from '../activity/activity.logic';
import { CarbonRecord } from '../schemas/carbon-record.schema';
import { DailyActivityLog } from '../schemas/daily-activity-log.schema';
import { TaskTemplate } from '../schemas/task-template.schema';
import { UserDailyTask } from '../schemas/user-daily-task.schema';
import { UserProfile } from '../schemas/user-profile.schema';
import { User } from '../schemas/user.schema';
import {
  evaluateAwarenessTaskCompletion,
  type AwarenessEvaluationSignals,
} from './awareness-task.logic';
import { CompleteTaskDto } from './dto/complete-task.dto';
import { EvaluateTasksDto } from './dto/evaluate-tasks.dto';
import {
  addDaysToYmd,
  computeEmissionTrendFromTotals,
  generateDailyTaskSelection,
  type TaskGenerationSignals,
} from './task-generation.engine';

type TaskStats = UserProfile['task_stats'];

@Injectable()
export class TasksService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('UserProfile') private readonly userProfileModel: Model<UserProfile>,
    @InjectModel('TaskTemplate') private readonly taskTemplateModel: Model<TaskTemplate>,
    @InjectModel('UserDailyTask') private readonly userDailyTaskModel: Model<UserDailyTask>,
    @InjectModel('DailyActivityLog')
    private readonly dailyActivityLogModel: Model<DailyActivityLog>,
    @InjectModel('CarbonRecord')
    private readonly carbonRecordModel: Model<CarbonRecord>,
    private readonly activityEventsService: ActivityEventsService,
  ) {}

  async getTodayTasks(userId: Types.ObjectId) {
    const todayYmd = getDateStringInTimeZone(new Date(), INDIA_TIME_ZONE);
    const existing = await this.userDailyTaskModel
      .findOne({ date: todayYmd, user_id: userId })
      .lean()
      .exec();

    if (existing) {
      return this.buildTodayResponse(todayYmd, existing.tasks);
    }

    const doc = await this.ensureGeneratedDailyTasks(userId, todayYmd);
    return this.buildTodayResponse(todayYmd, doc.tasks);
  }

  async completeTask(userId: Types.ObjectId, dto: CompleteTaskDto) {
    const now = new Date();
    const todayYmd = getDateStringInTimeZone(now, INDIA_TIME_ZONE);

    const session = await this.connection.startSession();
    let completedTaskIds: string[] = [];

    try {
      session.startTransaction();

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

      const userDailyTask = await this.userDailyTaskModel
        .findOne({ date: todayYmd, user_id: userId })
        .session(session)
        .exec();

      if (!userDailyTask) {
        throw new NotFoundException({
          error: 'DAILY_TASKS_NOT_FOUND',
          message: 'No tasks for today; open tasks first',
        });
      }

      if (this.isTaskDateExpired(userDailyTask.date, now)) {
        throw new BadRequestException({
          error: 'TASK_EXPIRED',
          message: 'Tasks expire at end of day and cannot be completed later',
        });
      }

      const task = userDailyTask.tasks.find((t) => t.task_id === dto.task_id);
      if (!task) {
        throw new NotFoundException({
          error: 'TASK_NOT_FOUND',
          message: 'Task is not part of today’s set',
        });
      }

      if (task.status === 'completed') {
        throw new ConflictException({
          error: 'TASK_ALREADY_COMPLETED',
          message: 'Task already completed',
        });
      }

      if (task.completion_type === 'auto') {
        throw new BadRequestException({
          error: 'MANUAL_COMPLETION_NOT_ALLOWED',
          message: 'Auto-evaluated tasks cannot be completed via this endpoint',
        });
      }

      const template = await this.taskTemplateModel
        .findOne({ active: true, task_id: task.task_id })
        .session(session)
        .lean()
        .exec();

      if (!template) {
        throw new InternalServerErrorException({
          error: 'TASK_TEMPLATE_NOT_FOUND',
          message: 'Task template missing',
        });
      }

      task.status = 'completed';
      task.completed_at = now;
      await userDailyTask.save({ session });

      const nextTaskStats: TaskStats = { ...userProfile.task_stats };
      if (task.category in nextTaskStats) {
        const category = task.category as keyof TaskStats;
        nextTaskStats[category] += 1;
      }

      const taskCompletionRate = await this.calculateTaskCompletionRate(
        userId,
        session,
      );

      await this.userProfileModel.updateOne(
        { _id: userProfile._id },
        {
          $set: {
            'engagement_metrics.task_completion_rate': taskCompletionRate,
            task_stats: nextTaskStats,
            updated_at: now,
          },
        },
        { session },
      );

      await session.commitTransaction();
      completedTaskIds = [dto.task_id];
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }

    if (completedTaskIds.length > 0) {
      this.emitTaskEvaluatedSafe(userId, todayYmd, completedTaskIds);
    }

    return {
      message: 'Task completed',
      task_id: dto.task_id,
      completed_task_ids: completedTaskIds,
    };
  }

  async evaluateTasks(userId: Types.ObjectId, dto: EvaluateTasksDto) {
    const now = new Date();
    const todayYmd = getDateStringInTimeZone(now, INDIA_TIME_ZONE);

    const signals: AwarenessEvaluationSignals = dto.signals ?? {};
    const hasPositiveSignal = Object.values(signals).some((v) => v === true);
    if (dto.task_id === undefined && !hasPositiveSignal) {
      throw new BadRequestException({
        error: 'EVALUATION_INPUT_REQUIRED',
        message: 'Provide task_id and/or at least one awareness signal set to true',
      });
    }

    const session = await this.connection.startSession();
    let completedTaskIds: string[] = [];

    try {
      session.startTransaction();

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

      const userDailyTask = await this.userDailyTaskModel
        .findOne({ date: todayYmd, user_id: userId })
        .session(session)
        .exec();

      if (!userDailyTask) {
        throw new NotFoundException({
          error: 'DAILY_TASKS_NOT_FOUND',
          message: 'No tasks for today; open tasks first',
        });
      }

      if (this.isTaskDateExpired(userDailyTask.date, now)) {
        throw new BadRequestException({
          error: 'TASK_EXPIRED',
          message: 'Tasks expire at end of day and cannot be completed later',
        });
      }

      const templates = await this.taskTemplateModel
        .find({
          active: true,
          task_id: { $in: userDailyTask.tasks.map((t) => t.task_id) },
        })
        .session(session)
        .lean()
        .exec();
      const templateMap = new Map(
        templates.map((template) => [template.task_id, template]),
      );

      const nextTaskStats: TaskStats = { ...userProfile.task_stats };
      let tasksChanged = false;

      for (const task of userDailyTask.tasks) {
        if (task.status === 'completed') {
          continue;
        }
        if (dto.task_id !== undefined && task.task_id !== dto.task_id) {
          continue;
        }

        const template = templateMap.get(task.task_id);
        if (!template) {
          continue;
        }

        if (
          !evaluateAwarenessTaskCompletion(template, signals)
        ) {
          continue;
        }

        task.status = 'completed';
        task.completed_at = now;
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
        { _id: userProfile._id },
        {
          $set: {
            'engagement_metrics.task_completion_rate': taskCompletionRate,
            task_stats: nextTaskStats,
            updated_at: now,
          },
        },
        { session },
      );

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }

    if (completedTaskIds.length > 0) {
      this.emitTaskEvaluatedSafe(userId, todayYmd, completedTaskIds);
    }

    return {
      message: 'Evaluation applied',
      completed_task_ids: completedTaskIds,
    };
  }

  private isTaskDateExpired(taskDateYmd: string, now: Date): boolean {
    const end = new Date(`${taskDateYmd}T23:59:59.999+05:30`);
    return now.getTime() > end.getTime();
  }

  private emitTaskEvaluatedSafe(
    userId: Types.ObjectId,
    date: string,
    completedTaskIds: string[],
  ): void {
    setImmediate(() => {
      try {
        this.activityEventsService.emitTaskEvaluated({
          completedTaskIds,
          date,
          userId: userId.toString(),
        });
      } catch {
        // Non-blocking per execution-flow async rules
      }
    });
  }

  private async ensureGeneratedDailyTasks(
    userId: Types.ObjectId,
    todayYmd: string,
  ): Promise<UserDailyTask> {
    const race = await this.userDailyTaskModel.findOne({
      date: todayYmd,
      user_id: userId,
    });
    if (race) {
      return race;
    }

    const user = await this.userModel.findById(userId).lean().exec();
    if (!user) {
      throw new InternalServerErrorException({
        error: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    const profile = await this.userProfileModel.findOne({ user_id: userId }).exec();
    if (!profile) {
      throw new InternalServerErrorException({
        error: 'PROFILE_NOT_FOUND',
        message: 'User profile not found',
      });
    }

    const templates = await this.taskTemplateModel.find({ active: true }).lean().exec();
    if (templates.length === 0) {
      throw new InternalServerErrorException({
        error: 'TASK_TEMPLATES_EMPTY',
        message: 'Task templates are not configured',
      });
    }

    const yesterdayYmd = addDaysToYmd(todayYmd, -1);
    const [yesterdayDoc, historyDocs, lastSevenLogs, carbonRecords] =
      await Promise.all([
        this.userDailyTaskModel
          .findOne({ date: yesterdayYmd, user_id: userId })
          .lean()
          .exec(),
        this.userDailyTaskModel
          .find({
            date: { $gte: addDaysToYmd(todayYmd, -120) },
            user_id: userId,
          })
          .lean()
          .exec(),
        this.dailyActivityLogModel
          .find({ type: 'daily', user_id: userId })
          .sort({ date: -1 })
          .limit(7)
          .lean()
          .exec(),
        this.carbonRecordModel
          .find({ user_id: userId })
          .sort({ date: 1 })
          .limit(14)
          .lean()
          .exec(),
      ]);

    const yesterdayTaskIds = new Set(
      (yesterdayDoc?.tasks ?? []).map((t) => t.task_id),
    );
    const lastCompletionYmdByTaskId = this.buildLastCompletionMap(
      historyDocs,
      todayYmd,
    );

    const behaviorProfile = this.buildBehaviorProfileFromLogs(lastSevenLogs);
    const emissionTrend = computeEmissionTrendFromTotals(
      carbonRecords.map((r) => r.total_emission),
    );

    const userRegisteredYmd = getDateStringInTimeZone(
      user.created_at,
      INDIA_TIME_ZONE,
    );

    const signals: TaskGenerationSignals = {
      todayYmd,
      userRegisteredYmd,
      templates: templates as TaskTemplate[],
      yesterdayTaskIds,
      lastCompletionYmdByTaskId,
      behaviorProfile,
      taskCompletionRate: profile.engagement_metrics.task_completion_rate,
      streakDays: profile.streak_days,
      emissionTrend,
      relaxCooldown: false,
    };

    let selection;
    try {
      selection = generateDailyTaskSelection(signals);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException({
        error: 'TASK_GENERATION_FAILED',
        message,
      });
    }

    const createdAt = new Date();
    const newDoc = new this.userDailyTaskModel({
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
      await newDoc.save();
    } catch (error: unknown) {
      const code =
        error && typeof error === 'object' && 'code' in error
          ? (error as { code?: number | string }).code
          : undefined;
      if (code === 11_000 || code === '11000') {
        const existing = await this.userDailyTaskModel.findOne({
          date: todayYmd,
          user_id: userId,
        });
        if (existing) {
          return existing;
        }
      }
      throw error;
    }

    return newDoc;
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
        const prev = map.get(task.task_id);
        if (!prev || doc.date > prev) {
          map.set(task.task_id, doc.date);
        }
      }
    }
    return map;
  }

  private buildBehaviorProfileFromLogs(
    logs: Array<
      Pick<DailyActivityLog, 'eco_actions' | 'electricity' | 'transport'>
    >,
  ): TaskGenerationSignals['behaviorProfile'] {
    if (logs.length === 0) {
      return {
        avg_ac_hours: 0,
        avg_distance: 0,
        avg_energy_usage: 0,
        avg_transport_mode: '',
        eco_action_score: 0,
      };
    }

    const transportModeCounts = new Map<string, number>();
    for (const log of logs) {
      const mode = log.transport.mode;
      transportModeCounts.set(mode, (transportModeCounts.get(mode) ?? 0) + 1);
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
      avg_ac_hours: average(logs.map((l) => l.electricity.ac_hours)),
      avg_distance: average(logs.map((l) => l.transport.distance)),
      avg_energy_usage: average(
        logs.map((l) => l.electricity.units_consumed),
      ),
      avg_transport_mode: avgTransportMode,
      eco_action_score: average(logs.map((l) => l.eco_actions.length)),
    };
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

  private async buildTodayResponse(
    dateYmd: string,
    tasks: UserDailyTask['tasks'],
  ) {
    const ids = tasks.map((t) => t.task_id);
    const templates = await this.taskTemplateModel
      .find({ active: true, task_id: { $in: ids } })
      .lean()
      .exec();
    const templateMap = new Map(
      templates.map((template) => [template.task_id, template]),
    );

    const expiresAt = `${dateYmd}T23:59:59.999+05:30`;

    return {
      date: dateYmd,
      expires_at: expiresAt,
      tasks: tasks.map((task) => {
        const template = templateMap.get(task.task_id);
        return {
          task_id: task.task_id,
          category: task.category,
          completion_type: task.completion_type,
          status: task.status,
          completed_at: task.completed_at,
          title: template?.title ?? task.task_id,
          description: template?.description ?? '',
        };
      }),
    };
  }
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
