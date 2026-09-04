import { Module } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';

@Module({
  controllers: [RoomController], // ใส่ Controller ที่นี่
  providers: [PrismaService, RoomService],
  exports: [RoomService],
})
export class RoomModule {}
