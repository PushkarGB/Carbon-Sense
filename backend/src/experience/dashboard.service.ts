import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CarbonRecord } from '../schemas/carbon-record.schema';
import { User } from '../schemas/user.schema';
import { UserProfile } from '../schemas/user-profile.schema';
import { UserDailyTask } from '../schemas/user-daily-task.schema';
import { AqiData } from '../schemas/aqi-data.schema';
import { AqiFetcherService } from '../aqi/aqi-fetcher.service';
import { getDateStringInTimeZone, INDIA_TIME_ZONE } from '../activity/activity.logic';
import { addDaysToYmd } from '../tasks/task-generation.engine';
import { toPublicUser } from './experience.types';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('UserProfile')
    private readonly userProfileModel: Model<UserProfile>,
    @InjectModel('CarbonRecord')
    private readonly carbonRecordModel: Model<CarbonRecord>,
    @InjectModel('UserDailyTask')
    private readonly userDailyTaskModel: Model<UserDailyTask>,
    @InjectModel('AqiData') private readonly aqiDataModel: Model<AqiData>,
    private readonly aqiFetcherService: AqiFetcherService,
  ) {}

  async getHome(userId: Types.ObjectId) {
    const todayYmd = getDateStringInTimeZone(new Date(), INDIA_TIME_ZONE);
    const [user, profile, todayEmission, recentRecords, tasksDoc] =
      await Promise.all([
        this.userModel.findById(userId).lean().exec(),
        this.userProfileModel.findOne({ user_id: userId }).lean().exec(),
        this.carbonRecordModel
          .findOne({ date: todayYmd, user_id: userId })
          .lean()
          .exec(),
        this.carbonRecordModel
          .find({ date: { $gte: addDaysToYmd(todayYmd, -13) }, user_id: userId })
          .sort({ date: 1 })
          .lean()
          .exec(),
        this.userDailyTaskModel
          .findOne({ date: todayYmd, user_id: userId })
          .lean()
          .exec(),
      ]);

    if (!user || !profile) {
      throw new InternalServerErrorException({
        error: 'PROFILE_NOT_FOUND',
        message: 'User profile not found',
      });
    }

    // AQI: lookup cached data, fallback to live AQICN fetch if stale/missing
    let aqi = await this.aqiFetcherService.getAqiForCity(user.city);

    const completedTasks =
      tasksDoc?.tasks.filter((task) => task.status === 'completed').length ?? 0;
    const totalTasks = tasksDoc?.tasks.length ?? 0;

    return {
      user: toPublicUser(user),
      streak: {
        last_streak_update: profile.last_streak_update,
        streak_days: profile.streak_days,
      },
      today_emission: todayEmission ?? null,
      aqi:
        aqi === null
          ? null
          : {
              aqi: aqi.aqi,
              city: aqi.city,
              co: aqi.co,
              fetched_at: aqi.fetched_at,
              no2: aqi.no2,
              pm10: aqi.pm10,
              pm25: aqi.pm25,
              so2: aqi.so2,
            },
      tasks_progress:
        tasksDoc === null
          ? null
          : {
              completed: completedTasks,
              completion_rate:
                totalTasks > 0 ? completedTasks / totalTasks : 0,
              date: tasksDoc.date,
              expires_at: `${tasksDoc.date}T23:59:59.999+05:30`,
              pending: totalTasks - completedTasks,
              total: totalTasks,
            },
      performance_metrics: profile.performance_metrics,
      weekly_insights: profile.weekly_insights,
      onboarding_completed: profile.onboarding_completed,
      onboarding_defaults: profile.onboarding_defaults,
      projection: buildProjection(
        recentRecords.map((record) => record.total_emission),
        todayYmd,
        profile.performance_metrics.current_avg_emission,
      ),
    };
  }
}

function buildProjection(
  recentTotals: number[],
  todayYmd: string,
  currentAverageEmission: number,
) {
  if (recentTotals.length === 0 && currentAverageEmission <= 0) {
    return null;
  }

  const base = currentAverageEmission > 0
    ? currentAverageEmission
    : recentTotals[recentTotals.length - 1] ?? 0;
  const slope = recentTotals.length >= 2 ? linearSlope(recentTotals) : 0;

  const next30Days = Array.from({ length: 30 }, (_, index) => {
    const dayOffset = index + 1;
    return {
      date: addDaysToYmd(todayYmd, dayOffset),
      predicted_emission: clampPrediction(base + slope * dayOffset),
    };
  });

  const next12Months = Array.from({ length: 12 }, (_, index) => {
    const monthOffset = index + 1;
    return {
      month_index: monthOffset,
      predicted_avg_emission: clampPrediction(base + slope * monthOffset * 30),
    };
  });

  return {
    next_12_months: next12Months,
    next_30_days: next30Days,
  };
}

function linearSlope(values: number[]): number {
  const n = values.length;
  if (n < 2) {
    return 0;
  }

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let index = 0; index < n; index += 1) {
    const x = index;
    const y = values[index] ?? 0;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) {
    return 0;
  }

  return (n * sumXY - sumX * sumY) / denominator;
}

function clampPrediction(value: number): number {
  return Math.max(0, Number(value.toFixed(2)));
}
