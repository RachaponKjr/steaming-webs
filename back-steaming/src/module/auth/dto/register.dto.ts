import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { AdminRole } from '@prisma/client';
import { LoginDto } from './login.dto';

export class RegisterDto extends LoginDto {
  @ApiProperty({ description: 'ชื่อที่จะใช้ในระบบ', example: 'Milk' })
  @IsString()
  @MinLength(2, { message: 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร' })
  name: string;

  @ApiPropertyOptional({
    description: 'สิทธิ์ของ admin (ไม่ส่งมา = ADMIN ตาม default ของ schema)',
    enum: AdminRole,
    example: AdminRole.ADMIN,
  })
  @IsOptional()
  @IsEnum(AdminRole)
  role?: AdminRole;
}
