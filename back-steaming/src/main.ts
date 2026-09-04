import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RedisIoAdapter } from './module/chat/redis-io.adapter';
import { WinstonModule } from 'nest-winston';
import { winstonLoggerConfig } from './common/logger/winston.config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // เปลี่ยน Default Logger ของ NestJS ให้ใช้ Winston
    logger: WinstonModule.createLogger(winstonLoggerConfig),
  });

  app.enableCors({
    origin: true, // หรือระบุ ['http://localhost:3000']
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // ตัดฟิลด์ที่ไม่ได้นิยามใน DTO ออกอัตโนมัติ
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 2. ตั้งค่า Swagger Document
  const config = new DocumentBuilder()
    .setTitle('Live Streaming & Chat API')
    .setDescription('API Documentation สำหรับระบบ Streaming และ Real-time Chat')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const redisIoAdapter = new RedisIoAdapter(app);
  void redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
