import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/room.dto';
import { LiveStatus } from '@prisma/client';
import { OgMetaDto } from './dto/og.dto';

@ApiTags('Room Management')
@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  @ApiOperation({
    summary: 'สร้างห้อง Live Streaming ใหม่ (1 ห้อง / 1 วัน)',
    description: 'ถ้าวันนี้มีห้องไลฟ์อยู่แล้วจะสร้างซ้ำไม่ได้ (409 Conflict)',
  })
  async openRoom(@Body() dto: CreateRoomDto) {
    return this.roomService.createRoom(dto);
  }

  // ใหม่: ต้องอยู่ก่อน :id
  @Get('today')
  @ApiOperation({
    summary: 'ดึงห้องไลฟ์ของวันนี้ (สำหรับหน้า Dashboard แอดมิน)',
  })
  @ApiQuery({
    name: 'isCreator',
    required: false,
    type: Boolean,
    description: 'true = ส่ง streamKey/RTMP มาด้วย (สำหรับแอดมิน)',
  })
  async getTodayRoom(@Query('isCreator') isCreator?: string) {
    return this.roomService.getTodayRoom(isCreator === 'true');
  }

  @Get()
  @ApiOperation({ summary: 'ดึงรายการห้องไลฟ์ทั้งหมด (หน้าแรก / Feed)' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: LiveStatus,
    description: 'กรองสถานะ เช่น เลือกเฉพาะห้องที่กำลัง LIVE',
  })
  async getAllRooms(@Query('status') status?: string) {
    return this.roomService.getAllRooms(status);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'ดึงข้อมูลห้องไลฟ์รายห้อง (สำหรับหน้า Watch Page)',
  })
  @ApiParam({ name: 'id', example: 'live_room_01' })
  async getRoomById(@Param('id') id: string) {
    return this.roomService.getRoomById(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'เปลี่ยนสถานะห้องไลฟ์ (เริ่ม / จบการไลฟ์)' })
  @ApiParam({ name: 'id', example: 'live_room_01' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: LiveStatus,
  ) {
    return this.roomService.updateRoomStatus(id, status);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'อัปเดตข้อมูล Open Graph (OG Metadata)' })
  @ApiParam({ name: 'id', example: 'live_room_01' })
  async updateOgRoom(@Param('id') id: string, @Body() dto: OgMetaDto) {
    return this.roomService.updateOgRoom(id, dto);
  }
}
