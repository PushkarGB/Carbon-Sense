import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityModule } from '../activity/activity.module';
import { BadgeSchema } from '../schemas/badge.schema';
import { UserBadgeSchema } from '../schemas/user-badge.schema';
import { UserProfileSchema } from '../schemas/user-profile.schema';
import { BadgeEngineService } from './badge-engine.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Badge', schema: BadgeSchema },
      { name: 'UserBadge', schema: UserBadgeSchema },
      { name: 'UserProfile', schema: UserProfileSchema },
    ]),
    ActivityModule,
  ],
  providers: [BadgeEngineService],
  exports: [BadgeEngineService],
})
export class BadgeEngineModule {}
