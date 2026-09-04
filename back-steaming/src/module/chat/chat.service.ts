import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { SendLiveMessageDto } from './dto/live-chat.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private readonly prisma: PrismaService) {}

  // 1. ดึงประวัติข้อความแชต 50 ข้อความล่าสุด
  async getRecentMessages(liveId: string, limit = 50) {
    const session = await this.prisma.liveSession.findUnique({
      where: { id: liveId },
      select: { id: true, title: true, status: true },
    });

    if (!session) {
      throw new NotFoundException(`ไม่พบห้องไลฟ์ ID: ${liveId}`);
    }

    const rawMessages = await this.prisma.liveMessage.findMany({
      where: {
        liveId,
        isBlocked: false,
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    // แปลง format ให้อ่านง่ายและส่งกลับเป็นเรียงจากเก่าไปใหม่
    const messages = rawMessages.reverse().map((m) => ({
      id: m.id,
      liveId: m.liveId,
      senderId: m.senderId,
      senderName: m.senderName,
      message: m.content,
      createdAt: m.createdAt,
    }));

    return { session, messages };
  }

  // 2. บันทึกข้อความแชตจากผู้ชมทั่วไป (Guest)
  async saveMessage(senderId: string, dto: SendLiveMessageDto) {
    const session = await this.prisma.liveSession.findUnique({
      where: { id: dto.liveId },
    });

    if (!session) {
      throw new NotFoundException(`ไม่พบห้องไลฟ์ ID: ${dto.liveId}`);
    }

    const cleanName = dto.senderName?.trim() || `ผู้ชม_${senderId.slice(0, 4)}`;

    return this.prisma.liveMessage.create({
      data: {
        liveId: dto.liveId,
        senderId,
        senderName: cleanName,
        content: dto.message,
      },
    });
  }

  // 3. บันทึกข้อความจากแอดมิน
  async saveAdminMessage(adminId: string, liveId: string, message: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
      select: { id: true, name: true, role: true },
    });

    if (!admin) {
      throw new NotFoundException(`ไม่พบข้อมูลแอดมิน ID: ${adminId}`);
    }

    const session = await this.prisma.liveSession.findUnique({
      where: { id: liveId },
    });

    if (!session) {
      throw new NotFoundException(`ไม่พบห้องไลฟ์ ID: ${liveId}`);
    }

    return this.prisma.liveMessage.create({
      data: {
        liveId,
        senderId: admin.id,
        senderName: `[Admin] ${admin.name}`,
        content: message,
      },
    });
  }

  // 4. แบน/ซ่อนข้อความ
  async blockMessage(messageId: string) {
    const message = await this.prisma.liveMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException(`ไม่พบข้อความ ID: ${messageId}`);
    }

    return this.prisma.liveMessage.update({
      where: { id: messageId },
      data: { isBlocked: true },
    });
  }

  // 5. ดึงข้อความทั้งหมดสำหรับหน้า Moderator Dashboard
  async getMessagesForModerator(liveId: string) {
    return this.prisma.liveMessage.findMany({
      where: { liveId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
