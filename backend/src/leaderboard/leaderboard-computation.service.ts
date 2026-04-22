import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { CarbonRecord } from '../schemas/carbon-record.schema';
import { Leaderboard } from '../schemas/leaderboard.schema';
import { User } from '../schemas/user.schema';
import { ListLeaderboardDto } from './dto/list-leaderboard.dto';

const BULK_CHUNK = 500;

type LeaderboardAggRow = {
  user_id: Types.ObjectId;
  total_emission: number;
  total_days_logged: number;
  city: string;
  role: string;
  avg_emission: number;
};

type LeaderboardListRow = {
  user_id: Types.ObjectId;
  name: string;
  city: string;
  role: string;
  profile_picture_url: string;
  avg_emission: number;
  total_emission: number;
  total_days_logged: number;
  updated_at: Date;
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
      // User has no carbon records yet — do NOT write a zero-row to the
      // leaderboard collection. Zero-row ghosts would appear in rankings
      // with 0 avg_emission and 0 days, which is misleading and unfair.
      return { updated_at: now.toISOString() };
    }

    await this.bulkUpsert(rows, now);
    return { updated_at: now.toISOString() };
  }

  async listForUserContext(
    userId: Types.ObjectId,
    query: ListLeaderboardDto,
  ) {
    const user = await this.userModel.findById(userId).lean().exec();
    if (!user) {
      throw new NotFoundException({
        error: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    const selfRowExists = await this.leaderboardModel.exists({ user_id: userId });
    if (!selfRowExists) {
      await this.recomputeForUser(userId);
    }

    const scope = query.scope ?? 'global';
    const limit = query.limit ?? 20;
    const rows = await this.leaderboardModel
      .aggregate<LeaderboardListRow>(
        this.buildListPipeline({
          city: scope === 'city' ? user.city : undefined,
          role: scope === 'role' ? user.role : undefined,
        }),
      )
      .exec();

    const rankedRows = rows.map((row, index) => ({
      rank: index + 1,
      user_id: row.user_id.toString(),
      name: row.name,
      city: row.city,
      role: row.role,
      profile_picture_url: row.profile_picture_url,
      avg_emission: row.avg_emission,
      total_days_logged: row.total_days_logged,
      total_emission: row.total_emission,
      updated_at: row.updated_at,
      is_current_user: row.user_id.toString() === userId.toString(),
    }));

    return {
      scope,
      scope_value:
        scope === 'city' ? user.city : scope === 'role' ? user.role : null,
      current_user_rank:
        rankedRows.find((row) => row.is_current_user)?.rank ?? null,
      rows: rankedRows.slice(0, limit),
    };
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

  private buildListPipeline(filters: {
    city?: string;
    role?: string;
  }): PipelineStage[] {
    // Always exclude users who have never logged any activity.
    // This is the primary fix: zero-emission / zero-day users are
    // meaningless in a carbon-reduction leaderboard.
    const match: Record<string, unknown> = {
      total_days_logged: { $gt: 0 },
    };
    if (filters.city) {
      match.city = filters.city;
    }
    if (filters.role) {
      match.role = filters.role;
    }

    const stages: PipelineStage[] = [
      { $match: match },
    ];

    stages.push(
      { $sort: { avg_emission: 1, total_days_logged: -1, user_id: 1 } },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          avg_emission: 1,
          city: 1,
          name: '$user.name',
          profile_picture_url: '$user.profile_picture_url',
          role: 1,
          total_days_logged: 1,
          total_emission: 1,
          updated_at: 1,
          user_id: 1,
        },
      },
    );

    return stages;
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
