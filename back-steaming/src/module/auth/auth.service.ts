import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Admin } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service'; // แก้ path ตามโปรเจกต์จริง
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtPayload } from './interfaces/admin-payload.interface';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const admin = await this.prisma.admin.findUnique({
      where: { email: dto.email },
    });

    if (!admin) {
      throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }

    return this.buildAuthResponse(admin);
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.admin.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('อีเมลนี้ถูกใช้งานแล้ว');
    }

    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const admin = await this.prisma.admin.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        role: dto.role, // ไม่ส่งมา = ใช้ default ADMIN ตาม schema
      },
    });

    return this.buildAuthResponse(admin);
  }

  async changePassword(adminId: string, dto: ChangePasswordDto) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });
    if (!admin) {
      throw new UnauthorizedException();
    }

    const isOldPasswordValid = await bcrypt.compare(
      dto.oldPassword,
      admin.password,
    );
    if (!isOldPasswordValid) {
      throw new ForbiddenException('รหัสผ่านเดิมไม่ถูกต้อง');
    }

    const hashedNewPassword = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);

    await this.prisma.admin.update({
      where: { id: adminId },
      data: { password: hashedNewPassword },
    });

    return { message: 'เปลี่ยนรหัสผ่านสำเร็จ' };
  }

  async findAll() {
    return this.prisma.admin.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // ไม่ select password ออกไปเด็ดขาด
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async validateAdminById(id: string) {
    return this.prisma.admin.findUnique({ where: { id } });
  }

  /** ใช้สำหรับ seed script ตอนสร้าง admin คนแรก */
  async hashPassword(plain: string) {
    return bcrypt.hash(plain, SALT_ROUNDS);
  }

  async delete({ id }: { id: string }) {
    await this.prisma.admin.delete({
      where: { id },
    });

    return { message: 'ลบสำเร็จ' };
  }

  private async buildAuthResponse(admin: Admin) {
    const payload: JwtPayload = {
      sub: admin.id,
      email: admin.email,
      role: admin.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    };
  }
}
