import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Queue } from 'bullmq';
import {
  getDateStringInTimeZone,
  INDIA_TIME_ZONE,
} from '../activity/activity.logic';
import {
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
  ) {}

  /** Background Job Architecture §3.1 — daily midnight (Asia/Kolkata). */
  @Cron('0 0 * * *', { timeZone: INDIA_TIME_ZONE })
  async dispatchTaskDailyReset(): Promise<void> {
    const dayKey = getDateStringInTimeZone(new Date(), INDIA_TIME_ZONE);
    try {
      await this.taskQueue.add(
        JOB_NAME_TASK_RESET,
        {
          type: JOB_NAME_TASK_RESET,
          priority: 'high',
          created_at: new Date().toISOString(),
        },
        {
          jobId: `task-reset-${dayKey}`,
          removeOnComplete: true,
          priority: JOB_PRIORITY_HIGH,
        },
      );
    } catch (error) {
      this.logger.error('Failed to enqueue TASK_RESET', error);
    }
  }

  /** Background Job Architecture §3.3 — every 4 hours within documented 3–6h window. */
  @Cron('0 */4 * * *', { timeZone: INDIA_TIME_ZONE })
  async dispatchLeaderboardUpdate(): Promise<void> {
    try {
      await this.leaderboardQueue.add(
        JOB_NAME_LEADERBOARD_UPDATE,
        {
          type: JOB_NAME_LEADERBOARD_UPDATE,
          priority: 'medium',
          created_at: new Date().toISOString(),
        },
        {
          removeOnComplete: true,
          priority: JOB_PRIORITY_MEDIUM,
        },
      );
    } catch (error) {
      this.logger.error('Failed to enqueue LEADERBOARD_UPDATE', error);
    }
  }
}
