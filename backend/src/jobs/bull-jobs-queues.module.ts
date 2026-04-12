import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import {
  BADGE_QUEUE_NAME,
  DEFAULT_JOB_ATTEMPTS,
  DEFAULT_JOB_BACKOFF_MS,
  LEADERBOARD_QUEUE_NAME,
  TASK_QUEUE_NAME,
} from './queue.constants';

const defaultJobOptions = {
  attempts: DEFAULT_JOB_ATTEMPTS,
  backoff: { type: 'exponential' as const, delay: DEFAULT_JOB_BACKOFF_MS },
};

/**
 * Registers the three documented queues once for the application process.
 * Marked global so feature modules can inject queues without importing this module.
 */
@Global()
@Module({
  imports: [
    BullModule.registerQueue(
      { name: TASK_QUEUE_NAME, defaultJobOptions },
      { name: LEADERBOARD_QUEUE_NAME, defaultJobOptions },
      { name: BADGE_QUEUE_NAME, defaultJobOptions },
    ),
  ],
  exports: [BullModule],
})
export class BullJobsQueuesModule {}
