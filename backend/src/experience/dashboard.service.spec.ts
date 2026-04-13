import { Types } from 'mongoose';
import { DashboardService } from './dashboard.service';
import { AqiFetcherService } from '../aqi/aqi-fetcher.service';

describe('DashboardService', () => {
  it('returns dashboard home data with AQI, task progress, and projections', async () => {
    const userId = new Types.ObjectId();
    const aqiFetcherService = {
      getAqiForCity: jest.fn().mockResolvedValue({
        aqi: 87,
        city: 'kolkata',
        co: 0.2,
        fetched_at: new Date('2026-04-12T00:00:00.000Z'),
        no2: 10,
        pm10: 55,
        pm25: 32,
        so2: 4,
      }),
    };

    const service = new DashboardService(
      {
        findById: jest.fn().mockReturnValue(
          createQuery({
            _id: userId,
            city: 'Kolkata',
            created_at: new Date('2026-04-01T00:00:00.000Z'),
            email: 'user@example.com',
            name: 'Carbon User',
            profile_picture_url: 'https://example.com/avatar.png',
            role: 'student',
            updated_at: new Date('2026-04-01T00:00:00.000Z'),
          }),
        ),
      } as never,
      {
        findOne: jest.fn().mockReturnValue(
          createQuery({
            last_streak_update: '2026-04-12',
            onboarding_completed: true,
            onboarding_defaults: null,
            performance_metrics: {
              baseline_emission: 10,
              baseline_status: 'locked',
              current_avg_emission: 8,
              reduction_percent: 20,
            },
            streak_days: 4,
            weekly_insights: {
              average_weekly_emission: 11,
              avg_ac_hours: 3,
              avg_distance: 5,
              avg_energy_usage: 6,
              avg_transport_mode: 'bus',
              diet_non_veg_day_fraction: 0.25,
              eco_action_score: 2,
              emission_trend: 'decreasing',
              last_weekly_submission_date: '2026-04-12',
              latest_weekly_emission: 9,
              total_weeks_logged: 2,
            },
          }),
        ),
      } as never,
      {
        find: jest.fn().mockReturnValue(
          createSortedQuery([
            createCarbonRecord('2026-04-10', 9),
            createCarbonRecord('2026-04-11', 8),
            createCarbonRecord('2026-04-12', 7),
          ]),
        ),
        findOne: jest.fn().mockReturnValue(createQuery(createCarbonRecord('2026-04-12', 7))),
      } as never,
      {
        findOne: jest.fn().mockReturnValue(
          createQuery({
            date: '2026-04-12',
            tasks: [
              { status: 'completed' },
              { status: 'pending' },
              { status: 'completed' },
            ],
          }),
        ),
      } as never,
      {} as never,
      aqiFetcherService as unknown as AqiFetcherService,
    );

    const result = await service.getHome(userId);

    expect(result.user.profile_picture_url).toBe('https://example.com/avatar.png');
    expect(result.today_emission?.total_emission).toBe(7);
    expect(result.tasks_progress).toMatchObject({
      completed: 2,
      pending: 1,
      total: 3,
    });
    expect(result.aqi?.city).toBe('kolkata');
    expect(result.projection?.next_30_days).toHaveLength(30);
    expect(result.projection?.next_12_months).toHaveLength(12);
    expect(result.onboarding_completed).toBe(true);
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
      food: 2,
      transport: 1,
      waste: 1,
    },
    created_at: new Date(`${date}T00:00:00.000Z`),
    date,
    total_emission: totalEmission,
    user_id: new Types.ObjectId(),
  };
}
