import { JobDispatcherService } from './job-dispatcher.service';

describe('JobDispatcherService', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('retries task-reset enqueue and succeeds before exhausting attempts', async () => {
    const taskQueue = {
      add: jest
        .fn()
        .mockRejectedValueOnce(new Error('redis unavailable'))
        .mockResolvedValueOnce(undefined),
    };
    const leaderboardQueue = {
      add: jest.fn(),
    };
    const errorLogService = {
      logFailure: jest.fn(),
    };

    const service = new JobDispatcherService(
      taskQueue as never,
      leaderboardQueue as never,
      errorLogService as never,
    );

    const run = service.dispatchTaskDailyReset();
    await jest.runOnlyPendingTimersAsync();
    await run;

    expect(taskQueue.add).toHaveBeenCalledTimes(2);
    expect(errorLogService.logFailure).not.toHaveBeenCalled();
  });

  it('logs a structured failure after leaderboard enqueue exhausts retries', async () => {
    const taskQueue = {
      add: jest.fn(),
    };
    const leaderboardQueue = {
      add: jest.fn().mockRejectedValue(new Error('redis offline')),
    };
    const errorLogService = {
      logFailure: jest.fn().mockResolvedValue(undefined),
    };

    const service = new JobDispatcherService(
      taskQueue as never,
      leaderboardQueue as never,
      errorLogService as never,
    );

    const run = service.dispatchLeaderboardUpdate();
    await jest.runAllTimersAsync();
    await run;

    expect(leaderboardQueue.add).toHaveBeenCalledTimes(3);
    expect(errorLogService.logFailure).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Failed to enqueue LEADERBOARD_UPDATE',
        module: 'leaderboard',
        retryCount: 3,
        type: 'NON_CRITICAL',
      }),
    );
  });
});
