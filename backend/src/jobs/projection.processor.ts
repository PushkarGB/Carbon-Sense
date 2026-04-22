import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { BadRequestException, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { Types } from 'mongoose';
import { JobAuditService } from './job-audit.service';
import {
  JOB_NAME_PROJECTION_UPDATE,
  PROJECTION_QUEUE_NAME,
} from './queue.constants';
import { ProjectionJobService } from './projection-job.service';

type ProjectionUpdatePayload = {
  type: 'PROJECTION_UPDATE';
  user_id: string;
  date: string;
};

@Processor(PROJECTION_QUEUE_NAME, { concurrency: 2 })
export class ProjectionProcessor extends WorkerHost {
  private readonly logger = new Logger(ProjectionProcessor.name);

  constructor(
    private readonly projectionJobService: ProjectionJobService,
    private readonly jobAuditService: JobAuditService,
  ) {
    super();
  }

  async process(job: Job<ProjectionUpdatePayload>): Promise<void> {
    this.jobAuditService.logJobExecution(job, PROJECTION_QUEUE_NAME);

    if (job.name !== JOB_NAME_PROJECTION_UPDATE) {
      throw new BadRequestException({
        error: 'INVALID_PROJECTION_JOB_NAME',
        message: 'Unsupported job name for projection queue',
      });
    }

    const data = job.data as Partial<ProjectionUpdatePayload>;
    if (
      typeof data.user_id !== 'string' ||
      !Types.ObjectId.isValid(data.user_id) ||
      typeof data.date !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(data.date)
    ) {
      throw new BadRequestException({
        error: 'INVALID_PROJECTION_PAYLOAD',
        message: 'PROJECTION_UPDATE requires valid user_id and date',
      });
    }

    await this.projectionJobService.runProjectionUpdateForUser(
      new Types.ObjectId(data.user_id),
      data.date,
    );
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job, error: Error): Promise<void> {
    try {
      if (!this.jobAuditService.shouldPersistFailure(job)) {
        this.jobAuditService.logRetryAttempt(job, PROJECTION_QUEUE_NAME, error);
        return;
      }
      await this.jobAuditService.logPermanentJobFailure({
        queueName: PROJECTION_QUEUE_NAME,
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