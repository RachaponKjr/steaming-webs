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

    if (!apiKey || !apiSecret) {
      throw new InternalServerErrorException(
        'LiveKit server configuration is missing (LIVEKIT_API_KEY / LIVEKIT_API_SECRET)',
      );
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: username,
      name: username,
      // ผู้ชมไม่ควรถือ token ยาวเกินจำเป็น ส่วน Host ไลฟ์ยาวได้ทั้งวัน
      ttl: isHost ? '12h' : '4h',
    });

    at.addGrant({
      roomJoin: true,
      room,
      // Host เท่านั้นที่ publish กล้อง/ไมค์ได้ ผู้ชมดูอย่างเดียว
      canPublish: isHost,
      canPublishData: true,
      canSubscribe: true,
      // ให้ห้องถูกสร้างอัตโนมัติเมื่อ Host เข้าห้องครั้งแรก
      roomCreate: isHost,
    });

    const token = await at.toJwt();

    return {
      token,
      wsUrl: this.getWsUrl(),
    };
  }

  /**
   * URL ที่ browser ใช้ต่อเข้า LiveKit โดยตรง (ต้องเป็น ws:// หรือ wss:// เท่านั้น)
   * ถ้าตั้ง LIVEKIT_URL เป็น http(s):// จะถูกแปลงให้อัตโนมัติ
   */
  private getWsUrl(): string {
    const raw =
      this.configService.get<string>('LIVEKIT_WS_URL') ||
      this.configService.get<string>('LIVEKIT_URL') ||
      'ws://127.0.0.1:7880';

    return raw
      .trim()
      .replace(/^http:\/\//, 'ws://')
      .replace(/^https:\/\//, 'wss://');
  }
}
