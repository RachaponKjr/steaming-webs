import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { LivekitService, TokenResponse } from './livekit.service';

@Controller('livekit')
export class LivekitController {
  constructor(private readonly livekitService: LivekitService) {}

  @Get('token')
  async getToken(
    @Query('room') room: string,
    @Query('username') username?: string,
    @Query('role') role?: string,
  ): Promise<TokenResponse> {
    if (!room) {
      throw new BadRequestException('Missing "room" parameter');
    }

    const identity =
      username || `user_${Math.random().toString(36).substring(2, 7)}`;
    const isHost = role === 'host';

    return await this.livekitService.generateToken(room, identity, isHost);
  }
}
