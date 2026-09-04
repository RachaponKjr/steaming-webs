import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MessageToAdminService } from './message-to-admin.service';
import { CreateMessageToAdminDto } from './dto/message-to-admin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Message To Admin')
@Controller('messages-to-admin')
export class MessageToAdminController {
  constructor(private readonly service: MessageToAdminService) {}

  @Post()
  @ApiOperation({ summary: 'ลูกค้าส่งข้อความ/ออเดอร์ถึงแอดมิน' })
  create(@Body() dto: CreateMessageToAdminDto) {
    return this.service.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'แอดมินดึงรายการข้อความทั้งหมด' })
  findAll(
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.service.findAll(limit);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('conversations/latest')
  @ApiOperation({
    summary: 'ดึงข้อความล่าสุด 1 ข้อความของแต่ละห้อง/คน (Inbox List)',
  })
  getLatestConversations() {
    return this.service.getLatestMessagesBySender();
  }

  @Get('sender/:senderId')
  @ApiOperation({ summary: 'ดึงข้อความตาม Sender ID' })
  findBySender(@Param('senderId') senderId: string) {
    return this.service.findBySender(senderId);
  }

  @Patch('sender/:senderId/read')
  markAsReadBySender(@Param('senderId') senderId: string) {
    return this.service.markAsReadBySender(senderId);
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'ลบข้อความ' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
