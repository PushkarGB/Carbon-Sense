/** Queue names from CarbonSense — Background Job Architecture (v1) §5 */
export const TASK_QUEUE_NAME = 'task_queue';
export const LEADERBOARD_QUEUE_NAME = 'leaderboard_queue';
export const BADGE_QUEUE_NAME = 'badge_queue';
export const PROJECTION_QUEUE_NAME = 'projection_queue';

/** Bull job names (Background Job Architecture §3–4, Execution Flow §6–9). */
export const JOB_NAME_TASK_RESET = 'TASK_RESET';
export const JOB_NAME_TASK_GENERATE_SINGLE = 'TASK_GENERATE_SINGLE';
export const JOB_NAME_LEADERBOARD_UPDATE = 'LEADERBOARD_UPDATE';
export const JOB_NAME_BADGE_RETRY = 'BADGE_RETRY';
export const JOB_NAME_PROJECTION_UPDATE = 'PROJECTION_UPDATE';

/**
 * BullMQ numeric priority (higher runs first). Maps doc §5: task reset high,
 * leaderboard medium, badge retry low.
 */
export const JOB_PRIORITY_HIGH = 10;
export const JOB_PRIORITY_MEDIUM = 5;
export const JOB_PRIORITY_LOW = 1;

export const DEFAULT_JOB_ATTEMPTS = 3;

export const DEFAULT_JOB_BACKOFF_MS = 2000;
