import { Injectable, NotFoundException } from '@nestjs/common';
import { StockStatus } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Injectable()
export class AdminInventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const products = await this.prisma.product.findMany({
      orderBy: [
        { stockStatus: 'asc' },
        { inventoryQuantity: 'asc' },
        { name: 'asc' },
      ],
      select: this.inventorySelect,
    });
    return products.map((product) => this.format(product));
  }

  async findLowStock() {
    const products = await this.prisma.product.findMany({
      where: {
        stockStatus: { in: [StockStatus.LOW_STOCK, StockStatus.OUT_OF_STOCK] },
      },
      orderBy: [{ inventoryQuantity: 'asc' }, { name: 'asc' }],
      select: this.inventorySelect,
    });
    return products.map((product) => this.format(product));
  }

  async update(productId: string, dto: UpdateInventoryDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product)
      throw new NotFoundException({
        message: 'Product not found',
        errorCode: 'PRODUCT_NOT_FOUND',
      });

    const stockStatus = this.computeStockStatus(
      dto.inventoryQuantity,
      dto.lowStockThreshold,
    );
    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: {
        inventoryQuantity: dto.inventoryQuantity,
        lowStockThreshold: dto.lowStockThreshold,
        stockStatus,
      },
      select: this.inventorySelect,
    });
    return this.format(updated);
  }

  private computeStockStatus(qty: number, threshold: number): StockStatus {
    if (qty <= 0) return StockStatus.OUT_OF_STOCK;
    if (qty <= threshold) return StockStatus.LOW_STOCK;
    return StockStatus.IN_STOCK;
  }

  private readonly inventorySelect = {
    id: true,
    name: true,
    slug: true,
    sku: true,
    price: true,
    status: true,
    stockStatus: true,
    inventoryQuantity: true,
    lowStockThreshold: true,
    updatedAt: true,
  } as const;

  private format(product: { price: unknown }) {
    return { ...product, price: Number(product.price) };
  }
}
