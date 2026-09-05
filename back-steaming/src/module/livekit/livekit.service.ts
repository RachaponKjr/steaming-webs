import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessToken } from 'livekit-server-sdk';

export interface TokenResponse {
  token: string;
  wsUrl: string;
}

@Injectable()
export class LivekitService {
  constructor(private readonly configService: ConfigService) {}

  async generateToken(
    room: string,
    username: string,
    isHost: boolean,
  ): Promise<TokenResponse> {
    const apiKey = this.configService.get<string>('LIVEKIT_API_KEY');
    const apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET');

    // ลบการเช็ค wsUrl จาก Config ออก ให้ใช้โดเมนจริงตายตัวไปเลยเพื่อความชัวร์
    if (!apiKey || !apiSecret) {
      throw new InternalServerErrorException(
        'LiveKit server configuration is missing',
      );
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: username,
      name: username,
      ttl: '8h',
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
      // บังคับคืนค่าเป็น wss:// โดเมนภายนอกที่ผ่าน Nginx Proxy Manager เสมอ
      wsUrl: 'wss://livekit.zimonds.com',
    };
  }
}
