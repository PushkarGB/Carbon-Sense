import { Types } from 'mongoose';
import { ProjectionJobService } from './projection-job.service';

describe('ProjectionJobService', () => {
  const userId = new Types.ObjectId();
  const todayYmd = '2026-04-23';

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('stores insufficient_data when fewer than 7 records are available', async () => {
    const { carbonRecordModel, userProjectionModel, service } =
      createService({
        records: createRecords(6),
      });

    const status = await service.runProjectionUpdateForUser(userId, todayYmd);

    expect(status).toBe('insufficient_data');
    expect(carbonRecordModel.find).toHaveBeenCalledWith({ user_id: userId });
    expect(userProjectionModel.updateOne).toHaveBeenCalledWith(
      { based_on_date: todayYmd, user_id: userId },
      expect.objectContaining({
        $set: expect.objectContaining({
          input_days: 6,
          model_version: 'ml_projection_linear_profile_v1',
          next_30_days: [],
          status: 'insufficient_data',
          year_end_projection: null,
        }),
      }),
      { upsert: true },
    );
  });

  it('persists ML response when scorer endpoint succeeds', async () => {
    const fetchSpy = jest
      .spyOn(global, 'fetch' as unknown as keyof typeof global)
      .mockResolvedValue({
        ok: true,
        json: async () => ({
          model_version: 'ml_projection_linear_profile_v2',
          next_30_days: [
            { date: '2026-04-24', predicted_emission: 11.11 },
            { date: '2026-04-25', predicted_emission: 10.98 },
          ],
          year_end_projection: {
            date: '2026-12-31',
            predicted_emission: 8.75,
          },
        }),
      } as Response);

    const { userProjectionModel, service } = createService({
      records: createRecords(7),
    });

    const status = await service.runProjectionUpdateForUser(userId, todayYmd);

    expect(status).toBe('ready');
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const [url, init] = fetchSpy.mock.calls[0] ?? [];
    expect(url).toBe('http://127.0.0.1:8001/api/projections/score');
    expect(init).toMatchObject({ method: 'POST' });

    const payload = JSON.parse(String((init as RequestInit).body));
    expect(payload.targets.next_days).toBe(30);
    expect(payload.history).toHaveLength(7);
    expect(payload.profile.performance_metrics.current_avg_emission).toBe(12);

    expect(userProjectionModel.updateOne).toHaveBeenCalledWith(
      { based_on_date: todayYmd, user_id: userId },
      expect.objectContaining({
        $set: expect.objectContaining({
          model_version: 'ml_projection_linear_profile_v2',
          next_30_days: [
            { date: '2026-04-24', predicted_emission: 11.11 },
            { date: '2026-04-25', predicted_emission: 10.98 },
          ],
          status: 'ready',
          year_end_projection: {
            date: '2026-12-31',
            predicted_emission: 8.75,
          },
        }),
      }),
      { upsert: true },
    );
  });

  it('falls back to backend scorer when ML endpoint fails', async () => {
    jest
      .spyOn(global, 'fetch' as unknown as keyof typeof global)
      .mockRejectedValue(new Error('connection refused'));

    const { userProjectionModel, service } = createService({
      records: createRecords(8),
    });

    const status = await service.runProjectionUpdateForUser(userId, todayYmd);

    expect(status).toBe('ready');
    expect(userProjectionModel.updateOne).toHaveBeenCalledWith(
      { based_on_date: todayYmd, user_id: userId },
      expect.objectContaining({
        $set: expect.objectContaining({
          model_version: 'projection_v1_linear_weighted',
          status: 'ready',
          next_30_days: expect.any(Array),
          year_end_projection: expect.objectContaining({
            date: '2026-12-31',
          }),
        }),
      }),
      { upsert: true },
    );

    const updateCall = userProjectionModel.updateOne.mock.calls[0] ?? [];
    const updateBody = updateCall[1] as {
      $set: { next_30_days: Array<{ date: string; predicted_emission: number }> };
    };
    expect(updateBody.$set.next_30_days).toHaveLength(30);
  });
});

function createService(params: { records: Array<{ date: string; total_emission: number }> }) {
  const chain = {
    sort: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(params.records),
  };

  const carbonRecordModel = {
    find: jest.fn().mockReturnValue(chain),
  };

  const userProfileModel = {
    findOne: jest.fn().mockReturnValue({
      lean: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          behavior_profile: { eco_action_score: 4 },
          performance_metrics: {
            baseline_emission: 14,
            baseline_status: 'locked',
            current_avg_emission: 12,
            reduction_percent: 10,
          },
          task_stats: {
            emission_reduction: 6,
          },
        }),
      }),
    }),
  };

  const userProjectionModel = {
    updateOne: jest.fn().mockResolvedValue(undefined),
  };

  return {
    carbonRecordModel,
    userProjectionModel,
    service: new ProjectionJobService(
      carbonRecordModel as never,
      userProfileModel as never,
      userProjectionModel as never,
    ),
  };
}

function createRecords(count: number): Array<{ date: string; total_emission: number }> {
  const records: Array<{ date: string; total_emission: number }> = [];
  for (let i = 0; i < count; i += 1) {
    const day = String(i + 1).padStart(2, '0');
    records.push({
      date: `2026-04-${day}`,
      total_emission: 14 - i * 0.5,
    });
  }
  return records;
}
