import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(@Body() dto: CreateOrderDto) {
    const data = await this.ordersService.createOrder(dto);
    return { success: true, message: 'Order created successfully', data };
  }

  @Get(':orderNumber')
  async getOrder(@Param('orderNumber') orderNumber: string) {
    const data = await this.ordersService.getOrder(orderNumber);
    return { success: true, message: 'Order fetched successfully', data };
  }
}
