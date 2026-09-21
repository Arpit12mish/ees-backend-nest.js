import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  CurrentAdmin,
  type AdminPayload,
} from './decorators/current-admin.decorator';

@Controller('admin/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  async login(@Body() dto: AdminLoginDto) {
    const data = await this.authService.login(dto);
    return { success: true, message: 'Login successful', data };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentAdmin() admin: AdminPayload) {
    const data = await this.authService.getMe(admin.sub);
    return { success: true, message: 'Admin profile fetched', data };
  }
}
