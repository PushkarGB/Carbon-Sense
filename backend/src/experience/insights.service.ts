import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CarbonRecord } from '../schemas/carbon-record.schema';
import { User } from '../schemas/user.schema';
import { UserProfile } from '../schemas/user-profile.schema';
import { AqiData } from '../schemas/aqi-data.schema';
import { UserProjection } from '../schemas/user-projection.schema';
import { AqiFetcherService } from '../aqi/aqi-fetcher.service';
import { getDateStringInTimeZone, INDIA_TIME_ZONE } from '../activity/activity.logic';
import { addDaysToYmd, computeEmissionTrendFromTotals } from '../tasks/task-generation.engine';

@Injectable()
export class InsightsService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('UserProfile')
    private readonly userProfileModel: Model<UserProfile>,
    @InjectModel('CarbonRecord')
    private readonly carbonRecordModel: Model<CarbonRecord>,
    @InjectModel('UserProjection')
    private readonly userProjectionModel: Model<UserProjection>,
    @InjectModel('AqiData') private readonly aqiDataModel: Model<AqiData>,
    private readonly aqiFetcherService: AqiFetcherService,
  ) {}

  async getSummary(userId: Types.ObjectId, rangeDays: 7 | 30) {
    const todayYmd = getDateStringInTimeZone(new Date(), INDIA_TIME_ZONE);
    const rangeStart = addDaysToYmd(todayYmd, -(rangeDays - 1));

    const [user, profile, records, latestProjection] = await Promise.all([
      this.userModel.findById(userId).lean().exec(),
      this.userProfileModel.findOne({ user_id: userId }).lean().exec(),
      this.carbonRecordModel
        .find({
          date: { $gte: rangeStart, $lte: todayYmd },
          user_id: userId,
        })
        .sort({ date: 1 })
        .lean()
        .exec(),
      this.userProjectionModel
        .findOne({ user_id: userId, status: 'ready' })
        .sort({ updated_at: -1 })
        .lean()
        .exec(),
    ]);

    if (!user || !profile) {
      throw new InternalServerErrorException({
        error: 'PROFILE_NOT_FOUND',
        message: 'User profile not found',
      });
    }

    const latestRecord = records[records.length - 1] ?? null;
    const totals = records.map((record) => record.total_emission);
    const totalEmission = totals.reduce((sum, value) => sum + value, 0);
    const averageEmission = totals.length > 0 ? totalEmission / totals.length : 0;

    // AQI: use AqiFetcherService for stale cache fallback
    const aqi = await this.aqiFetcherService.getAqiForCity(user.city);

    return {
      range_days: rangeDays,
      emissions: records.map((record) => ({
        date: record.date,
        total_emission: record.total_emission,
      })),
      summary: {
        average_emission: round(averageEmission),
        days_with_data: records.length,
        max_emission: totals.length > 0 ? Math.max(...totals) : 0,
        min_emission: totals.length > 0 ? Math.min(...totals) : 0,
        total_emission: round(totalEmission),
      },
      trend: computeEmissionTrendFromTotals(totals),
      latest_breakdown:
        latestRecord === null
          ? null
          : {
              date: latestRecord.date,
              percentages: toBreakdownPercentages(latestRecord),
              values: latestRecord.breakdown,
            },
      performance_metrics: profile.performance_metrics,
      weekly_insights: profile.weekly_insights,
      projection:
        latestProjection === null
          ? null
          : {
              based_on_date: latestProjection.based_on_date,
              input_days: latestProjection.input_days,
              model_version: latestProjection.model_version,
              next_30_days: latestProjection.next_30_days,
              year_end_projection: latestProjection.year_end_projection,
            },
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
    };
  }
}

function toBreakdownPercentages(record: CarbonRecord) {
  const total = record.total_emission;
  if (total <= 0) {
    return {
      electricity: 0,
      food: 0,
      transport: 0,
      waste: 0,
    };
  }

  return {
    electricity: round((record.breakdown.electricity / total) * 100),
    food: round((record.breakdown.food / total) * 100),
    transport: round((record.breakdown.transport / total) * 100),
    waste: round((record.breakdown.waste / total) * 100),
  };
}

function round(value: number): number {
  return Number(value.toFixed(2));
}
