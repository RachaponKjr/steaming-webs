import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class JoinLiveRoomDto {
  @ApiProperty({
    description: 'ID ของ LiveSession (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsString()
  @IsNotEmpty()
  liveId: string;

  @ApiPropertyOptional({
    description: 'ชื่อผู้เข้าชม (ถ้ามี)',
    example: 'คุณมิลค์',
  })
  @IsString()
  @IsOptional()
  guestName?: string;
}

export class SendLiveMessageDto {
  @ApiProperty({ description: 'ID ของ LiveSession (UUID)' })
  @IsString()
  @IsNotEmpty()
  liveId: string;

  @ApiPropertyOptional({
    description: 'รหัสประจำตัวผู้ส่ง (เช่น guest_xxx หรือ Admin ID)',
  })
  @IsString()
  @IsOptional()
  senderId?: string;

  @ApiProperty({ description: 'ชื่อที่แสดงในแชต', example: 'คุณมิลค์' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  senderName: string;

  @ApiProperty({
    description: 'ข้อความที่ต้องการส่ง',
    example: 'CF สินค้าเบอร์ 1 ครับ',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  message: string;
}

export class AdminReplyMessageDto {
  @ApiProperty({ description: 'ID ของ LiveSession (UUID)' })
  @IsString()
  @IsNotEmpty()
  liveId: string;

  @ApiProperty({ description: 'ข้อความตอบกลับจากแอดมิน' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  message: string;
}
