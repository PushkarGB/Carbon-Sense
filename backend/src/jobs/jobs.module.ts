import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { BadgeEngineModule } from '../badge-engine/badge-engine.module';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';
import { CarbonRecordSchema } from '../schemas/carbon-record.schema';
import { ErrorLogSchema } from '../schemas/error-log.schema';
import { JobLogSchema } from '../schemas/job-log.schema';
import { UserProfileSchema } from '../schemas/user-profile.schema';
import { UserProjectionSchema } from '../schemas/user-projection.schema';
import { UserSchema } from '../schemas/user.schema';
import { TasksModule } from '../tasks/tasks.module';
import { BullJobsQueuesModule } from './bull-jobs-queues.module';
import { BadgeRetryProcessor } from './badge-retry.processor';
import { JobAuditService } from './job-audit.service';
import { JobDispatcherService } from './job-dispatcher.service';
import { LeaderboardProcessor } from './leaderboard.processor';
import { ProjectionJobService } from './projection-job.service';
import { ProjectionProcessor } from './projection.processor';
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
      { name: 'CarbonRecord', schema: CarbonRecordSchema },
      { name: 'UserProfile', schema: UserProfileSchema },
      { name: 'UserProjection', schema: UserProjectionSchema },
    ]),
  ],
  providers: [
    TaskQueueProcessor,
    LeaderboardProcessor,
    ProjectionProcessor,
    BadgeRetryProcessor,
    JobDispatcherService,
    JobAuditService,
    ProjectionJobService,
  ],
})
export class JobsModule {}
