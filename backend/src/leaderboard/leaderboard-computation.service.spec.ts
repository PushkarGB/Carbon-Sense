import { Types } from 'mongoose';
import { LeaderboardComputationService } from './leaderboard-computation.service';

describe('LeaderboardComputationService', () => {
  it('lists ranked rows with avatars for the requested scope', async () => {
    const userId = new Types.ObjectId();
    const service = new LeaderboardComputationService(
      {} as never,
      {
        aggregate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([
            {
              avg_emission: 5,
              city: 'Kolkata',
              name: 'Alice',
              profile_picture_url: 'https://example.com/alice.png',
              role: 'student',
              total_days_logged: 10,
              total_emission: 50,
              updated_at: new Date('2026-04-12T00:00:00.000Z'),
              user_id: userId,
            },
            {
              avg_emission: 6,
              city: 'Kolkata',
              name: 'Bob',
              profile_picture_url: 'https://example.com/bob.png',
              role: 'student',
              total_days_logged: 9,
              total_emission: 54,
              updated_at: new Date('2026-04-12T00:00:00.000Z'),
              user_id: new Types.ObjectId(),
            },
          ]),
        }),
        exists: jest.fn().mockResolvedValue(true),
      } as never,
      {
        findById: jest.fn().mockReturnValue(
          createQuery({
            _id: userId,
            city: 'Kolkata',
            role: 'student',
          }),
        ),
      } as never,
    );

    const result = await service.listForUserContext(userId, {
      limit: 10,
      scope: 'city',
    });

    expect(result.scope).toBe('city');
    expect(result.scope_value).toBe('Kolkata');
    expect(result.current_user_rank).toBe(1);
    expect(result.rows[0]).toMatchObject({
      is_current_user: true,
      name: 'Alice',
      profile_picture_url: 'https://example.com/alice.png',
      rank: 1,
    });
  });
});

function createQuery<T>(value: T) {
  return {
    exec: jest.fn().mockResolvedValue(value),
    lean: jest.fn().mockReturnThis(),
  };
}
