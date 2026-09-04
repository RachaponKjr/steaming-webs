import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessToken } from 'livekit-server-sdk';

// 1. ประกาศ Interface สำหรับ Type ที่แน่นอน
export interface TokenResponse {
  token: string;
  wsUrl: string;
}

@Injectable()
export class LivekitService {
  constructor(private readonly configService: ConfigService) {}

  // 2. ระบุ Return Type: Promise<TokenResponse>
  async generateToken(
    room: string,
    username: string,
    isHost: boolean,
  ): Promise<TokenResponse> {
    const apiKey = this.configService.get<string>('LIVEKIT_API_KEY');
    const apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET');
    const wsUrl = this.configService.get<string>('LIVEKIT_URL');

    if (!apiKey || !apiSecret || !wsUrl) {
      throw new InternalServerErrorException(
        'LiveKit server configuration is missing',
      );
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: username,
      name: username,
      ttl: '4h',
    });

    at.addGrant({
      roomJoin: true,
      room: room,
      canPublish: isHost,
      canPublishData: true,
      canSubscribe: true,
    });

    const token = await at.toJwt();

    return {
      token,
      wsUrl,
    };
  }
}
