import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
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
  ) {}

  onApplicationBootstrap() {
    this.listenToEvents();
  }

  private listenToEvents() {
    this.activityEventsService.on(TASK_EVALUATED_EVENT, (payload: TaskEvaluatedEventPayload) => {
      this.evaluateTaskBadges(payload).catch((err) =>
        this.logger.error(`Failed to evaluate task badges for user ${payload.userId}`, err),
      );
    });

    this.activityEventsService.on(STREAK_UPDATED_EVENT, (payload: StreakUpdatedEventPayload) => {
      this.evaluateStreakBadges(payload).catch((err) =>
        this.logger.error(`Failed to evaluate streak badges for user ${payload.userId}`, err),
      );
    });

    this.activityEventsService.on(EMISSION_UPDATED_EVENT, (payload: EmissionUpdatedEventPayload) => {
      this.evaluatePerformanceBadges(payload).catch((err) =>
        this.logger.error(`Failed to evaluate performance badges for user ${payload.userId}`, err),
      );
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
