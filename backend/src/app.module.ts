import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ActivityModule } from './activity/activity.module';
import { AqiModule } from './aqi/aqi.module';
import { AuthModule } from './auth/auth.module';
import { BadgeEngineModule } from './badge-engine/badge-engine.module';
import { ExperienceModule } from './experience/experience.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { BullJobsQueuesModule } from './jobs/bull-jobs-queues.module';
import { JobsModule } from './jobs/jobs.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { ResilienceModule } from './resilience/resilience.module';
import { DailyActivityLogSchema } from './schemas/daily-activity-log.schema';
import { UserProfileSchema } from './schemas/user-profile.schema';
import { TasksModule } from './tasks/tasks.module';

const enableBullMq = process.env.DISABLE_BULLMQ !== 'true';

const bullMqImports = enableBullMq
  ? [
      BullModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: (config: ConfigService) => ({
          connection: {
            url: config.get<string>('REDIS_URL', 'redis://127.0.0.1:6379'),
            maxRetriesPerRequest: null,
          },
        }),
        inject: [ConfigService],
      }),
      BullJobsQueuesModule,
      JobsModule,
    ]
  : [];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/carbonsense',
    ),
    ResilienceModule,
    MongooseModule.forFeature([
      { name: 'UserProfile', schema: UserProfileSchema },
      { name: 'DailyActivityLog', schema: DailyActivityLogSchema },
    ]),
    ...bullMqImports,
    ActivityModule,
    AqiModule,
    AuthModule,
    ExperienceModule,
    OnboardingModule,
    TasksModule,
    LeaderboardModule,
    ...(enableBullMq ? [] : [BadgeEngineModule]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
