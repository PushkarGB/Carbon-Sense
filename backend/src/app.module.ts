import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ActivityModule } from './activity/activity.module';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { BadgeEngineModule } from './badge-engine/badge-engine.module';
import { UserProfileSchema } from './schemas/user-profile.schema';
import { DailyActivityLogSchema } from './schemas/daily-activity-log.schema';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/carbonsense',
    ),
    MongooseModule.forFeature([
      { name: 'UserProfile', schema: UserProfileSchema },
      { name: 'DailyActivityLog', schema: DailyActivityLogSchema },
    ]),
    ActivityModule,
    AuthModule,
    TasksModule,
    BadgeEngineModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
