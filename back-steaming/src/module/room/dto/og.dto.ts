import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class OgMetaDto {
  @ApiPropertyOptional({
    description: 'หัวข้อสำหรับแชร์ลงโซเชียลมีเดีย (Open Graph Title)',
    example: 'Live สดเปิดตัวสินค้าใหม่ คอลเลกชันฤดูร้อน พร้อมโปรโมชันพิเศษ!',
  })
  @IsString({ message: 'ogTitle ต้องเป็นข้อความ' })
  @IsOptional()
  ogTitle?: string;

  @ApiPropertyOptional({
    description:
      'คำอธิบายสั้นๆ สำหรับแสดงตัวอย่างลิงก์ (Open Graph Description)',
    example:
      'เข้ามาร่วมพูดคุยและรับส่วนลดพิเศษเฉพาะในไลฟ์นี้เท่านั้น ห้ามพลาด!',
  })
  @IsString({ message: 'ogDescription ต้องเป็นข้อความ' })
  @IsOptional()
  ogDescription?: string;

  @ApiPropertyOptional({
    description: 'URL รูปภาพขนาดย่อสำหรับพรีวิว (Thumbnail Image)',
    example: 'https://cdn.example.com/thumbnails/live-room-101.jpg',
  })
  @IsString({ message: 'ogThumbnail ต้องเป็น URL หรือข้อความพาธ' })
  @IsOptional()
  ogThumbnail?: string;

  @ApiPropertyOptional({
    description: 'URL รูปภาพหลักสำหรับแสดงผล Open Graph ขนาดใหญ่ (1200x630)',
    example: 'https://cdn.example.com/og/live-banner-summer.png',
  })
  @IsString({ message: 'ogImage ต้องเป็น URL หรือข้อความพาธ' })
  @IsOptional()
  ogImage?: string;

  @ApiPropertyOptional({
    description: 'แท็กหรือคีย์เวิร์ดของห้องไลฟ์สำหรับจัดหมวดหมู่และค้นหา',
    example: ['fashion', 'shopping', 'summer2026', 'minimal'],
    type: [String],
  })
  @IsArray({ message: 'ogTags ต้องเป็น Array ของข้อความ' })
  @IsString({ each: true, message: 'สมาชิกใน ogTags แต่ละตัวต้องเป็นข้อความ' })
  @IsOptional()
  ogTags?: string[];
}
