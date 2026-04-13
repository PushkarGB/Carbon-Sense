import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Badge } from '../schemas/badge.schema';
import { Leaderboard } from '../schemas/leaderboard.schema';
import { UserBadge } from '../schemas/user-badge.schema';
import { User } from '../schemas/user.schema';
import { UserProfile } from '../schemas/user-profile.schema';
import { toPublicUser } from './experience.types';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('UserProfile')
    private readonly userProfileModel: Model<UserProfile>,
    @InjectModel('Badge') private readonly badgeModel: Model<Badge>,
    @InjectModel('UserBadge') private readonly userBadgeModel: Model<UserBadge>,
    @InjectModel('Leaderboard')
    private readonly leaderboardModel: Model<Leaderboard>,
  ) {}

  async getMe(userId: Types.ObjectId) {
    const [user, profile, badges, awarded, leaderboard] = await Promise.all([
      this.userModel.findById(userId).lean().exec(),
      this.userProfileModel.findOne({ user_id: userId }).lean().exec(),
      this.badgeModel.find({ active: true }).sort({ value: 1, badge_id: 1 }).lean().exec(),
      this.userBadgeModel.find({ user_id: userId }).lean().exec(),
      this.leaderboardModel.findOne({ user_id: userId }).lean().exec(),
    ]);

    if (!user || !profile) {
      throw new InternalServerErrorException({
        error: 'PROFILE_NOT_FOUND',
        message: 'User profile not found',
      });
    }

    const awardedByBadgeId = new Map(
      awarded.map((row) => [row.badge_id, row.awarded_at]),
    );
    const badgeRows = badges.map((badge) => ({
      ...badge,
      achieved: awardedByBadgeId.has(badge.badge_id),
      awarded_at: awardedByBadgeId.get(badge.badge_id) ?? null,
    }));

    return {
      user: toPublicUser(user),
      profile: {
        behavior_profile: profile.behavior_profile,
        engagement_metrics: profile.engagement_metrics,
        onboarding_completed: profile.onboarding_completed,
        performance_metrics: profile.performance_metrics,
        streak_days: profile.streak_days,
        task_stats: profile.task_stats,
        weekly_insights: profile.weekly_insights,
      },
      leaderboard:
        leaderboard === null
          ? null
          : {
              avg_emission: leaderboard.avg_emission,
              total_days_logged: leaderboard.total_days_logged,
              total_emission: leaderboard.total_emission,
              updated_at: leaderboard.updated_at,
            },
      badges: badgeRows,
      summary: {
        badges_unlocked: awarded.length,
        latest_badges: badgeRows
          .filter((badge) => badge.achieved)
          .sort((a, b) => {
            const aTime = a.awarded_at instanceof Date ? a.awarded_at.getTime() : 0;
            const bTime = b.awarded_at instanceof Date ? b.awarded_at.getTime() : 0;
            return bTime - aTime;
          })
          .slice(0, 5),
        total_badges: badges.length,
      },
    };
  }
}
