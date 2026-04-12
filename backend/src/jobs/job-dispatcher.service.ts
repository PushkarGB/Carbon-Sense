import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Queue } from 'bullmq';
import {
  getDateStringInTimeZone,
  INDIA_TIME_ZONE,
} from '../activity/activity.logic';
import { ErrorLogService } from '../resilience/error-log.service';
import {
  DEFAULT_JOB_ATTEMPTS,
  DEFAULT_JOB_BACKOFF_MS,
  JOB_NAME_LEADERBOARD_UPDATE,
  JOB_NAME_TASK_RESET,
  JOB_PRIORITY_HIGH,
  JOB_PRIORITY_MEDIUM,
  LEADERBOARD_QUEUE_NAME,
  TASK_QUEUE_NAME,
} from './queue.constants';

@Injectable()
export class JobDispatcherService {
  private readonly logger = new Logger(JobDispatcherService.name);

  constructor(
    @InjectQueue(TASK_QUEUE_NAME) private readonly taskQueue: Queue,
    @InjectQueue(LEADERBOARD_QUEUE_NAME)
    private readonly leaderboardQueue: Queue,
    private readonly errorLogService: ErrorLogService,
  ) {}

  /** Background Job Architecture §3.1 — daily midnight (Asia/Kolkata). */
  @Cron('0 0 * * *', { timeZone: INDIA_TIME_ZONE })
  async dispatchTaskDailyReset(): Promise<void> {
    const dayKey = getDateStringInTimeZone(new Date(), INDIA_TIME_ZONE);
    await this.enqueueWithRetry({
      queue: this.taskQueue,
      queueName: TASK_QUEUE_NAME,
      jobName: JOB_NAME_TASK_RESET,
      data: {
        type: JOB_NAME_TASK_RESET,
        priority: 'high',
        created_at: new Date().toISOString(),
      },
      options: {
        jobId: `task-reset-${dayKey}`,
        removeOnComplete: true,
        priority: JOB_PRIORITY_HIGH,
      },
      failureModule: 'task',
      failureMessage: 'Failed to enqueue TASK_RESET',
    });
  }

  /** Background Job Architecture §3.3 — every 4 hours within documented 3–6h window. */
  @Cron('0 */4 * * *', { timeZone: INDIA_TIME_ZONE })
  async dispatchLeaderboardUpdate(): Promise<void> {
    await this.enqueueWithRetry({
      queue: this.leaderboardQueue,
      queueName: LEADERBOARD_QUEUE_NAME,
      jobName: JOB_NAME_LEADERBOARD_UPDATE,
      data: {
        type: JOB_NAME_LEADERBOARD_UPDATE,
        priority: 'medium',
        created_at: new Date().toISOString(),
      },
      options: {
        removeOnComplete: true,
        priority: JOB_PRIORITY_MEDIUM,
      },
      failureModule: 'leaderboard',
      failureMessage: 'Failed to enqueue LEADERBOARD_UPDATE',
    });
  }

  private async enqueueWithRetry(params: {
    queue: Queue;
    queueName: string;
    jobName: string;
    data: Record<string, unknown>;
    options: Record<string, unknown>;
    failureModule: 'task' | 'leaderboard';
    failureMessage: string;
  }): Promise<void> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= DEFAULT_JOB_ATTEMPTS; attempt += 1) {
      try {
        await params.queue.add(params.jobName, params.data, params.options);
        return;
      } catch (error) {
        lastError = error;
        const message = error instanceof Error ? error.message : String(error);

        if (attempt < DEFAULT_JOB_ATTEMPTS) {
          this.logger.warn(
            `${params.failureMessage} on ${params.queueName} (attempt ${attempt}/${DEFAULT_JOB_ATTEMPTS}): ${message}`,
          );
          await delay(DEFAULT_JOB_BACKOFF_MS * 2 ** (attempt - 1));
          continue;
        }
      }
    }

    this.logger.error(params.failureMessage, lastError);
    await this.errorLogService.logFailure({
      type: 'NON_CRITICAL',
      module: params.failureModule,
      message: params.failureMessage,
      payload: {
        attempts: DEFAULT_JOB_ATTEMPTS,
        data: params.data,
        jobName: params.jobName,
        options: params.options,
        queueName: params.queueName,
      },
      retryCount: DEFAULT_JOB_ATTEMPTS,
      error: lastError,
    });
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
