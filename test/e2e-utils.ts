import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { Express } from 'express';
import * as bcrypt from 'bcrypt';
import { AdminRole, ProductStatus, StockStatus } from '@prisma/client';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { applyCacheControlHeaders } from '../src/common/middleware/cache-control.middleware';

export type E2eApp = {
  app: INestApplication;
  prisma: PrismaService;
  api: request.SuperTest<request.Test>;
};

export async function createE2eApp(): Promise<E2eApp> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api');
  app.use(applyCacheControlHeaders);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  await app.init();

  return {
    app,
    prisma: app.get(PrismaService),
    api: request(app.getHttpAdapter().getInstance() as Express),
  };
}

export async function resetDatabase(prisma: PrismaService) {
  await prisma.orderStatusHistory.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.collectionProduct.deleteMany();
  await prisma.seoMetadata.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.contactLead.deleteMany();
  await prisma.adminUser.deleteMany();
}

export async function seedAdmin(prisma: PrismaService) {
  const email = 'admin-e2e@example.com';
  const password = 'Admin@123456';
  const passwordHash = await bcrypt.hash(password, 4);
  const admin = await prisma.adminUser.create({
    data: {
      name: 'E2E Admin',
      email,
      passwordHash,
      role: AdminRole.SUPER_ADMIN,
      isActive: true,
    },
  });
  return { admin, email, password };
}

export async function loginAdmin(api: request.SuperTest<request.Test>) {
  const response = await api
    .post('/api/admin/auth/login')
    .send({ email: 'admin-e2e@example.com', password: 'Admin@123456' })
    .expect(201);
  return response.body.data.accessToken as string;
}

export async function seedCatalog(prisma: PrismaService) {
  const activeCategory = await prisma.category.create({
    data: {
      name: 'E2E Healing Crystals',
      slug: 'e2e-healing-crystals',
      description: 'Crystals traditionally associated with mindful routines',
      isActive: true,
      priority: 10,
    },
  });

  const inactiveCategory = await prisma.category.create({
    data: {
      name: 'E2E Hidden Category',
      slug: 'e2e-hidden-category',
      isActive: false,
    },
  });

  const product = await prisma.product.create({
    data: {
      name: 'E2E Rose Quartz',
      slug: 'e2e-rose-quartz',
      sku: 'E2E-ROSE-001',
      shortDescription:
        'Rose quartz traditionally associated with love and calm.',
      longDescription: 'Often chosen for intention-led routines.',
      price: 500,
      mrp: 700,
      discountPercent: 10,
      categoryId: activeCategory.id,
      status: ProductStatus.PUBLISHED,
      stockStatus: StockStatus.IN_STOCK,
      inventoryQuantity: 10,
      lowStockThreshold: 2,
      priority: 20,
      attributes: { stoneType: 'Rose Quartz', intention: ['Love'] },
      publishedAt: new Date(),
    },
  });

  await prisma.productImage.createMany({
    data: [
      {
        productId: product.id,
        imageUrl: 'https://example.com/e2e-rose-primary.jpg',
        thumbnailUrl: 'https://example.com/e2e-rose-primary-thumb.webp',
        cardUrl: 'https://example.com/e2e-rose-primary-card.webp',
        detailUrl: 'https://example.com/e2e-rose-primary-detail.webp',
        storageKey: 'products/e2e/e2e-rose-primary-detail.webp',
        storageProvider: 'r2',
        mimeType: 'image/webp',
        sizeBytes: 12000,
        altText: 'E2E Rose Quartz primary image',
        isPrimary: true,
        sortOrder: 0,
      },
      {
        productId: product.id,
        imageUrl: 'https://example.com/e2e-rose-secondary.jpg',
        thumbnailUrl: 'https://example.com/e2e-rose-secondary-thumb.webp',
        cardUrl: 'https://example.com/e2e-rose-secondary-card.webp',
        detailUrl: 'https://example.com/e2e-rose-secondary-detail.webp',
        altText: 'E2E Rose Quartz secondary image',
        isPrimary: false,
        sortOrder: 1,
      },
    ],
  });

  const draftProduct = await prisma.product.create({
    data: {
      name: 'E2E Draft Stone',
      slug: 'e2e-draft-stone',
      sku: 'E2E-DRAFT-001',
      price: 300,
      mrp: 400,
      categoryId: activeCategory.id,
      status: ProductStatus.DRAFT,
      stockStatus: StockStatus.IN_STOCK,
      inventoryQuantity: 5,
    },
  });

  const outOfStockProduct = await prisma.product.create({
    data: {
      name: 'E2E Out Of Stock Stone',
      slug: 'e2e-out-of-stock-stone',
      sku: 'E2E-OOS-001',
      price: 250,
      mrp: 350,
      categoryId: activeCategory.id,
      status: ProductStatus.PUBLISHED,
      stockStatus: StockStatus.OUT_OF_STOCK,
      inventoryQuantity: 0,
      publishedAt: new Date(),
    },
  });

  const hiddenCategoryProduct = await prisma.product.create({
    data: {
      name: 'E2E Hidden Category Product',
      slug: 'e2e-hidden-category-product',
      sku: 'E2E-HIDDEN-001',
      price: 450,
      mrp: 550,
      categoryId: inactiveCategory.id,
      status: ProductStatus.PUBLISHED,
      stockStatus: StockStatus.IN_STOCK,
      inventoryQuantity: 4,
      publishedAt: new Date(),
    },
  });

  const collection = await prisma.collection.create({
    data: {
      name: 'E2E Best Sellers',
      slug: 'best-sellers',
      description: 'Products often chosen by customers',
      isActive: true,
      priority: 10,
    },
  });

  const inactiveCollection = await prisma.collection.create({
    data: {
      name: 'E2E Inactive Collection',
      slug: 'e2e-inactive-collection',
      isActive: false,
    },
  });

  await prisma.collectionProduct.createMany({
    data: [
      { collectionId: collection.id, productId: product.id, sortOrder: 0 },
      { collectionId: collection.id, productId: draftProduct.id, sortOrder: 1 },
      {
        collectionId: collection.id,
        productId: hiddenCategoryProduct.id,
        sortOrder: 2,
      },
      {
        collectionId: inactiveCollection.id,
        productId: product.id,
        sortOrder: 0,
      },
    ],
  });

  return {
    activeCategory,
    inactiveCategory,
    product,
    draftProduct,
    outOfStockProduct,
    hiddenCategoryProduct,
    collection,
    inactiveCollection,
  };
}

export function expectSuccessEnvelope(body: unknown) {
  expect(body).toEqual(
    expect.objectContaining({
      success: true,
      message: expect.any(String),
      data: expect.anything(),
    }),
  );
}

export function expectErrorEnvelope(body: unknown) {
  expect(body).toEqual(
    expect.objectContaining({
      success: false,
      message: expect.any(String),
      errorCode: expect.any(String),
      timestamp: expect.any(String),
      path: expect.any(String),
    }),
  );
}
