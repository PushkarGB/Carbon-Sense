import { Job } from 'bullmq';
import { JobAuditService } from './job-audit.service';

describe('JobAuditService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('treats intermediate worker failures as retryable', () => {
    const { service } = createService();

    const job = {
      attemptsMade: 1,
      id: 'job-1',
      name: 'BADGE_RETRY',
      opts: { attempts: 3 },
    } as unknown as Job;

    expect(service.shouldPersistFailure(job)).toBe(false);
  });

  it('persists only exhausted failures and forwards badge user context to error logging', async () => {
    const { jobLogModel, service, errorLogService } = createService();

    await service.logPermanentJobFailure({
      queueName: 'badge_queue',
      jobId: 'job-2',
      payload: {
        type: 'BADGE_RETRY',
        trigger_event: 'TASK_EVALUATED',
        payload: {
          userId: '64a1b2c3d4e5f67890123456',
          completedTaskIds: ['eco_reuse'],
          date: '2026-04-12',
        },
      },
      attemptsMade: 3,
      error: new Error('badge retry exhausted'),
    });

    expect(jobLogModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        job_id: 'job-2',
        retry_count: 3,
        status: 'failed',
        type: 'BADGE_RETRY',
      }),
    );
    expect(errorLogService.logFailure).toHaveBeenCalledWith(
      expect.objectContaining({
        module: 'badge',
        retryCount: 3,
        type: 'NON_CRITICAL',
        userId: '64a1b2c3d4e5f67890123456',
      }),
    );
  });
});

function createService() {
  const jobLogModel = {
    create: jest.fn().mockResolvedValue(undefined),
  };
  const errorLogService = {
    logFailure: jest.fn().mockResolvedValue(undefined),
    logJobExecution: jest.fn(),
    logRetryAttempt: jest.fn(),
  };

  return {
    jobLogModel,
    errorLogService,
    service: new JobAuditService(
      jobLogModel as never,
      errorLogService as never,
    ),
  };
}
