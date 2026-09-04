import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { PrismaService } from 'prisma/prisma.service';
import { MessageToAdminController } from './message-to-admin.controller';
import { MessageToAdminService } from './message-to-admin.service';

@Module({
  controllers: [ChatController, MessageToAdminController],
  providers: [ChatGateway, ChatService, PrismaService, MessageToAdminService],
  exports: [ChatService, ChatGateway, MessageToAdminService],
})
export class ChatModule {}
