import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LiveStatus } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({
    description: 'ชื่อหัวข้อห้อง Live Stream',
    example: 'เปิดตัวคอลเลกชันใหม่ แจกโค้ดส่วนลด 50%',
    maxLength: 150,
  })
  @IsString({ message: 'title ต้องเป็นข้อความ' })
  @IsNotEmpty({ message: 'กรุณากรอกชื่อห้องไลฟ์' })
  @MaxLength(150, { message: 'ชื่อห้องไลฟ์ต้องไม่เกิน 150 ตัวอักษร' })
  title: string;

  @ApiPropertyOptional({
    description: 'รหัส ID ของผู้สร้างห้อง/แอดมินเจ้าของไลฟ์',
    example: 'admin_default_01',
  })
  @IsString({ message: 'creatorId ต้องเป็นข้อความ' })
  @IsOptional()
  creatorId?: string;

  @ApiPropertyOptional({
    description: 'สถานะเริ่มต้นของห้องไลฟ์',
    enum: LiveStatus,
    example: LiveStatus.IDLE,
    default: LiveStatus.IDLE,
  })
  @IsEnum(LiveStatus, { message: 'สถานะ status ไม่ถูกต้อง' })
  @IsOptional()
  status?: LiveStatus;
}
