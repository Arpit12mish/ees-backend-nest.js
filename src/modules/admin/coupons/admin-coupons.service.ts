import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CouponType } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class AdminCouponsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return (
      await this.prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } })
    ).map(this.format);
  }

  async findOne(id: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon)
      throw new NotFoundException({
        message: 'Coupon not found',
        errorCode: 'COUPON_NOT_FOUND',
      });
    return this.format(coupon);
  }

  async create(dto: CreateCouponDto) {
    const code = dto.code.toUpperCase();
    this.validateCouponInput(dto);
    const existing = await this.prisma.coupon.findUnique({ where: { code } });
    if (existing)
      throw new ConflictException({
        message: `Coupon code "${code}" already exists`,
        errorCode: 'COUPON_CODE_CONFLICT',
      });

    const coupon = await this.prisma.coupon.create({
      data: {
        code,
        type: dto.type,
        value: dto.value,
        minOrderAmount: dto.minOrderAmount,
        maxDiscountAmount: dto.maxDiscountAmount,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        usageLimit: dto.usageLimit,
        isActive: dto.isActive ?? true,
      },
    });
    return this.format(coupon);
  }

  async update(id: string, dto: UpdateCouponDto) {
    const current = await this.findOne(id);
    this.validateCouponInput({
      ...dto,
      type: dto.type ?? current.type,
      value: dto.value ?? current.value,
      startDate: dto.startDate ?? current.startDate?.toISOString(),
      endDate: dto.endDate ?? current.endDate?.toISOString(),
    });

    if (dto.code) {
      const code = dto.code.toUpperCase();
      const existing = await this.prisma.coupon.findFirst({
        where: { code, NOT: { id } },
      });
      if (existing)
        throw new ConflictException({
          message: `Coupon code "${code}" already exists`,
          errorCode: 'COUPON_CODE_CONFLICT',
        });
      dto.code = code;
    }

    const coupon = await this.prisma.coupon.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
    return this.format(coupon);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.coupon.update({
      where: { id },
      data: { isActive: false },
    });
  }

  private format(coupon: any) {
    return {
      ...coupon,
      value: Number(coupon.value),
      minOrderAmount:
        coupon.minOrderAmount !== null ? Number(coupon.minOrderAmount) : null,
      maxDiscountAmount:
        coupon.maxDiscountAmount !== null
          ? Number(coupon.maxDiscountAmount)
          : null,
    };
  }

  private validateCouponInput(dto: {
    type?: CouponType;
    value?: number;
    startDate?: string;
    endDate?: string;
  }) {
    if (
      dto.type === CouponType.PERCENTAGE &&
      dto.value !== undefined &&
      dto.value > 100
    ) {
      throw new BadRequestException({
        message: 'Percentage coupon value cannot exceed 100',
        errorCode: 'COUPON_PERCENTAGE_TOO_HIGH',
      });
    }

    if (
      dto.startDate &&
      dto.endDate &&
      new Date(dto.endDate) < new Date(dto.startDate)
    ) {
      throw new BadRequestException({
        message: 'Coupon endDate must be after startDate',
        errorCode: 'COUPON_DATE_RANGE_INVALID',
      });
    }
  }
}
