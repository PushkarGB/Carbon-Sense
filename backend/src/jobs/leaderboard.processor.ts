import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { LeaderboardComputationService } from '../leaderboard/leaderboard-computation.service';
import { JobAuditService } from './job-audit.service';
import { LEADERBOARD_QUEUE_NAME } from './queue.constants';

@Processor(LEADERBOARD_QUEUE_NAME, { concurrency: 1 })
export class LeaderboardProcessor extends WorkerHost {
  private readonly logger = new Logger(LeaderboardProcessor.name);

  constructor(
    private readonly leaderboardComputation: LeaderboardComputationService,
    private readonly jobAuditService: JobAuditService,
  ) {
    super();
  }

  async process(_job: Job): Promise<void> {
    this.jobAuditService.logJobExecution(_job, LEADERBOARD_QUEUE_NAME);
    const updated = await this.leaderboardComputation.recomputeAllFromCarbonRecords();
    if (updated === 0) {
      this.logger.log('Leaderboard job: no carbon_records to aggregate');
    }
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job, error: Error): Promise<void> {
    try {
      if (!this.jobAuditService.shouldPersistFailure(job)) {
        this.jobAuditService.logRetryAttempt(job, LEADERBOARD_QUEUE_NAME, error);
        return;
      }
      await this.jobAuditService.logPermanentJobFailure({
        queueName: LEADERBOARD_QUEUE_NAME,
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
