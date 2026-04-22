import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import {
  ErrorLogModule,
  ErrorLogService,
  ErrorLogType,
} from './error-log.service';

type RequestWithUser = Request & {
  user?: {
    _id?: Types.ObjectId | string;
  };
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly errorLogService: ErrorLogService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<RequestWithUser>();
    const response = http.getResponse<Response>();

    const normalized = normalizeException(exception);
    const module = inferModuleFromPath(request.path ?? request.url);
    const type = inferErrorType(module);

    void this.errorLogService.logFailure({
      type,
      module,
      userId: request.user?._id,
      message: normalized.message,
      payload: {
        error: normalized.error,
        method: request.method,
        path: request.originalUrl ?? request.url,
        statusCode: normalized.statusCode,
        body: sanitizeUnknown(request.body),
        params: sanitizeUnknown(request.params),
        query: sanitizeUnknown(request.query),
      },
      error: exception,
    });

    response.status(normalized.statusCode).json({
      error: normalized.error,
      message: normalized.message,
    });
  }
}

function normalizeException(exception: unknown): {
  statusCode: number;
  error: string;
  message: string;
} {
  if (exception instanceof HttpException) {
    const statusCode = exception.getStatus();
    const response = exception.getResponse();

    if (typeof response === 'string') {
      return {
        statusCode,
        error: defaultErrorCode(statusCode),
        message: response,
      };
    }

    if (response && typeof response === 'object') {
      const body = response as Record<string, unknown>;
      return {
        statusCode,
        error:
          typeof body.error === 'string' && isStableErrorCode(body.error)
            ? body.error
            : defaultErrorCode(statusCode),
        message: coerceMessage(body.message, statusCode),
      };
    }

    return {
      statusCode,
      error: defaultErrorCode(statusCode),
      message: defaultMessage(statusCode),
    };
  }

  return {
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    error: 'INTERNAL_ERROR',
    message: 'Internal server error',
  };
}

function coerceMessage(message: unknown, statusCode: number): string {
  if (Array.isArray(message)) {
    return message.join('; ');
  }

  if (typeof message === 'string' && message.trim().length > 0) {
    return message;
  }

  return defaultMessage(statusCode);
}

function defaultErrorCode(statusCode: number): string {
  switch (statusCode) {
    case HttpStatus.BAD_REQUEST:
      return 'BAD_REQUEST';
    case HttpStatus.UNAUTHORIZED:
      return 'UNAUTHORIZED';
    case HttpStatus.FORBIDDEN:
      return 'FORBIDDEN';
    case HttpStatus.NOT_FOUND:
      return 'NOT_FOUND';
    case HttpStatus.CONFLICT:
      return 'CONFLICT';
    default:
      return 'INTERNAL_ERROR';
  }
}

function defaultMessage(statusCode: number): string {
  switch (statusCode) {
    case HttpStatus.BAD_REQUEST:
      return 'Bad request';
    case HttpStatus.UNAUTHORIZED:
      return 'Unauthorized';
    case HttpStatus.FORBIDDEN:
      return 'Forbidden';
    case HttpStatus.NOT_FOUND:
      return 'Not found';
    case HttpStatus.CONFLICT:
      return 'Conflict';
    default:
      return 'Internal server error';
  }
}

function isStableErrorCode(value: string): boolean {
  return /^[A-Z0-9_]+$/.test(value);
}

function inferModuleFromPath(path: string): ErrorLogModule | undefined {
  if (path.startsWith('/activity')) {
    return 'submission';
  }

  if (path.startsWith('/tasks')) {
    return 'task';
  }

  if (path.startsWith('/leaderboard')) {
    return 'leaderboard';
  }

  return undefined;
}

function inferErrorType(
  module: ErrorLogModule | undefined,
): ErrorLogType {
  if (module === 'badge' || module === 'leaderboard' || module === 'projection') {
    return 'NON_CRITICAL';
  }

  return 'CRITICAL';
}

function sanitizeUnknown(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeUnknown(entry));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        isSensitiveKey(key) ? '[REDACTED]' : sanitizeUnknown(entry),
      ]),
    );
  }

  return value;
}

function isSensitiveKey(key: string): boolean {
  return ['password', 'password_hash', 'access_token', 'token'].includes(
    key.toLowerCase(),
  );
}
