import { ApiProperty } from '@nestjs/swagger';
import { SenderType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMessageToAdminDto {
  @ApiProperty({ description: 'ID หรือ Session ของผู้ส่ง เช่น guest_xxx' })
  @IsString()
  @IsNotEmpty()
  senderId: string;

  @ApiProperty({ description: 'ชื่อผู้ส่ง', example: 'คุณมิลค์' })
  @IsString()
  @IsNotEmpty()
  senderName: string;

  @ApiProperty({
    description: 'ประเภทผู้ส่ง',
    enum: SenderType,
    example: SenderType.MEMBER,
  })
  @IsEnum(SenderType)
  @IsOptional()
  senderType: SenderType;

  @ApiProperty({
    description: 'ข้อความหรือรายละเอียดคำสั่งซื้อ',
    example: 'CF เสื้อสีขาว ไซส์ L 1 ตัวครับ',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
