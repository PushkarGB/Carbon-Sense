import { Injectable } from '@nestjs/common';
import { Socket } from 'node:net';

type RedisValue = string | number | null;

@Injectable()
export class RedisCacheService {
  async getJson<T>(key: string): Promise<T | null> {
    const response = await this.execute(['GET', key]);
    if (typeof response !== 'string') {
      return null;
    }

    try {
      return JSON.parse(response) as T;
    } catch {
      return null;
    }
  }

  async setJson(
    key: string,
    value: unknown,
    ttlSeconds: number,
  ): Promise<boolean> {
    const payload = JSON.stringify(value);
    const response = await this.execute(['SETEX', key, `${ttlSeconds}`, payload]);
    return response === 'OK';
  }

  private async execute(command: string[]): Promise<RedisValue> {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      return null;
    }

    const config = this.parseRedisUrl(redisUrl);
    if (!config) {
      return null;
    }

    return new Promise<RedisValue>((resolve) => {
      const socket = new Socket();
      let buffer = '';
      let settled = false;

      const settle = (value: RedisValue): void => {
        if (settled) {
          return;
        }
        settled = true;
        socket.destroy();
        resolve(value);
      };

      socket.setTimeout(1500);
      socket.once('timeout', () => settle(null));
      socket.once('error', () => settle(null));
      socket.connect(config.port, config.host, async () => {
        try {
          if (config.password) {
            const authResult = await this.writeAndRead(
              socket,
              buffer,
              ['AUTH', config.password],
            );
            buffer = authResult.buffer;
            if (authResult.value === null) {
              settle(null);
              return;
            }
          }

          const result = await this.writeAndRead(socket, buffer, command);
          settle(result.value);
        } catch {
          settle(null);
        }
      });

      socket.on('data', (chunk: Buffer) => {
        buffer += chunk.toString('utf8');
      });
    });
  }

  private parseRedisUrl(
    redisUrl: string,
  ): { host: string; port: number; password: string | null } | null {
    try {
      const parsed = new URL(redisUrl);
      return {
        host: parsed.hostname,
        password: parsed.password || null,
        port: parsed.port ? Number(parsed.port) : 6379,
      };
    } catch {
      return null;
    }
  }

  private async writeAndRead(
    socket: Socket,
    initialBuffer: string,
    command: string[],
  ): Promise<{ value: RedisValue; buffer: string }> {
    let buffer = initialBuffer;
    socket.write(serializeRedisCommand(command));

    while (true) {
      const parsed = parseRedisResponse(buffer);
      if (parsed) {
        return parsed;
      }

      buffer += await new Promise<string>((resolve, reject) => {
        const onData = (chunk: Buffer): void => {
          cleanup();
          resolve(chunk.toString('utf8'));
        };
        const onError = (): void => {
          cleanup();
          reject(new Error('Redis read failed'));
        };
        const onTimeout = (): void => {
          cleanup();
          reject(new Error('Redis read timeout'));
        };
        const cleanup = (): void => {
          socket.off('data', onData);
          socket.off('error', onError);
          socket.off('timeout', onTimeout);
        };

        socket.once('data', onData);
        socket.once('error', onError);
        socket.once('timeout', onTimeout);
      });
    }
  }
}

function serializeRedisCommand(parts: string[]): string {
  const chunks = [`*${parts.length}\r\n`];
  for (const part of parts) {
    chunks.push(`$${Buffer.byteLength(part, 'utf8')}\r\n${part}\r\n`);
  }
  return chunks.join('');
}

function parseRedisResponse(
  buffer: string,
): { value: RedisValue; buffer: string } | null {
  if (buffer.length === 0) {
    return null;
  }

  const prefix = buffer[0];
  const lineEnd = buffer.indexOf('\r\n');
  if (lineEnd === -1) {
    return null;
  }

  if (prefix === '+') {
    return {
      buffer: buffer.slice(lineEnd + 2),
      value: buffer.slice(1, lineEnd),
    };
  }

  if (prefix === '-') {
    return {
      buffer: buffer.slice(lineEnd + 2),
      value: null,
    };
  }

  if (prefix === ':') {
    return {
      buffer: buffer.slice(lineEnd + 2),
      value: Number(buffer.slice(1, lineEnd)),
    };
  }

  if (prefix !== '$') {
    return null;
  }

  const bulkLength = Number(buffer.slice(1, lineEnd));
  if (bulkLength === -1) {
    return {
      buffer: buffer.slice(lineEnd + 2),
      value: null,
    };
  }

  const totalLength = lineEnd + 2 + bulkLength + 2;
  if (buffer.length < totalLength) {
    return null;
  }

  return {
    buffer: buffer.slice(totalLength),
    value: buffer.slice(lineEnd + 2, lineEnd + 2 + bulkLength),
  };
}
