import type {
  EmissionUpdatedEventPayload,
  StreakUpdatedEventPayload,
  TaskEvaluatedEventPayload,
} from '../activity/activity-events.service';

export type BadgeRetryTriggerEvent =
  | 'TASK_EVALUATED'
  | 'STREAK_UPDATED'
  | 'EMISSION_UPDATED';

/**
 * Error Handling & System Resilience (v1.2) §6 example:
 * `{ "type": "BADGE_RETRY", "payload": { user_id, trigger_event } }`
 * Payload carries the original event body; `user_id` is available as `payload.userId`
 * on the nested activity payloads (Execution Flow naming).
 */
export type BadgeRetryJobData = {
  type: 'BADGE_RETRY';
  trigger_event: BadgeRetryTriggerEvent;
  payload:
    | TaskEvaluatedEventPayload
    | StreakUpdatedEventPayload
    | EmissionUpdatedEventPayload;
};
