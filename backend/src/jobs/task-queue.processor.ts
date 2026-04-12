import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Job } from 'bullmq';
import { Model, Types } from 'mongoose';
import { User } from '../schemas/user.schema';
import { TasksService } from '../tasks/tasks.service';
import { JobAuditService } from './job-audit.service';
import {
  JOB_NAME_TASK_GENERATE_SINGLE,
  JOB_NAME_TASK_RESET,
  TASK_QUEUE_NAME,
} from './queue.constants';

type TaskGenerateSinglePayload = {
  type: 'TASK_GENERATE_SINGLE';
  user_id: string;
  date: string;
};

/**
 * Processes `task_queue`: midnight TASK_RESET (§3.1) and API fallback
 * TASK_GENERATE_SINGLE (§3.2).
 */
@Processor(TASK_QUEUE_NAME, { concurrency: 1 })
export class TaskQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(TaskQueueProcessor.name);

  constructor(
    private readonly tasksService: TasksService,
    @InjectModel('User') private readonly userModel: Model<User>,
    private readonly jobAuditService: JobAuditService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    const name = job.name ?? JOB_NAME_TASK_RESET;
    this.jobAuditService.logJobExecution(job, TASK_QUEUE_NAME);

    if (name === JOB_NAME_TASK_GENERATE_SINGLE) {
      await this.processTaskGenerateSingle(job);
      return;
    }

    await this.processTaskReset();
  }

  private async processTaskGenerateSingle(job: Job): Promise<void> {
    const data = job.data as Partial<TaskGenerateSinglePayload>;
    const userIdStr = data.user_id;
    const date = data.date;
    if (
      typeof userIdStr !== 'string' ||
      !Types.ObjectId.isValid(userIdStr) ||
      typeof date !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
      throw new BadRequestException({
        error: 'INVALID_TASK_GENERATE_PAYLOAD',
        message: 'TASK_GENERATE_SINGLE requires valid user_id and date',
      });
    }
    await this.tasksService.runTaskGenerateSingleJob(
      new Types.ObjectId(userIdStr),
      date,
    );
  }

  private async processTaskReset(): Promise<void> {
    const batchSize = 200;
    let lastId: Types.ObjectId | undefined;
    const failures: string[] = [];

    for (;;) {
      const filter =
        lastId !== undefined ? { _id: { $gt: lastId } } : {};

      const users = await this.userModel
        .find(filter)
        .sort({ _id: 1 })
        .limit(batchSize)
        .select('_id')
        .lean()
        .exec();

      if (users.length === 0) {
        break;
      }

      for (const row of users) {
        const id = row._id;
        try {
          await this.tasksService.runScheduledDailyTaskResetForUser(id);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          this.logger.error(`Task reset failed for user ${String(id)}: ${message}`);
          failures.push(`user ${String(id)}: ${message}`);
        }
      }

      lastId = users[users.length - 1]!._id as Types.ObjectId;
      if (users.length < batchSize) {
        break;
      }
    }

    if (failures.length > 0) {
      throw new Error(
        `TASK_RESET failed for ${failures.length} user(s). First failure: ${failures[0]}`,
      );
    }
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job, error: Error): Promise<void> {
    try {
      if (!this.jobAuditService.shouldPersistFailure(job)) {
        this.jobAuditService.logRetryAttempt(job, TASK_QUEUE_NAME, error);
        return;
      }
      await this.jobAuditService.logPermanentJobFailure({
        queueName: TASK_QUEUE_NAME,
        jobId: String(job.id),
        payload: job.data,
        attemptsMade: job.attemptsMade,
        error,
      });
    } catch (e) {
      this.logger.error('job audit failed handler', e);
    }
  }
}
