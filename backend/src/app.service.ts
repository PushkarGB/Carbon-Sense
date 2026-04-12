import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserProfile } from './schemas/user-profile.schema';
import { DailyActivityLog } from './schemas/daily-activity-log.schema';
import { ActivityEventsService } from './activity/activity-events.service';
import { getDateStringInTimeZone, INDIA_TIME_ZONE } from './activity/activity.logic';

@Injectable()
export class AppService {
  constructor(
    @InjectModel('UserProfile') private readonly userProfileModel: Model<UserProfile>,
    @InjectModel('DailyActivityLog') private readonly dailyActivityLogModel: Model<DailyActivityLog>,
    private readonly activityEventsService: ActivityEventsService,
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

    const yesterdayTemp = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayYmd = getDateStringInTimeZone(yesterdayTemp, INDIA_TIME_ZONE);
    
    const submittedYesterday = await this.dailyActivityLogModel.exists({
      user_id: userId,
      type: 'daily',
      date: yesterdayYmd
    });

    let newStreak = 1;
    if (submittedYesterday) {
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
        } catch {}
    });

    return { 
        message: 'App open recorded', 
        streak_updated: true, 
        streak_days: newStreak 
    };
  }
}
