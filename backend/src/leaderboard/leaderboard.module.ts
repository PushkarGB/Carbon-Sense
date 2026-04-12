import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CarbonRecordSchema } from '../schemas/carbon-record.schema';
import { LeaderboardSchema } from '../schemas/leaderboard.schema';
import { UserSchema } from '../schemas/user.schema';
import { LeaderboardComputationService } from './leaderboard-computation.service';
import { LeaderboardController } from './leaderboard.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'CarbonRecord', schema: CarbonRecordSchema },
      { name: 'Leaderboard', schema: LeaderboardSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  controllers: [LeaderboardController],
  providers: [LeaderboardComputationService],
  exports: [LeaderboardComputationService],
})
export class LeaderboardModule {}
