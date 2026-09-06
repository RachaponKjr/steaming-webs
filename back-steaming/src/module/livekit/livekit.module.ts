import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { LivekitController } from './livekit.controller';
import { LivekitService } from './livekit.service';

@Module({
  imports: [ConfigModule, PassportModule],
  controllers: [LivekitController],
  providers: [LivekitService],
})
export class LivekitModule {}
