import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LivekitController } from './livekit.controller';
import { LivekitService } from './livekit.service';

@Module({
  imports: [ConfigModule], // นำเข้า ConfigModule เพื่อให้ Service อ่าน .env ได้
  controllers: [LivekitController],
  providers: [LivekitService],
})
export class LivekitModule {}
