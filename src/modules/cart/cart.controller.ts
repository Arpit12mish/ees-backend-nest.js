import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('items')
  async addItem(@Body() dto: AddToCartDto) {
    const data = await this.cartService.addItem(dto);
    return { success: true, message: 'Item added to cart', data };
  }

  @Get(':sessionId')
  async getCart(@Param('sessionId') sessionId: string) {
    const data = await this.cartService.getCart(sessionId);
    return { success: true, message: 'Cart fetched successfully', data };
  }

  @Patch('items/:itemId')
  async updateItem(
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    const data = await this.cartService.updateItem(itemId, dto);
    return { success: true, message: 'Cart item updated', data };
  }

  @Delete('items/:itemId')
  async removeItem(@Param('itemId') itemId: string) {
    const data = await this.cartService.removeItem(itemId);
    return { success: true, message: 'Item removed from cart', data };
  }

  @Delete(':sessionId/clear')
  async clearCart(@Param('sessionId') sessionId: string) {
    const data = await this.cartService.clearCart(sessionId);
    return { success: true, message: 'Cart cleared', data };
  }
}
