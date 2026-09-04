import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadImageDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'ไฟล์รูปภาพที่ต้องการอัปโหลด',
  })
  file: Express.Multer.File;

  @ApiPropertyOptional({
    description: 'ประเภทโฟลเดอร์สำหรับจัดเก็บ (เช่น thumbnails, og, avatars)',
    example: 'thumbnails',
    enum: ['thumbnails', 'og', 'avatars', 'general'],
    default: 'general',
  })
  folder?: string;
}
