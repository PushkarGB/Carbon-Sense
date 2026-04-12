import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CarbonRecord } from '../schemas/carbon-record.schema';
import { Leaderboard } from '../schemas/leaderboard.schema';
import { User } from '../schemas/user.schema';

const BULK_CHUNK = 500;

type LeaderboardAggRow = {
  user_id: Types.ObjectId;
  total_emission: number;
  total_days_logged: number;
  city: string;
  role: string;
  avg_emission: number;
};

@Injectable()
export class LeaderboardComputationService {
  constructor(
    @InjectModel('CarbonRecord')
    private readonly carbonRecordModel: Model<CarbonRecord>,
    @InjectModel('Leaderboard')
    private readonly leaderboardModel: Model<Leaderboard>,
    @InjectModel('User') private readonly userModel: Model<User>,
  ) {}

  /** Cron path: all users with at least one carbon_record (Background Job §3.3). */
  async recomputeAllFromCarbonRecords(): Promise<number> {
    const rows = await this.runAggregation();
    if (rows.length === 0) {
      return 0;
    }
    await this.bulkUpsert(rows, new Date());
    return rows.length;
  }

  /**
   * Execution Flow §9 — POST /leaderboard/refresh: recompute for the authenticated user only.
   */
  async recomputeForUser(userId: Types.ObjectId): Promise<{ updated_at: string }> {
    const user = await this.userModel.findById(userId).lean().exec();
    if (!user) {
      throw new NotFoundException({
        error: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    const now = new Date();
    const rows = await this.runAggregation(userId);

    if (rows.length === 0) {
      await this.leaderboardModel.updateOne(
        { user_id: userId },
        {
          $set: {
            avg_emission: 0,
            total_emission: 0,
            total_days_logged: 0,
            city: user.city,
            role: user.role,
            updated_at: now,
          },
        },
        { upsert: true },
      );
      return { updated_at: now.toISOString() };
    }

    await this.bulkUpsert(rows, now);
    return { updated_at: now.toISOString() };
  }

  private buildPipeline(userId?: Types.ObjectId) {
    const match = userId ? [{ $match: { user_id: userId } }] : [];
    return [
      ...match,
      {
        $group: {
          _id: '$user_id',
          total_emission: { $sum: '$total_emission' },
          total_days_logged: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          user_id: '$_id',
          total_emission: 1,
          total_days_logged: 1,
          city: '$user.city',
          role: '$user.role',
          avg_emission: {
            $cond: {
              if: { $eq: ['$total_days_logged', 0] },
              then: 0,
              else: {
                $divide: ['$total_emission', '$total_days_logged'],
              },
            },
          },
        },
      },
    ];
  }

  private runAggregation(userId?: Types.ObjectId) {
    return this.carbonRecordModel
      .aggregate<LeaderboardAggRow>(this.buildPipeline(userId))
      .exec();
  }

  private async bulkUpsert(rows: LeaderboardAggRow[], now: Date): Promise<void> {
    const ops = rows.map((row) => ({
      updateOne: {
        filter: { user_id: row.user_id },
        update: {
          $set: {
            avg_emission: row.avg_emission,
            total_emission: row.total_emission,
            total_days_logged: row.total_days_logged,
            city: row.city,
            role: row.role,
            updated_at: now,
          },
        },
        upsert: true,
      },
    }));

    for (let i = 0; i < ops.length; i += BULK_CHUNK) {
      await this.leaderboardModel.bulkWrite(ops.slice(i, i + BULK_CHUNK));
    }
  }
}
