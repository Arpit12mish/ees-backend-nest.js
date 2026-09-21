import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import { validateEnv } from './config/env.validation';
import { PrismaModule } from './database/prisma.module';
import { EmailModule } from './modules/email/email.module';
import { HealthModule } from './modules/health/health.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { CollectionsModule } from './modules/collections/collections.module';
import { SeoModule } from './modules/seo/seo.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminCategoriesModule } from './modules/admin/categories/admin-categories.module';
import { AdminProductsModule } from './modules/admin/products/admin-products.module';
import { AdminCollectionsModule } from './modules/admin/collections/admin-collections.module';
import { AdminSeoModule } from './modules/admin/seo/admin-seo.module';
import { AdminCouponsModule } from './modules/admin/coupons/admin-coupons.module';
import { AdminOrdersModule } from './modules/admin/orders/admin-orders.module';
import { AdminInventoryModule } from './modules/admin/inventory/admin-inventory.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { ContactModule } from './modules/contact/contact.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AdminAnalyticsModule } from './modules/admin/analytics/admin-analytics.module';
import { ServicesModule } from './modules/services/services.module';
import { AdminServicesModule } from './modules/admin/services/admin-services.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { AdminReviewsModule } from './modules/admin/reviews/admin-reviews.module';
import { GuidesModule } from './modules/guides/guides.module';
import { AdminGuidesModule } from './modules/admin/guides/admin-guides.module';
import { FaqsModule } from './modules/faqs/faqs.module';
import { AdminFaqsModule } from './modules/admin/faqs/admin-faqs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      load: [appConfig, databaseConfig],
      validate: validateEnv,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 120,
      },
    ]),
    PrismaModule,
    EmailModule,
    HealthModule,
    CategoriesModule,
    ProductsModule,
    CollectionsModule,
    SeoModule,
    CouponsModule,
    CartModule,
    OrdersModule,
    PaymentsModule,
    AuthModule,
    AdminCategoriesModule,
    AdminProductsModule,
    AdminCollectionsModule,
    AdminSeoModule,
    AdminCouponsModule,
    AdminOrdersModule,
    AdminInventoryModule,
    UploadsModule,
    ContactModule,
    AnalyticsModule,
    AdminAnalyticsModule,
    ServicesModule,
    AdminServicesModule,
    ReviewsModule,
    AdminReviewsModule,
    GuidesModule,
    AdminGuidesModule,
    FaqsModule,
    AdminFaqsModule,
  ],
})
export class AppModule {}
