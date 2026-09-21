import { Module } from '@nestjs/common';
import {
  AdminProductsController,
  AdminProductImagesController,
} from './admin-products.controller';
import { AdminProductsService } from './admin-products.service';

@Module({
  controllers: [AdminProductsController, AdminProductImagesController],
  providers: [AdminProductsService],
})
export class AdminProductsModule {}
