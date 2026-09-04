/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplicationContext, Logger } from '@nestjs/common';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;
  private readonly logger = new Logger(RedisIoAdapter.name);
  constructor(app: INestApplicationContext) {
    super(app);
  }

  async connectToRedis(): Promise<void> {
    const host = process.env.REDIS_HOST || '127.0.0.1';
    const port = Number(process.env.REDIS_PORT) || 6379;

    this.logger.log(`⏳ Attempting to connect to Redis at ${host}:${port}...`);

    const redisOptions = {
      host,
      port,
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        if (times > 5) {
          return null; // หยุด retry หลังพยายามครบ 5 ครั้ง
        }
        return Math.min(times * 500, 2000);
      },
    };

    const pubClient = new Redis(redisOptions);

    // Event listeners สำหรับ Debug สถานะ
    pubClient.on('connect', () => {
      this.logger.log(`🔌 Redis pubClient connected to ${host}:${port}`);
    });

    pubClient.on('ready', () => {
      this.logger.log(`✅ Redis pubClient is READY to accept commands!`);
    });

    pubClient.on('error', (err) => {
      this.logger.error(`❌ Redis pubClient Error: ${err.message}`);
    });

    try {
      await pubClient.connect();
      const subClient = pubClient.duplicate();

      subClient.on('connect', () => {
        this.logger.log(`🔌 Redis subClient connected`);
      });

      subClient.on('error', (err) => {
        this.logger.error(`❌ Redis subClient Error: ${err.message}`);
      });

      await subClient.connect();

      this.adapterConstructor = createAdapter(pubClient, subClient);
      this.logger.log(`🚀 Socket.io Redis Adapter successfully initialized!`);
    } catch (error) {
      this.logger.error(
        `🚨 Fatal: Failed to establish Redis connection - ${(error as Error).message}`,
      );
      throw error;
    }
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const serverOptions: Partial<ServerOptions> = {
      ...options,
      cors: {
        origin: '*',
        credentials: true,
      },
    };

    const server = super.createIOServer(port, serverOptions);
    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
      this.logger.log(
        `📡 Redis Adapter attached to Socket.io Server (Port: ${port})`,
      );
    }
    return server;
  }
}
