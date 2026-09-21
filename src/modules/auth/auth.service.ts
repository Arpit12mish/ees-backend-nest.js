import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: AdminLoginDto) {
    const email = dto.email.toLowerCase();
    const admin = await this.prisma.adminUser.findUnique({
      where: { email },
    });

    if (!admin)
      throw new UnauthorizedException({
        message: 'Invalid credentials',
        errorCode: 'INVALID_CREDENTIALS',
      });
    if (!admin.isActive)
      throw new UnauthorizedException({
        message: 'Account is inactive',
        errorCode: 'ACCOUNT_INACTIVE',
      });

    const passwordValid = await bcrypt.compare(
      dto.password,
      admin.passwordHash,
    );
    if (!passwordValid)
      throw new UnauthorizedException({
        message: 'Invalid credentials',
        errorCode: 'INVALID_CREDENTIALS',
      });

    await this.prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    const payload = {
      sub: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    };
    const accessToken = this.jwt.sign(payload);

    return {
      accessToken,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    };
  }

  async getMe(adminId: string) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });
    if (!admin)
      throw new UnauthorizedException({
        message: 'Admin not found',
        errorCode: 'ADMIN_NOT_FOUND',
      });
    return admin;
  }
}
