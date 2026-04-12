import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'node:crypto';
import { Model, Types } from 'mongoose';
import type { ErrorLog } from '../schemas/error-log.schema';

export type ErrorLogModule = ErrorLog['module'];
export type ErrorLogType = ErrorLog['type'];

@Injectable()
export class ErrorLogService {
  private readonly logger = new Logger(ErrorLogService.name);

  constructor(
    @InjectModel('ErrorLog')
    private readonly errorLogModel: Model<ErrorLog>,
  ) {}

  async logFailure(params: {
    type: ErrorLogType;
    module?: ErrorLogModule;
    userId?: string | Types.ObjectId | null;
    message: string;
    payload?: unknown;
    retryCount?: number;
    error?: unknown;
  }): Promise<void> {
    const normalizedPayload = toRecord(params.payload);
    const stack =
      params.error instanceof Error ? params.error.stack : undefined;
    const summary = `[${params.type}] ${params.module ?? 'system'}: ${params.message}`;

    this.logger.error(summary, stack);

    if (!params.module) {
      return;
    }

    const userId = toObjectId(params.userId);
    if (!userId) {
      return;
    }

    try {
      await this.errorLogModel.create({
        error_id: randomUUID(),
        type: params.type,
        module: params.module,
        user_id: userId,
        message: params.message,
        payload: normalizedPayload,
        retry_count: params.retryCount ?? 0,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error(
        `Failed to write error_logs entry for ${params.module}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  logRetryAttempt(params: {
    queueName: string;
    jobId: string;
    attempt: number;
    maxAttempts: number;
    message: string;
  }): void {
    this.logger.warn(
      `[retry] ${params.queueName}/${params.jobId} attempt ${params.attempt}/${params.maxAttempts}: ${params.message}`,
    );
  }

  logJobExecution(params: {
    queueName: string;
    jobId: string;
    jobName: string;
  }): void {
    this.logger.log(
      `[job] ${params.queueName}/${params.jobId} executing ${params.jobName}`,
    );
  }
}

function toObjectId(
  userId: string | Types.ObjectId | null | undefined,
): Types.ObjectId | null {
  if (userId instanceof Types.ObjectId) {
    return userId;
  }

  if (typeof userId === 'string' && Types.ObjectId.isValid(userId)) {
    return new Types.ObjectId(userId);
  }

  return null;
}

function toRecord(payload: unknown): Record<string, unknown> {
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    return redactSecrets(payload as Record<string, unknown>);
  }

  return { value: payload ?? null };
}

function redactSecrets(
  value: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => {
      if (isSensitiveKey(key)) {
        return [key, '[REDACTED]'];
      }

      if (Array.isArray(entry)) {
        return [
          key,
          entry.map((item) =>
            item && typeof item === 'object' && !Array.isArray(item)
              ? redactSecrets(item as Record<string, unknown>)
              : item,
          ),
        ];
      }

      if (entry && typeof entry === 'object') {
        return [key, redactSecrets(entry as Record<string, unknown>)];
      }

      return [key, entry];
    }),
  );
}

function isSensitiveKey(key: string): boolean {
  return ['password', 'password_hash', 'access_token', 'token'].includes(
    key.toLowerCase(),
  );
}
