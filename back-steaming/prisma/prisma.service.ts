/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private pool: Pool;
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const connectionString = process.env.DATABASE_URL;

    const pool = new Pool({ connectionString });

    const adapter = new PrismaPg(pool);

    super({
      adapter,
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
    });

    this.pool = pool;

    // 1. ดัก Pool Events จาก pg driver
    this.pool.on('connect', () => {
      this.logger.debug(
        `🔌 New pg client connected to pool (Total clients: ${this.pool.totalCount})`,
      );
    });

    this.pool.on('error', (err) => {
      this.logger.error(
        `❌ Unexpected error on idle pg client: ${err.message}`,
        err.stack,
      );
    });

    // 2. ดัก Prisma Client Events
    (this as any).$on('error', (e: any) => {
      this.logger.error(`❌ Prisma Engine Error: ${e.message}`);
    });
  }

  async onModuleInit() {
    this.logger.log('⏳ Connecting to PostgreSQL database...');

    try {
      // 1. เชื่อมต่อ Prisma Engine
      await this.$connect();

      // 2. รัน Query ทดสอบจริง พร้อมดึงข้อมูล Database
      const result: any = await this.$queryRaw`
        SELECT current_database() as db, version() as ver, NOW() as server_time;
      `;

      const dbName = result[0]?.db;
      const serverTime = result[0]?.server_time;
      const fullVersion = result[0]?.ver || '';
      const pgVersion = fullVersion.split(' ')[1] || 'Unknown';

      this.logger.log(`✅ Successfully connected to PostgreSQL!`);
      this.logger.log(`📦 Database: "${dbName}" | PostgreSQL v${pgVersion}`);
      this.logger.log(`🕒 Database Server Time: ${serverTime}`);
    } catch (error) {
      this.logger.error(
        `🚨 Failed to connect to PostgreSQL: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async onModuleDestroy() {
    this.logger.log('🔌 Disconnecting from PostgreSQL...');
    await this.$disconnect();
    this.logger.log('✅ Disconnected from Prisma Client');

    this.logger.log('🔌 Closing database connection pool...');
    await this.pool.end();
    this.logger.log('✅ Database connection pool completely closed');
  }
}
