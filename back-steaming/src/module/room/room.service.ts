import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoomDto } from './dto/room.dto';
import { OgMetaDto } from './dto/og.dto';
import { randomBytes } from 'crypto';
import { PrismaService } from 'prisma/prisma.service';
import { LiveSession, LiveStatus } from '@prisma/client';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const APP_TIMEZONE = 'Asia/Bangkok';

@Injectable()
export class RoomService {
  private readonly logger = new Logger(RoomService.name);

  private readonly mediaHost = process.env.MEDIA_HOST || 'localhost';
  private readonly hlsPort = process.env.MEDIA_HLS_PORT || '8888';
  private readonly webrtcPort = process.env.MEDIA_WEBRTC_PORT || '8889';
  private readonly rtmpPort = process.env.MEDIA_RTMP_PORT || '1935';

  constructor(private readonly prisma: PrismaService) {}

  // คำนวณ "วันนี้" ตามเวลาไทย แล้ว truncate เหลือแค่วันที่ (เที่ยงคืน)
  private getTodayDate(): Date {
    return dayjs().tz(APP_TIMEZONE).startOf('day').toDate();
  }

  private formatRoomResponse(room: LiveSession, isCreator = false) {
    const streamPath = room.streamKey;

    const baseResponse = {
      ...room,
      playback: {
        hlsUrl: `http://${this.mediaHost}:${this.hlsPort}/${streamPath}/index.m3u8`,
        webrtcUrl: `http://${this.mediaHost}:${this.webrtcPort}/${streamPath}/whep`,
      },
    };

    if (isCreator) {
      return {
        ...baseResponse,
        streaming: {
          rtmpServerUrl: `rtmp://${this.mediaHost}:${this.rtmpPort}/live`,
          streamKey: room.streamKey,
          obsServer: `rtmp://${this.mediaHost}:${this.rtmpPort}/`,
          whipUrl: `http://${this.mediaHost}:${this.webrtcPort}/${streamPath}/whip`,
        },
      };
    }

    return baseResponse;
  }

  // 1. สร้างห้องใหม่ (บังคับ 1 ห้อง / 1 วัน)
  async createRoom(dto: CreateRoomDto) {
    const today = this.getTodayDate();

    const existingToday = await this.prisma.liveSession.findUnique({
      where: { liveDate: today },
    });

    if (existingToday) {
      throw new ConflictException(
        `วันนี้มีห้องไลฟ์ถูกสร้างไปแล้ว: "${existingToday.title}" (สถานะ: ${existingToday.status}) ไม่สามารถสร้างไลฟ์ซ้ำในวันเดียวกันได้`,
      );
    }

    if (dto.creatorId) {
      const adminExists = await this.prisma.admin.findUnique({
        where: { id: dto.creatorId },
      });
      if (!adminExists) {
        throw new BadRequestException(
          `ไม่พบบัญชีผู้สร้างรหัส: ${dto.creatorId}`,
        );
      }
    }

    const generatedStreamKey = `live_sk_${randomBytes(12).toString('hex')}`;

    const room = await this.prisma.liveSession.create({
      data: {
        ...dto,
        streamKey: generatedStreamKey,
        status: 'IDLE',
        liveDate: today,
      },
    });

    return this.formatRoomResponse(room, true);
  }

  // ใหม่: ดึงไลฟ์ของ "วันนี้" ถ้ามี (ใช้แทนการ hardcode liveId ฝั่ง frontend)
  async getTodayRoom(isCreator = false) {
    const today = this.getTodayDate();

    const room = await this.prisma.liveSession.findUnique({
      where: { liveDate: today },
      include: {
        creator: { select: { id: true, name: true, email: true } },
      },
    });

    if (!room) {
      return null; // ยังไม่มีไลฟ์ของวันนี้ -> ให้ frontend โชว์ปุ่ม "สร้างไลฟ์วันนี้"
    }

    return this.formatRoomResponse(room, isCreator);
  }

  async getRoomById(id: string) {
    const room = await this.prisma.liveSession.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true, email: true } },
      },
    });

    if (!room) {
      throw new NotFoundException(`ไม่พบห้องไลฟ์รหัส: ${id}`);
    }

    return this.formatRoomResponse(room, false);
  }

  async getAllRooms(status?: string) {
    const whereCondition = status ? { status: status as LiveStatus } : {};

    const rooms = await this.prisma.liveSession.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: { id: true, name: true },
        },
        // นับจำนวนสถิติต่างๆ แบบ aggregate
        _count: {
          select: {
            orders: true, // จำนวนออเดอร์ทั้งหมดในไลฟ์
            messages: true, // จำนวนข้อความทั้งหมด
          },
        },
        // ดึงตัวอย่างแชทล่าสุด 5 ข้อความ (ไม่เอาที่โดนแบน)
        messages: {
          where: { isBlocked: false },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            senderName: true,
            content: true,
            createdAt: true,
          },
        },
      },
    });

    return rooms.map((room) => this.formatRoomResponse(room, false));
  }

  async updateRoomStatus(id: string, status: LiveStatus) {
    const data: { status: LiveStatus; startedAt?: Date; endedAt?: Date } = {
      status,
    };

    // เก็บ startedAt / endedAt อัตโนมัติตาม status ที่เปลี่ยน
    if (status === 'STREAMING') data.startedAt = new Date();
    if (status === 'ENDED') data.endedAt = new Date();

    const room = await this.prisma.liveSession.update({
      where: { id },
      data,
    });
    return this.formatRoomResponse(room, false);
  }

  async updateOgRoom(id: string, dto: OgMetaDto) {
    const room = await this.prisma.liveSession.update({
      where: { id },
      data: { ...dto },
    });
    return this.formatRoomResponse(room, false);
  }
}
