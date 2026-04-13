import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserProfile } from './schemas/user-profile.schema';
import { DailyActivityLog } from './schemas/daily-activity-log.schema';
import { ActivityEventsService } from './activity/activity-events.service';
import { getDateStringInTimeZone, INDIA_TIME_ZONE } from './activity/activity.logic';
import { ErrorLogService } from './resilience/error-log.service';

const UNSET_PROFILE_DATE = '1970-01-01';

@Injectable()
export class AppService {
  constructor(
    @InjectModel('UserProfile') private readonly userProfileModel: Model<UserProfile>,
    @InjectModel('DailyActivityLog') private readonly dailyActivityLogModel: Model<DailyActivityLog>,
    private readonly activityEventsService: ActivityEventsService,
    private readonly errorLogService: ErrorLogService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async handleAppOpen(userId: Types.ObjectId) {
    const now = new Date();
    const todayYmd = getDateStringInTimeZone(now, INDIA_TIME_ZONE);

    const userProfile = await this.userProfileModel.findOne({ user_id: userId }).exec();
    if (!userProfile) {
      throw new InternalServerErrorException({ error: 'PROFILE_NOT_FOUND', message: 'User profile not found' });
    }

    await this.userProfileModel.updateOne(
        { _id: userProfile._id },
        { $inc: { 'engagement_metrics.app_open_count': 1 } }
    );

    if (userProfile.last_streak_update === todayYmd) {
      return { message: 'App open recorded', streak_updated: false };
    }

    // Streak is purely based on consecutive app opens (decoupled from submissions).
    // If the user opened the app yesterday, increment streak; otherwise reset to 1.
    const yesterdayTemp = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayYmd = getDateStringInTimeZone(yesterdayTemp, INDIA_TIME_ZONE);

    let newStreak = 1;
    if (userProfile.last_streak_update === yesterdayYmd) {
      newStreak = userProfile.streak_days + 1;
    }

    await this.userProfileModel.updateOne(
      { _id: userProfile._id },
      { 
        $set: { 
          streak_days: newStreak, 
          last_streak_update: todayYmd 
        } 
      }
    );

    setImmediate(() => {
        try {
            this.activityEventsService.emitStreakUpdated({
                userId: userId.toString(),
                date: todayYmd,
                streakDays: newStreak,
            });
        } catch (error) {
            void this.errorLogService.logFailure({
              type: 'NON_CRITICAL',
              module: 'badge',
              userId,
              message: 'Failed to emit STREAK_UPDATED badge event',
              payload: {
                date: todayYmd,
                streakDays: newStreak,
              },
              error,
            });
        }
    });

    return { 
        message: 'App open recorded', 
        streak_updated: true, 
        streak_days: newStreak 
    };
  }
}
