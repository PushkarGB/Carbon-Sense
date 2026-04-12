import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityModule } from '../activity/activity.module';
import { CarbonRecordSchema } from '../schemas/carbon-record.schema';
import { DailyActivityLogSchema } from '../schemas/daily-activity-log.schema';
import { TaskTemplateSchema } from '../schemas/task-template.schema';
import { UserDailyTaskSchema } from '../schemas/user-daily-task.schema';
import { UserProfileSchema } from '../schemas/user-profile.schema';
import { UserSchema } from '../schemas/user.schema';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [
    ActivityModule,
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'UserProfile', schema: UserProfileSchema },
      { name: 'TaskTemplate', schema: TaskTemplateSchema },
      { name: 'UserDailyTask', schema: UserDailyTaskSchema },
      { name: 'DailyActivityLog', schema: DailyActivityLogSchema },
      { name: 'CarbonRecord', schema: CarbonRecordSchema },
    ]),
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
