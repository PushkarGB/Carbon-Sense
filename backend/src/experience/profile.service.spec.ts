import { Types } from 'mongoose';
import { ProfileService } from './profile.service';

describe('ProfileService', () => {
  it('returns profile basics, badge gallery state, and leaderboard snapshot', async () => {
    const userId = new Types.ObjectId();
    const service = new ProfileService(
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
            behavior_profile: {
              avg_ac_hours: 3,
              avg_distance: 5,
              avg_energy_usage: 4,
              avg_transport_mode: 'bus',
              eco_action_score: 1,
            },
            engagement_metrics: {
              app_open_count: 10,
              task_completion_rate: 0.75,
              total_tasks_completed: 7,
              total_days_logged: 7,
            },
            onboarding_completed: true,
            performance_metrics: {
              baseline_emission: 10,
              baseline_status: 'locked',
              current_avg_emission: 8,
              reduction_percent: 20,
            },
            streak_days: 5,
            task_stats: {
              awareness: 1,
              eco_action: 4,
              emission_reduction: 2,
            },
            weekly_insights: {
              average_weekly_emission: 9,
              avg_ac_hours: 2,
              avg_distance: 4,
              avg_energy_usage: 5,
              avg_transport_mode: 'walk',
              diet_non_veg_day_fraction: 0.2,
              eco_action_score: 2,
              emission_trend: 'stable',
              last_weekly_submission_date: '2026-04-12',
              latest_weekly_emission: 8,
              total_weeks_logged: 3,
            },
          }),
        ),
      } as never,
      {
        find: jest.fn().mockReturnValue(
          createSortedQuery([
            {
              active: true,
              badge_id: 'eco_5',
              category: 'eco_action',
              description: 'Complete 5 eco action tasks',
              icon_url: 'https://example.com/badge.svg',
              name: 'Green Starter',
              threshold: 5,
              tier: 'bronze',
              type: 'task',
              value: 10,
            },
            {
              active: true,
              badge_id: 'streak_5',
              category: 'streak',
              description: 'Maintain a 5-day streak',
              icon_url: 'https://example.com/streak.svg',
              name: 'Consistency Kickoff',
              threshold: 5,
              tier: 'bronze',
              type: 'streak',
              value: 10,
            },
          ]),
        ),
      } as never,
      {
        find: jest.fn().mockReturnValue(
          createQuery([
            {
              awarded_at: new Date('2026-04-12T00:00:00.000Z'),
              badge_id: 'streak_5',
              user_id: userId,
            },
          ]),
        ),
      } as never,
      {
        findOne: jest.fn().mockReturnValue(
          createQuery({
            avg_emission: 7.5,
            total_days_logged: 7,
            total_emission: 52.5,
            updated_at: new Date('2026-04-12T00:00:00.000Z'),
            user_id: userId,
          }),
        ),
      } as never,
    );

    const result = await service.getMe(userId);

    expect(result.user.profile_picture_url).toBe('https://example.com/avatar.png');
    expect(result.badges).toHaveLength(2);
    expect(result.badges.find((badge) => badge.badge_id === 'streak_5')?.achieved).toBe(true);
    expect(result.summary.badges_unlocked).toBe(1);
    expect(result.leaderboard?.avg_emission).toBe(7.5);
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
