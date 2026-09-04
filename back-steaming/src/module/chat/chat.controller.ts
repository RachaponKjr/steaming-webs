import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { SendLiveMessageDto, AdminReplyMessageDto } from './dto/live-chat.dto';

@ApiTags('Live Chat Management')
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Get('history/:liveId')
  @ApiOperation({ summary: 'ดึงประวัติข้อความแชตล่าสุดของห้องไลฟ์' })
  @ApiParam({ name: 'liveId', description: 'ID ของ LiveSession' })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  async getHistory(
    @Param('liveId') liveId: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.chatService.getRecentMessages(liveId, limit);
  }

  @Post('send')
  @ApiOperation({ summary: 'ลูกค้าหรือผู้ชมทั่วไปส่งข้อความ (ผ่าน REST API)' })
  async sendMessage(@Body() dto: SendLiveMessageDto) {
    const senderId = dto.senderId || `guest_${Date.now()}`;
    const saved = await this.chatService.saveMessage(senderId, dto);

    const payload = {
      id: saved.id,
      liveId: saved.liveId,
      senderId: saved.senderId,
      senderName: saved.senderName,
      message: saved.content,
      createdAt: saved.createdAt,
    };

    this.chatGateway.broadcastNewMessage(dto.liveId, payload);
    return payload;
  }

  @Post('admin/reply/:adminId')
  @ApiOperation({ summary: 'แอดมินส่งข้อความตอบกลับเข้าห้องไลฟ์' })
  @ApiParam({ name: 'adminId', description: 'ID ของแอดมิน' })
  async adminReply(
    @Param('adminId') adminId: string,
    @Body() dto: AdminReplyMessageDto,
  ) {
    const saved = await this.chatService.saveAdminMessage(
      adminId,
      dto.liveId,
      dto.message,
    );

    const payload = {
      id: saved.id,
      liveId: saved.liveId,
      senderId: saved.senderId,
      senderName: saved.senderName,
      message: saved.content,
      createdAt: saved.createdAt,
      isAdmin: true,
    };

    this.chatGateway.broadcastNewMessage(dto.liveId, payload);
    return payload;
  }

  @Patch('block/:messageId')
  @ApiOperation({ summary: 'แอดมินสั่งแบน/ซ่อนข้อความ' })
  @ApiParam({ name: 'messageId', description: 'ID ของข้อความ' })
  async blockMessage(@Param('messageId') messageId: string) {
    const updated = await this.chatService.blockMessage(messageId);
    this.chatGateway.broadcastMessageBlocked(updated.liveId, messageId);

    return {
      success: true,
      message: 'ซ่อนข้อความเรียบร้อยแล้ว',
      data: updated,
    };
  }

  @Get('admin/moderation/:liveId')
  @ApiOperation({ summary: 'ดึงรายการแชตทั้งหมดสำหรับหน้าตรวจสอบของแอดมิน' })
  @ApiParam({ name: 'liveId', description: 'ID ของ LiveSession' })
  async getModerationMessages(@Param('liveId') liveId: string) {
    return this.chatService.getMessagesForModerator(liveId);
  }
}
