import { Types } from 'mongoose';
import { InsightsService } from './insights.service';
import { AqiFetcherService } from '../aqi/aqi-fetcher.service';

describe('InsightsService', () => {
  it('builds chart summary, percentages, and weekly insights for the requested range', async () => {
    const userId = new Types.ObjectId();
    const aqiFetcherService = {
      getAqiForCity: jest.fn().mockResolvedValue({
        aqi: 80,
        city: 'kolkata',
        co: 0.3,
        fetched_at: new Date('2026-04-12T00:00:00.000Z'),
        no2: 12,
        pm10: 40,
        pm25: 28,
        so2: 3,
      }),
    };

    const service = new InsightsService(
      {
        findById: jest.fn().mockReturnValue(
          createQuery({
            _id: userId,
            city: 'Kolkata',
          }),
        ),
      } as never,
      {
        findOne: jest.fn().mockReturnValue(
          createQuery({
            performance_metrics: {
              baseline_emission: 12,
              baseline_status: 'locked',
              current_avg_emission: 8,
              reduction_percent: 33.3,
            },
            weekly_insights: {
              average_weekly_emission: 10,
              avg_ac_hours: 2,
              avg_distance: 4,
              avg_energy_usage: 5,
              avg_transport_mode: 'walk',
              diet_non_veg_day_fraction: 0.2,
              eco_action_score: 2,
              emission_trend: 'stable',
              last_weekly_submission_date: '2026-04-12',
              latest_weekly_emission: 9,
              total_weeks_logged: 3,
            },
          }),
        ),
      } as never,
      {
        find: jest.fn().mockReturnValue(
          createSortedQuery([
            createCarbonRecord('2026-04-10', 8),
            createCarbonRecord('2026-04-11', 7),
            createCarbonRecord('2026-04-12', 6),
          ]),
        ),
      } as never,
      {
        findOne: jest.fn().mockReturnValue(
          createSortedQuery({
            based_on_date: '2026-04-12',
            input_days: 12,
            model_version: 'projection_v1_linear_weighted',
            next_30_days: [
              { date: '2026-04-13', predicted_emission: 6.1 },
            ],
            year_end_projection: {
              date: '2026-12-31',
              predicted_emission: 5.2,
            },
          }),
        ),
      } as never,
      {} as never,
      aqiFetcherService as unknown as AqiFetcherService,
    );

    const result = await service.getSummary(userId, 7);

    expect(result.range_days).toBe(7);
    expect(result.emissions).toHaveLength(3);
    expect(result.summary.average_emission).toBe(7);
    expect(result.latest_breakdown?.percentages.electricity).toBeGreaterThan(0);
    expect(result.projection?.year_end_projection?.date).toBe('2026-12-31');
    expect(result.aqi?.aqi).toBe(80);
    expect(result.weekly_insights.total_weeks_logged).toBe(3);
  });
});

function createQuery<T>(value: T) {
  return {
    exec: jest.fn().mockResolvedValue(value),
    lean: jest.fn().mockReturnThis(),
  };
}

function createSortedQuery<T>(value: T) {
  return {
    exec: jest.fn().mockResolvedValue(value),
    lean: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
  };
}

function createCarbonRecord(date: string, totalEmission: number) {
  return {
    breakdown: {
      electricity: 3,
      food: 1.5,
      transport: 1,
      waste: 0.5,
    },
    created_at: new Date(`${date}T00:00:00.000Z`),
    date,
    total_emission: totalEmission,
    user_id: new Types.ObjectId(),
  };
}
