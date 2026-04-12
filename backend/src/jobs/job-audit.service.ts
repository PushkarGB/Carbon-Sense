import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Job } from 'bullmq';
import { Model, Types } from 'mongoose';
import { ErrorLogService } from '../resilience/error-log.service';
import { ErrorLog } from '../schemas/error-log.schema';
import { JobLog } from '../schemas/job-log.schema';
import {
  BADGE_QUEUE_NAME,
  LEADERBOARD_QUEUE_NAME,
  TASK_QUEUE_NAME,
} from './queue.constants';

function mapQueueToJobLogType(
  queueName: string,
): 'TASK_RESET' | 'LEADERBOARD' | 'BADGE_RETRY' {
  switch (queueName) {
    case TASK_QUEUE_NAME:
      return 'TASK_RESET';
    case LEADERBOARD_QUEUE_NAME:
      return 'LEADERBOARD';
    case BADGE_QUEUE_NAME:
      return 'BADGE_RETRY';
    default:
      return 'TASK_RESET';
  }
}

@Injectable()
export class JobAuditService {
  private readonly logger = new Logger(JobAuditService.name);

  constructor(
    @InjectModel('JobLog') private readonly jobLogModel: Model<JobLog>,
    private readonly errorLogService: ErrorLogService,
  ) {}

  logJobExecution(job: Job, queueName: string): void {
    this.errorLogService.logJobExecution({
      queueName,
      jobId: String(job.id),
      jobName: job.name,
    });
  }

  shouldPersistFailure(job: Job): boolean {
    const maxAttempts =
      typeof job.opts.attempts === 'number' && job.opts.attempts > 0
        ? job.opts.attempts
        : 1;
    return job.attemptsMade >= maxAttempts;
  }

  logRetryAttempt(job: Job, queueName: string, error: Error): void {
    const maxAttempts =
      typeof job.opts.attempts === 'number' && job.opts.attempts > 0
        ? job.opts.attempts
        : 1;
    this.errorLogService.logRetryAttempt({
      queueName,
      jobId: String(job.id),
      attempt: job.attemptsMade,
      maxAttempts,
      message: error.message,
    });
  }

  async logPermanentJobFailure(params: {
    queueName: string;
    jobId: string;
    payload: unknown;
    attemptsMade: number;
    error: Error;
  }): Promise<void> {
    const now = new Date();
    const type = mapQueueToJobLogType(params.queueName);
    try {
      await this.jobLogModel.create({
        job_id: params.jobId,
        type,
        status: 'failed',
        retry_count: params.attemptsMade,
        payload: (params.payload ?? {}) as Record<string, unknown>,
        error_message: params.error.message,
        created_at: now,
        updated_at: now,
      });
    } catch (e) {
      this.logger.error(`Failed to write job_logs for job ${params.jobId}`, e);
    }

    try {
      await this.errorLogService.logFailure({
        type: 'NON_CRITICAL',
        module: mapQueueToErrorModule(params.queueName),
        userId: extractUserIdFromPayload(params.queueName, params.payload),
        message: params.error.message,
        payload: params.payload,
        retryCount: params.attemptsMade,
        error: params.error,
      });
    } catch (e) {
      this.logger.error('Failed to write error_logs for permanent job failure', e);
    }
  }

}

function mapQueueToErrorModule(queueName: string): ErrorLog['module'] {
  switch (queueName) {
    case TASK_QUEUE_NAME:
      return 'task';
    case LEADERBOARD_QUEUE_NAME:
      return 'leaderboard';
    case BADGE_QUEUE_NAME:
      return 'badge';
    default:
      return 'task';
  }
}

function extractUserIdFromPayload(
  queueName: string,
  payload: unknown,
): string | undefined {
  if (!payload || typeof payload !== 'object') {
    return undefined;
  }

  const record = payload as Record<string, unknown>;

  if (
    queueName === TASK_QUEUE_NAME &&
    typeof record.user_id === 'string' &&
    Types.ObjectId.isValid(record.user_id)
  ) {
    return record.user_id;
  }

  if (
    queueName === BADGE_QUEUE_NAME &&
    'payload' in record &&
    record.payload &&
    typeof record.payload === 'object'
  ) {
    const nested = record.payload as Record<string, unknown>;
    if (
      typeof nested.userId === 'string' &&
      Types.ObjectId.isValid(nested.userId)
    ) {
      return nested.userId;
    }
  }

  return undefined;
}
