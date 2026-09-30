import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../database/prisma.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { ResetAdminPasswordDto } from './dto/reset-admin-password.dto';

const SAFE_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.adminUser.findMany({
      select: SAFE_SELECT,
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id },
      select: SAFE_SELECT,
    });
    if (!admin)
      throw new NotFoundException({
        message: 'Admin account not found',
        errorCode: 'ADMIN_USER_NOT_FOUND',
      });
    return admin;
  }

  async create(dto: CreateAdminUserDto) {
    const email = dto.email.toLowerCase();
    const existing = await this.prisma.adminUser.findUnique({
      where: { email },
    });
    if (existing)
      throw new ConflictException({
        message: `An admin account already exists for ${email}`,
        errorCode: 'ADMIN_USER_EMAIL_CONFLICT',
      });

    const passwordHash = await bcrypt.hash(dto.password, 12);
    return this.prisma.adminUser.create({
      data: { name: dto.name, email, passwordHash, role: dto.role },
      select: SAFE_SELECT,
    });
  }

  async update(id: string, dto: UpdateAdminUserDto, currentAdminId: string) {
    await this.findOne(id);
    if (id === currentAdminId && dto.isActive === false) {
      throw new BadRequestException({
        message: 'You cannot deactivate your own account',
        errorCode: 'ADMIN_USER_SELF_DEACTIVATE',
      });
    }
    return this.prisma.adminUser.update({
      where: { id },
      data: dto,
      select: SAFE_SELECT,
    });
  }

  async resetPassword(id: string, dto: ResetAdminPasswordDto) {
    await this.findOne(id);
    const passwordHash = await bcrypt.hash(dto.password, 12);
    return this.prisma.adminUser.update({
      where: { id },
      data: { passwordHash },
      select: SAFE_SELECT,
    });
  }
}
