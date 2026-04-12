import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'node:crypto';
import { Model, Types } from 'mongoose';
import { ErrorLog } from '../schemas/error-log.schema';
import { JobLog } from '../schemas/job-log.schema';
import type { BadgeRetryJobData } from './badge-retry-job.types';
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
    @InjectModel('ErrorLog') private readonly errorLogModel: Model<ErrorLog>,
  ) {}

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

    if (params.queueName === BADGE_QUEUE_NAME && this.isBadgeRetryPayload(params.payload)) {
      try {
        await this.errorLogModel.create({
          error_id: randomUUID(),
          type: 'NON_CRITICAL',
          module: 'badge',
          user_id: new Types.ObjectId(params.payload.payload.userId),
          message: params.error.message,
          payload: params.payload as unknown as Record<string, unknown>,
          retry_count: params.attemptsMade,
          timestamp: now,
        });
      } catch (e) {
        this.logger.error('Failed to write error_logs for badge retry', e);
      }
    }
  }

  private isBadgeRetryPayload(payload: unknown): payload is BadgeRetryJobData {
    if (!payload || typeof payload !== 'object') {
      return false;
    }
    const p = payload as Record<string, unknown>;
    if (p.type !== 'BADGE_RETRY' || p.trigger_event == null || p.payload == null) {
      return false;
    }
    const inner = p.payload as Record<string, unknown>;
    return (
      typeof inner.userId === 'string' &&
      Types.ObjectId.isValid(inner.userId)
    );
  }
}
