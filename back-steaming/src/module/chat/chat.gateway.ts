/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JoinLiveRoomDto, SendLiveMessageDto } from './dto/live-chat.dto';
import { CreateMessageToAdminDto } from './dto/message-to-admin.dto';
import { MessageToAdminService } from './message-to-admin.service';

@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly messageToAdminService: MessageToAdminService,
  ) {}

  afterInit() {
    this.logger.log(
      '🚀 Live Chat WebSocket Gateway พร้อมใช้งานบน namespace: /chat',
    );
  }

  handleConnection(client: Socket) {
    this.logger.log(`🟢 Client connected: ${client.id}`);
  }

  // คำนวณยอดคนดูใหม่ทันทีเมื่อมีคนปิดแท็บ/เน็ตหลุด
  async handleDisconnect(client: Socket) {
    this.logger.log(`🔴 Client disconnected: ${client.id}`);

    for (const roomName of client.rooms) {
      if (roomName.startsWith('live:')) {
        const liveId = roomName.replace('live:', '');
        const sockets = await this.server.in(roomName).allSockets();
        const viewerCount = sockets.size;

        this.server.to(roomName).emit('viewerCountUpdated', {
          liveId,
          viewerCount,
        });
      }
    }
  }

  // ==========================================
  // 1. เข้าร่วมห้องไลฟ์ (Join Live Room)
  // ==========================================
  @SubscribeMessage('joinLiveRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinLiveRoomDto,
  ) {
    const roomName = `live:${data.liveId}`;
    await client.join(roomName);

    // ดึงจำนวน Socket ในห้อง
    const sockets = await this.server.in(roomName).allSockets();
    const viewerCount = sockets.size;

    // แจ้งยอดคนดูใหม่ให้ทุกคนในห้อง
    this.server.to(roomName).emit('viewerCountUpdated', {
      liveId: data.liveId,
      viewerCount,
    });

    try {
      const { messages } = await this.chatService.getRecentMessages(
        data.liveId,
      );
      this.logger.log(
        `📺 Socket ${client.id} joined ${roomName} (Viewers: ${viewerCount})`,
      );

      return {
        status: 'success',
        liveId: data.liveId,
        viewerCount,
        history: messages,
      };
    } catch (err: any) {
      return {
        status: 'error',
        message: err.message || 'ไม่สามารถโหลดประวัติข้อความได้',
      };
    }
  }

  // ==========================================
  // 2. ออกจากห้องไลฟ์ (Leave Live Room)
  // ==========================================
  @SubscribeMessage('leaveLiveRoom')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinLiveRoomDto,
  ) {
    const roomName = `live:${data.liveId}`;
    await client.leave(roomName);

    const sockets = await this.server.in(roomName).allSockets();
    const viewerCount = sockets.size;

    this.server.to(roomName).emit('viewerCountUpdated', {
      liveId: data.liveId,
      viewerCount,
    });

    return { status: 'left' };
  }

  // ==========================================
  // 3. ส่งข้อความแชต (Send Live Chat Message)
  // ==========================================
  @SubscribeMessage('sendLiveMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendLiveMessageDto,
  ) {
    try {
      const senderId = data.senderId || client.id;
      const savedMsg = await this.chatService.saveMessage(senderId, data);

      const payload = {
        id: savedMsg.id,
        liveId: data.liveId,
        senderId: savedMsg.senderId,
        senderName: savedMsg.senderName,
        message: savedMsg.content,
        createdAt: savedMsg.createdAt,
      };

      // บรอดแคสต์ข้อความหาทุกคนในห้อง
      this.broadcastNewMessage(data.liveId, payload);

      return { status: 'sent', data: payload };
    } catch (err: any) {
      return { status: 'error', message: err.message };
    }
  }

  @SubscribeMessage('sendMessageToAdmin')
  async handleMessageToAdmin(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: CreateMessageToAdminDto,
  ) {
    const message = await this.messageToAdminService.create({
      senderId: dto.senderId || client.id,
      senderName: dto.senderName,
      content: dto.content,
      senderType: dto.senderType,
    });

    // กระจาย Event แจ้งเตือนเข้า Admin Channel
    this.server.emit('admin:newMessage', message);

    return { status: 'sent', data: message };
  }

  // Helper Methods
  broadcastNewMessage(liveId: string, payload: any) {
    const roomName = `live:${liveId}`;
    this.server.to(roomName).emit('newLiveMessage', payload);
  }

  broadcastMessageBlocked(liveId: string, messageId: string) {
    const roomName = `live:${liveId}`;
    this.server.to(roomName).emit('messageBlocked', { messageId });
  }
}
