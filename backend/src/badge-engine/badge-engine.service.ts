import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, OnApplicationBootstrap, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Queue } from 'bullmq';
import { Model, Types } from 'mongoose';
import {
  ActivityEventsService,
  EMISSION_UPDATED_EVENT,
  EmissionUpdatedEventPayload,
  STREAK_UPDATED_EVENT,
  StreakUpdatedEventPayload,
  TASK_EVALUATED_EVENT,
  TaskEvaluatedEventPayload,
} from '../activity/activity-events.service';
import type { BadgeRetryJobData } from '../jobs/badge-retry-job.types';
import {
  BADGE_QUEUE_NAME,
  JOB_NAME_BADGE_RETRY,
  JOB_PRIORITY_LOW,
} from '../jobs/queue.constants';
import { ErrorLogService } from '../resilience/error-log.service';
import { Badge } from '../schemas/badge.schema';
import { UserBadge } from '../schemas/user-badge.schema';
import { UserProfile } from '../schemas/user-profile.schema';

@Injectable()
export class BadgeEngineService implements OnApplicationBootstrap {
  private readonly logger = new Logger(BadgeEngineService.name);

  constructor(
    @InjectModel('Badge') private readonly badgeModel: Model<Badge>,
    @InjectModel('UserBadge') private readonly userBadgeModel: Model<UserBadge>,
    @InjectModel('UserProfile') private readonly userProfileModel: Model<UserProfile>,
    private readonly activityEventsService: ActivityEventsService,
    private readonly errorLogService: ErrorLogService,
    @Optional()
    @InjectQueue(BADGE_QUEUE_NAME)
    private readonly badgeRetryQueue?: Queue<BadgeRetryJobData>,
  ) {}

  onApplicationBootstrap() {
    this.listenToEvents();
  }

  private listenToEvents() {
    this.activityEventsService.on(TASK_EVALUATED_EVENT, (payload: TaskEvaluatedEventPayload) => {
      this.evaluateTaskBadges(payload).catch((err) => {
        this.logger.error(`Failed to evaluate task badges for user ${payload.userId}`, err);
        void this.errorLogService.logFailure({
          type: 'NON_CRITICAL',
          module: 'badge',
          userId: payload.userId,
          message: 'Badge evaluation failed for TASK_EVALUATED',
          payload: {
            payload,
            trigger_event: 'TASK_EVALUATED',
          },
          error: err,
        });
        this.enqueueBadgeRetry('TASK_EVALUATED', payload);
      });
    });

    this.activityEventsService.on(STREAK_UPDATED_EVENT, (payload: StreakUpdatedEventPayload) => {
      this.evaluateStreakBadges(payload).catch((err) => {
        this.logger.error(`Failed to evaluate streak badges for user ${payload.userId}`, err);
        void this.errorLogService.logFailure({
          type: 'NON_CRITICAL',
          module: 'badge',
          userId: payload.userId,
          message: 'Badge evaluation failed for STREAK_UPDATED',
          payload: {
            payload,
            trigger_event: 'STREAK_UPDATED',
          },
          error: err,
        });
        this.enqueueBadgeRetry('STREAK_UPDATED', payload);
      });
    });

    this.activityEventsService.on(EMISSION_UPDATED_EVENT, (payload: EmissionUpdatedEventPayload) => {
      this.evaluatePerformanceBadges(payload).catch((err) => {
        this.logger.error(`Failed to evaluate performance badges for user ${payload.userId}`, err);
        void this.errorLogService.logFailure({
          type: 'NON_CRITICAL',
          module: 'badge',
          userId: payload.userId,
          message: 'Badge evaluation failed for EMISSION_UPDATED',
          payload: {
            payload,
            trigger_event: 'EMISSION_UPDATED',
          },
          error: err,
        });
        this.enqueueBadgeRetry('EMISSION_UPDATED', payload);
      });
    });
  }

  /** BullMQ badge_queue worker entry (Background Job Architecture §3.4). */
  async processBadgeRetryJob(data: BadgeRetryJobData): Promise<void> {
    switch (data.trigger_event) {
      case 'TASK_EVALUATED':
        await this.evaluateTaskBadges(
          data.payload as TaskEvaluatedEventPayload,
        );
        return;
      case 'STREAK_UPDATED':
        await this.evaluateStreakBadges(
          data.payload as StreakUpdatedEventPayload,
        );
        return;
      case 'EMISSION_UPDATED':
        await this.evaluatePerformanceBadges(
          data.payload as EmissionUpdatedEventPayload,
        );
        return;
    }
  }

  private enqueueBadgeRetry(
    trigger_event: BadgeRetryJobData['trigger_event'],
    payload: BadgeRetryJobData['payload'],
  ): void {
    if (!this.badgeRetryQueue) {
      return;
    }
    const data: BadgeRetryJobData = {
      type: 'BADGE_RETRY',
      trigger_event,
      payload,
    };
    void this.badgeRetryQueue
      .add(JOB_NAME_BADGE_RETRY, data, {
        removeOnComplete: true,
        priority: JOB_PRIORITY_LOW,
      })
      .catch((err) => {
        this.logger.error('Failed to enqueue BADGE_RETRY job', err);
        void this.errorLogService.logFailure({
          type: 'NON_CRITICAL',
          module: 'badge',
          userId:
            typeof payload === 'object' &&
            payload !== null &&
            'userId' in payload &&
            typeof payload.userId === 'string'
              ? payload.userId
              : undefined,
          message: 'Failed to enqueue BADGE_RETRY job',
          payload: data,
          error: err,
        });
      });
  }

  private async evaluateTaskBadges(payload: TaskEvaluatedEventPayload) {
    const userProfile = await this.userProfileModel.findOne({ user_id: new Types.ObjectId(payload.userId) }).lean().exec();
    if (!userProfile) return;

    const taskStats = userProfile.task_stats;

    await this.evaluateCategoryBadges(new Types.ObjectId(payload.userId), 'eco_action', taskStats.eco_action);
    await this.evaluateCategoryBadges(new Types.ObjectId(payload.userId), 'emission_reduction', taskStats.emission_reduction);
    await this.evaluateCategoryBadges(new Types.ObjectId(payload.userId), 'awareness', taskStats.awareness);

    const totalTasks = taskStats.eco_action + taskStats.emission_reduction + taskStats.awareness;
    if (totalTasks >= 1) {
      await this.awardBadgeIfEligible(new Types.ObjectId(payload.userId), 'first_task', 1, totalTasks);
    }
  }

  private async evaluateStreakBadges(payload: StreakUpdatedEventPayload) {
    const userId = new Types.ObjectId(payload.userId);
    await this.evaluateCategoryBadges(userId, 'streak', payload.streakDays);

    if (payload.streakDays >= 7) {
      await this.awardBadgeIfEligible(userId, 'perfect_week', 7, payload.streakDays);
    }
  }

  private async evaluatePerformanceBadges(payload: EmissionUpdatedEventPayload) {
    const userProfile = await this.userProfileModel.findOne({ user_id: new Types.ObjectId(payload.userId) }).lean().exec();
    if (!userProfile) return;

    const reductionPercent = userProfile.performance_metrics.reduction_percent;
    await this.evaluateCategoryBadges(new Types.ObjectId(payload.userId), 'performance', reductionPercent);
  }

  private async evaluateCategoryBadges(userId: Types.ObjectId, category: string, value: number) {
    const badges = await this.badgeModel.find({ category, active: true }).lean().exec();
    for (const badge of badges) {
      await this.awardBadgeIfEligible(userId, badge.badge_id, badge.threshold, value);
    }
  }

  private async awardBadgeIfEligible(userId: Types.ObjectId, badgeId: string, threshold: number, currentValue: number) {
    if (currentValue >= threshold) {
      const existing = await this.userBadgeModel.exists({ user_id: userId, badge_id: badgeId });
      if (!existing) {
        try {
          await this.userBadgeModel.create({
            user_id: userId,
            badge_id: badgeId,
            awarded_at: new Date(),
          });
          this.logger.log(`Awarded badge ${badgeId} to user ${userId}`);
        } catch (error: any) {
          if (error.code !== 11000) {
            throw error;
          }
        }
      }
    }
  }
}
