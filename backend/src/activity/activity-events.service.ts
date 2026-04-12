import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'node:events';

export const EMISSION_UPDATED_EVENT = 'EMISSION_UPDATED';
export const TASK_EVALUATED_EVENT = 'TASK_EVALUATED';
export const STREAK_UPDATED_EVENT = 'STREAK_UPDATED';

export interface StreakUpdatedEventPayload {
  userId: string;
  date: string;
  streakDays: number;
}

export interface TaskEvaluatedEventPayload {
  userId: string;
  date: string;
  completedTaskIds: string[];
}

export interface EmissionUpdatedEventPayload {
  userId: string;
  date: string;
  totalEmission: number;
  breakdown: {
    transport: number;
    electricity: number;
    food: number;
    waste: number;
  };
}

@Injectable()
export class ActivityEventsService {
  private readonly emitter = new EventEmitter();

  emitTaskEvaluated(payload: TaskEvaluatedEventPayload): void {
    this.emitter.emit(TASK_EVALUATED_EVENT, payload);
  }

  emitEmissionUpdated(payload: EmissionUpdatedEventPayload): void {
    this.emitter.emit(EMISSION_UPDATED_EVENT, payload);
  }

  emitStreakUpdated(payload: StreakUpdatedEventPayload): void {
    this.emitter.emit(STREAK_UPDATED_EVENT, payload);
  }

  on(
    eventName: typeof TASK_EVALUATED_EVENT | typeof EMISSION_UPDATED_EVENT | typeof STREAK_UPDATED_EVENT,
    listener: (...args: unknown[]) => void,
  ): void {
    this.emitter.on(eventName, listener);
  }
}
