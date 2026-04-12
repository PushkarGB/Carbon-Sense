import { TaskTemplate } from '../schemas/task-template.schema';

export interface AwarenessEvaluationSignals {
  aqi_screen_viewed?: boolean;
  insights_screen_viewed?: boolean;
  comparison_viewed?: boolean;
  trend_viewed?: boolean;
}

export function evaluateAwarenessTaskCompletion(
  task: Pick<TaskTemplate, 'task_id' | 'category' | 'completion_type'>,
  signals: AwarenessEvaluationSignals,
): boolean {
  if (task.category !== 'awareness' || task.completion_type !== 'auto') {
    return false;
  }

  switch (task.task_id) {
    case 'check_aqi':
      return signals.aqi_screen_viewed === true;
    case 'view_insights':
      return signals.insights_screen_viewed === true;
    case 'compare_day':
      return signals.comparison_viewed === true;
    case 'trend_watch':
      return signals.trend_viewed === true;
    default:
      return false;
  }
}
