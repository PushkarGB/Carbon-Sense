import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AqiModule } from '../aqi/aqi.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { InsightsController } from './insights.controller';
import { InsightsService } from './insights.service';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { UserSchema } from '../schemas/user.schema';
import { UserProfileSchema } from '../schemas/user-profile.schema';
import { CarbonRecordSchema } from '../schemas/carbon-record.schema';
import { UserDailyTaskSchema } from '../schemas/user-daily-task.schema';
import { AqiDataSchema } from '../schemas/aqi-data.schema';
import { BadgeSchema } from '../schemas/badge.schema';
import { UserBadgeSchema } from '../schemas/user-badge.schema';
import { LeaderboardSchema } from '../schemas/leaderboard.schema';

@Module({
  imports: [
    AqiModule,
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'UserProfile', schema: UserProfileSchema },
      { name: 'CarbonRecord', schema: CarbonRecordSchema },
      { name: 'UserDailyTask', schema: UserDailyTaskSchema },
      { name: 'AqiData', schema: AqiDataSchema },
      { name: 'Badge', schema: BadgeSchema },
      { name: 'UserBadge', schema: UserBadgeSchema },
      { name: 'Leaderboard', schema: LeaderboardSchema },
    ]),
  ],
  controllers: [DashboardController, InsightsController, ProfileController],
  providers: [DashboardService, InsightsService, ProfileService],
})
export class ExperienceModule {}
