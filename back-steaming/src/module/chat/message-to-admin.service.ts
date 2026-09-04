import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateMessageToAdminDto } from './dto/message-to-admin.dto';
import { SenderType } from '@prisma/client';

@Injectable()
export class MessageToAdminService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. สร้างข้อความส่งถึงแอดมิน
  async create(dto: CreateMessageToAdminDto) {
    return this.prisma.messageToAdmin.create({
      data: {
        senderId: dto.senderId,
        senderName: dto.senderName.trim(),
        content: dto.content.trim(),
      },
    });
  }

  // 2. ดึงรายการข้อความทั้งหมด (สำหรับหน้า Admin)
  async findAll(limit = 50) {
    return this.prisma.messageToAdmin.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  // 3. ดึงข้อความของลูกค้ารายคน
  async findBySender(senderId: string) {
    return this.prisma.messageToAdmin.findMany({
      where: { senderId },
      orderBy: { createdAt: 'asc' },
    });
  }

  // 4. มาร์กว่าอ่านแล้ว (Mark as Read)
  async markAsRead(id: string) {
    const message = await this.prisma.messageToAdmin.findUnique({
      where: { id },
    });
    if (!message) throw new NotFoundException('ไม่พบข้อความนี้');

    return this.prisma.messageToAdmin.update({
      where: { id },
      data: { readed: true },
    });
  }

  async markAsReadBySender(
    senderId: string,
    senderType: SenderType = SenderType.MEMBER,
  ): Promise<{ senderId: string; updated: number }> {
    if (!senderId?.trim()) {
      throw new BadRequestException('ต้องระบุ senderId');
    }

    const result = await this.prisma.messageToAdmin.updateMany({
      where: { senderId, senderType, readed: false },

      data: { readed: true },
    });

    return { senderId, updated: result.count };
  }

  // 5. ลบข้อความ
  async remove(id: string) {
    return this.prisma.messageToAdmin.delete({
      where: { id },
    });
  }

  async getLatestMessagesBySender() {
    // 1. ดึงข้อความล่าสุดของแต่ละ senderId โดยใช้ distinct
    const latestMessages = await this.prisma.messageToAdmin.findMany({
      distinct: ['senderId'],
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 2. คำนวณจำนวนข้อความที่ยังไม่ได้อ่าน (unreadCount) ของแต่ละ senderId เพิ่มเติม
    const senderListWithUnread = await Promise.all(
      latestMessages.map(async (msg) => {
        const unreadCount = await this.prisma.messageToAdmin.count({
          where: {
            senderId: msg.senderId,
            readed: false,
          },
        });

        return {
          ...msg,
          unreadCount,
        };
      }),
    );

    return senderListWithUnread;
  }
}
