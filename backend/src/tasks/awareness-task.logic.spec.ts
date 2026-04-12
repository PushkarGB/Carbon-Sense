import { evaluateAwarenessTaskCompletion } from './awareness-task.logic';

describe('awareness-task.logic', () => {
  it('completes check_aqi when the client signal is true', () => {
    expect(
      evaluateAwarenessTaskCompletion(
        {
          category: 'awareness',
          completion_type: 'auto',
          task_id: 'check_aqi',
        },
        { aqi_screen_viewed: true },
      ),
    ).toBe(true);
  });

  it('does not complete without a positive signal', () => {
    expect(
      evaluateAwarenessTaskCompletion(
        {
          category: 'awareness',
          completion_type: 'auto',
          task_id: 'check_aqi',
        },
        {},
      ),
    ).toBe(false);
  });
});
