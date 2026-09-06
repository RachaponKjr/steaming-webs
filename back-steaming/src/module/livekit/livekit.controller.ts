import {
  Controller,
  Get,
  Query,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LivekitService, TokenResponse } from './livekit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('LiveKit')
@Controller('livekit')
export class LivekitController {
  constructor(private readonly livekitService: LivekitService) {}

  /**
   * Token สำหรับผู้ชม (public) — ดูได้อย่างเดียว publish ไม่ได้
   */
  @Get('token')
  @ApiOperation({ summary: 'ขอ LiveKit token สำหรับผู้ชม (ดูอย่างเดียว)' })
  async getViewerToken(
    @Query('room') room: string,
    @Query('username') username?: string,
  ): Promise<TokenResponse> {
    if (!room) {
      throw new BadRequestException('Missing "room" parameter');
    }

    const identity =
      username?.trim() || `user_${Math.random().toString(36).substring(2, 9)}`;

    // ป้องกัน identity ชนกันจนโดนเตะออกจากห้อง (LiveKit ยอมให้ identity ซ้ำไม่ได้)
    const uniqueIdentity = `${identity}#${Math.random().toString(36).substring(2, 7)}`;

    return this.livekitService.generateToken(room, uniqueIdentity, false);
  }

  /**
   * Token สำหรับผู้ถ่ายทอดสด — ต้องล็อกอินเป็นแอดมินเท่านั้น
   * (ถ้าเปิดให้ทุกคนขอ role=host ได้ ใครก็ยิงภาพเข้าห้องไลฟ์เราได้)
   */
  @Get('host-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ขอ LiveKit token สำหรับ Host (ต้องเป็นแอดมิน)' })
  async getHostToken(
    @Query('room') room: string,
    @Query('username') username?: string,
  ): Promise<TokenResponse> {
    if (!room) {
      throw new BadRequestException('Missing "room" parameter');
    }

    return this.livekitService.generateToken(
      room,
      username?.trim() || 'host',
      true,
    );
  }
}
