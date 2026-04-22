import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { addDaysToYmd, daysBetweenYmd } from '../tasks/task-generation.engine';
import { CarbonRecord } from '../schemas/carbon-record.schema';
import { UserProfile } from '../schemas/user-profile.schema';
import { UserProjection } from '../schemas/user-projection.schema';

const PROJECTION_MODEL_VERSION = 'projection_v1_linear_weighted';
const DEFAULT_ML_MODEL_VERSION = 'ml_projection_linear_profile_v1';
const DEFAULT_ML_TIMEOUT_MS = 3000;

@Injectable()
export class ProjectionJobService {
  private readonly logger = new Logger(ProjectionJobService.name);

  constructor(
    @InjectModel('CarbonRecord')
    private readonly carbonRecordModel: Model<CarbonRecord>,
    @InjectModel('UserProfile')
    private readonly userProfileModel: Model<UserProfile>,
    @InjectModel('UserProjection')
    private readonly userProjectionModel: Model<UserProjection>,
  ) {}

  async runProjectionUpdateForUser(
    userId: Types.ObjectId,
    todayYmd: string,
  ): Promise<'ready' | 'insufficient_data'> {
    const [records, profile] = await Promise.all([
      this.carbonRecordModel
        .find({ user_id: userId })
        .sort({ date: 1 })
        .lean()
        .exec(),
      this.userProfileModel.findOne({ user_id: userId }).lean().exec(),
    ]);

    if (!profile || records.length < 7) {
      await this.persistProjection(userId, todayYmd, {
        input_days: records.length,
        metadata: buildMetadata(profile),
        model_version: DEFAULT_ML_MODEL_VERSION,
        next_30_days: [],
        status: 'insufficient_data',
        year_end_projection: null,
      });
      return 'insufficient_data';
    }

    const mlPayload = buildMlPayload(records, profile, todayYmd);
    const mlResult = await this.tryScoreWithMlService(mlPayload);

    const scored =
      mlResult ??
      scoreWithFallbackLinearModel(
        records.map((record) => record.total_emission),
        profile,
        todayYmd,
      );

    await this.persistProjection(userId, todayYmd, {
      input_days: records.length,
      metadata: buildMetadata(profile),
      model_version: scored.modelVersion,
      next_30_days: scored.next30Days,
      status: 'ready',
      year_end_projection: scored.yearEndProjection,
    });

    return 'ready';
  }

  private async persistProjection(
    userId: Types.ObjectId,
    dateYmd: string,
    data: Pick<
      UserProjection,
      | 'status'
      | 'model_version'
      | 'input_days'
      | 'next_30_days'
      | 'year_end_projection'
      | 'metadata'
    >,
  ): Promise<void> {
    const now = new Date();
    await this.userProjectionModel.updateOne(
      { based_on_date: dateYmd, user_id: userId },
      {
        $set: {
          based_on_date: dateYmd,
          input_days: data.input_days,
          metadata: data.metadata,
          model_version: data.model_version,
          next_30_days: data.next_30_days,
          status: data.status,
          updated_at: now,
          year_end_projection: data.year_end_projection,
        },
        $setOnInsert: {
          created_at: now,
        },
      },
      { upsert: true },
    );
  }

  private async tryScoreWithMlService(
    payload: MlProjectionPayload,
  ): Promise<{
    modelVersion: string;
    next30Days: UserProjection['next_30_days'];
    yearEndProjection: UserProjection['year_end_projection'];
  } | null> {
    const endpoint =
      process.env.ML_PROJECTION_ENDPOINT ??
      'http://127.0.0.1:8001/api/projections/score';
    const timeoutMs = Number(
      process.env.ML_PROJECTION_TIMEOUT_MS ?? DEFAULT_ML_TIMEOUT_MS,
    );

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        this.logger.warn(
          `ML projection request failed: HTTP ${response.status}`,
        );
        return null;
      }

      const body = (await response.json()) as Record<string, unknown>;
      const parsed = parseMlResponse(body);
      if (!parsed) {
        this.logger.warn('ML projection response is invalid; using fallback');
      }
      return parsed;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`ML projection request failed: ${message}`);
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }
}

function buildYearEndProjection(
  todayYmd: string,
  base: number,
  slope: number,
): { date: string; predicted_emission: number } {
  const year = Number(todayYmd.slice(0, 4));
  const yearEnd = `${year}-12-31`;
  const daysToYearEnd = Math.max(0, daysBetweenYmd(todayYmd, yearEnd));
  return {
    date: yearEnd,
    predicted_emission: clampEmission(base + slope * daysToYearEnd),
  };
}

function buildMetadata(
  profile: UserProfile | null,
): UserProjection['metadata'] {
  if (!profile) {
    return {
      baseline_emission: 0,
      current_avg_emission: 0,
      reduction_percent: 0,
      eco_action_score: 0,
      emission_reduction_tasks: 0,
    };
  }

  return {
    baseline_emission: profile.performance_metrics.baseline_emission,
    current_avg_emission: profile.performance_metrics.current_avg_emission,
    reduction_percent: profile.performance_metrics.reduction_percent,
    eco_action_score: profile.behavior_profile.eco_action_score,
    emission_reduction_tasks: profile.task_stats.emission_reduction,
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

function clampEmission(value: number): number {
  return Number(Math.max(0, value).toFixed(2));
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

type MlProjectionPayload = {
  history: Array<{ date: string; total_emission: number }>;
  profile: {
    behavior_profile: {
      eco_action_score: number;
    };
    performance_metrics: {
      baseline_emission: number;
      current_avg_emission: number;
      reduction_percent: number;
    };
    task_stats: {
      emission_reduction: number;
    };
  };
  targets: {
    next_days: number;
    today: string;
    year_end_date: string;
  };
};

function buildMlPayload(
  records: CarbonRecord[],
  profile: UserProfile,
  todayYmd: string,
): MlProjectionPayload {
  const year = Number(todayYmd.slice(0, 4));
  return {
    history: records.map((record) => ({
      date: record.date,
      total_emission: record.total_emission,
    })),
    profile: {
      behavior_profile: {
        eco_action_score: profile.behavior_profile.eco_action_score,
      },
      performance_metrics: {
        baseline_emission: profile.performance_metrics.baseline_emission,
        current_avg_emission: profile.performance_metrics.current_avg_emission,
        reduction_percent: profile.performance_metrics.reduction_percent,
      },
      task_stats: {
        emission_reduction: profile.task_stats.emission_reduction,
      },
    },
    targets: {
      next_days: 30,
      today: todayYmd,
      year_end_date: `${year}-12-31`,
    },
  };
}

function parseMlResponse(body: Record<string, unknown>): {
  modelVersion: string;
  next30Days: UserProjection['next_30_days'];
  yearEndProjection: UserProjection['year_end_projection'];
} | null {
  const projection = body.next_30_days;
  if (!Array.isArray(projection) || projection.length === 0) {
    return null;
  }

  const next30Days: UserProjection['next_30_days'] = [];
  for (const row of projection) {
    if (!row || typeof row !== 'object') {
      return null;
    }
    const record = row as Record<string, unknown>;
    if (
      typeof record.date !== 'string' ||
      typeof record.predicted_emission !== 'number'
    ) {
      return null;
    }
    next30Days.push({
      date: record.date,
      predicted_emission: clampEmission(record.predicted_emission),
    });
  }

  const yearEnd = body.year_end_projection;
  if (!yearEnd || typeof yearEnd !== 'object') {
    return null;
  }
  const yearEndRecord = yearEnd as Record<string, unknown>;
  if (
    typeof yearEndRecord.date !== 'string' ||
    typeof yearEndRecord.predicted_emission !== 'number'
  ) {
    return null;
  }

  return {
    modelVersion:
      typeof body.model_version === 'string'
        ? body.model_version
        : DEFAULT_ML_MODEL_VERSION,
    next30Days,
    yearEndProjection: {
      date: yearEndRecord.date,
      predicted_emission: clampEmission(yearEndRecord.predicted_emission),
    },
  };
}

function scoreWithFallbackLinearModel(
  totals: number[],
  profile: UserProfile,
  todayYmd: string,
): {
  modelVersion: string;
  next30Days: UserProjection['next_30_days'];
  yearEndProjection: UserProjection['year_end_projection'];
} {
  const base =
    profile.performance_metrics.current_avg_emission > 0
      ? profile.performance_metrics.current_avg_emission
      : totals[totals.length - 1] ?? 0;
  const slope = linearSlope(totals);

  // Behavior/progress multipliers nudge trend based on profile signals.
  const reductionFactor =
    clamp(profile.performance_metrics.reduction_percent / 100, 0, 0.6) * 0.25;
  const ecoFactor =
    clamp(profile.behavior_profile.eco_action_score / 10, 0, 0.5) * 0.15;
  const taskFactor =
    clamp(profile.task_stats.emission_reduction / 100, 0, 0.5) * 0.1;
  const adjustedSlope = slope * (1 - reductionFactor - ecoFactor - taskFactor);

  const next30Days = Array.from({ length: 30 }, (_, index) => {
    const offset = index + 1;
    return {
      date: addDaysToYmd(todayYmd, offset),
      predicted_emission: clampEmission(base + adjustedSlope * offset),
    };
  });

  return {
    modelVersion: PROJECTION_MODEL_VERSION,
    next30Days,
    yearEndProjection: buildYearEndProjection(todayYmd, base, adjustedSlope),
  };
}