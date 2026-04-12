import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CarbonRecordSchema } from '../schemas/carbon-record.schema';
import { DailyActivityLogSchema } from '../schemas/daily-activity-log.schema';
import { EmissionFactorSchema } from '../schemas/emission-factor.schema';
import { TaskTemplateSchema } from '../schemas/task-template.schema';
import { UserDailyTaskSchema } from '../schemas/user-daily-task.schema';
import { UserProfileSchema } from '../schemas/user-profile.schema';
import { UserSchema } from '../schemas/user.schema';
import { ActivityController } from './activity.controller';
import { ActivityEventsService } from './activity-events.service';
import { ActivityService } from './activity.service';
import { EmissionFactorService } from './emission-factor.service';
import { RedisCacheService } from './redis-cache.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'CarbonRecord', schema: CarbonRecordSchema },
      { name: 'DailyActivityLog', schema: DailyActivityLogSchema },
      { name: 'EmissionFactor', schema: EmissionFactorSchema },
      { name: 'TaskTemplate', schema: TaskTemplateSchema },
      { name: 'UserDailyTask', schema: UserDailyTaskSchema },
      { name: 'UserProfile', schema: UserProfileSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  controllers: [ActivityController],
  providers: [
    ActivityEventsService,
    ActivityService,
    EmissionFactorService,
    RedisCacheService,
  ],
  exports: [ActivityEventsService],
})
export class ActivityModule {}
