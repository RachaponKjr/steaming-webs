import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'อีเมลของ admin', example: 'admin@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'รหัสผ่าน', example: 'password123' })
  @IsString()
  @MinLength(6, { message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' })
  password: string;
}
