import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { BadgeEngineService } from '../badge-engine/badge-engine.service';
import type { BadgeRetryJobData } from './badge-retry-job.types';
import { JobAuditService } from './job-audit.service';
import { BADGE_QUEUE_NAME } from './queue.constants';

@Processor(BADGE_QUEUE_NAME, { concurrency: 2 })
export class BadgeRetryProcessor extends WorkerHost {
  private readonly logger = new Logger(BadgeRetryProcessor.name);

  constructor(
    private readonly badgeEngineService: BadgeEngineService,
    private readonly jobAuditService: JobAuditService,
  ) {
    super();
  }

  async process(job: Job<BadgeRetryJobData>): Promise<void> {
    this.jobAuditService.logJobExecution(job, BADGE_QUEUE_NAME);
    await this.badgeEngineService.processBadgeRetryJob(job.data);
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job, error: Error): Promise<void> {
    try {
      if (!this.jobAuditService.shouldPersistFailure(job)) {
        this.jobAuditService.logRetryAttempt(job, BADGE_QUEUE_NAME, error);
        return;
      }
      await this.jobAuditService.logPermanentJobFailure({
        queueName: BADGE_QUEUE_NAME,
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
