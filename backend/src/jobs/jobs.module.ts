import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { BadgeEngineModule } from '../badge-engine/badge-engine.module';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';
import { ErrorLogSchema } from '../schemas/error-log.schema';
import { JobLogSchema } from '../schemas/job-log.schema';
import { UserSchema } from '../schemas/user.schema';
import { TasksModule } from '../tasks/tasks.module';
import { BullJobsQueuesModule } from './bull-jobs-queues.module';
import { BadgeRetryProcessor } from './badge-retry.processor';
import { JobAuditService } from './job-audit.service';
import { JobDispatcherService } from './job-dispatcher.service';
import { LeaderboardProcessor } from './leaderboard.processor';
import { TaskQueueProcessor } from './task-queue.processor';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullJobsQueuesModule,
    TasksModule,
    BadgeEngineModule,
    LeaderboardModule,
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'JobLog', schema: JobLogSchema },
      { name: 'ErrorLog', schema: ErrorLogSchema },
    ]),
  ],
  providers: [
    TaskQueueProcessor,
    LeaderboardProcessor,
    BadgeRetryProcessor,
    JobDispatcherService,
    JobAuditService,
  ],
})
export class JobsModule {}
