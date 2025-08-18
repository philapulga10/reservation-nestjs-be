import { Throttle } from '@nestjs/throttler';

import { AdminLogService } from '@/admin/admin-log.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { UsersService } from '@/users/users.service';

// Role is now defined in schema

import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';

export class RegisterDto {
  email: string;
  password: string;
}

export class LoginDto {
  email: string;
  password: string;
}

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly adminLogService: AdminLogService
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  // @Throttle({ default: { limit: 20, ttl: 60 } })
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.usersService.registerUser(
      registerDto.email,
      registerDto.password
    );

    return {
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  // @Throttle({ default: { limit: 20, ttl: 60 } })
  async login(@Body() loginDto: LoginDto) {
    const { token, user } = await this.usersService.loginUser(
      loginDto.email,
      loginDto.password
    );

    if (user.role === 'ADMIN') {
      await this.adminLogService.logAction({
        adminId: user.id.toString(),
        action: 'LOGIN_SUCCESS',
        metadata: { email: loginDto.email },
      });
    }

    return {
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        role: user.role,
      },
    };
  }

  @Post('admin')
  async createAdmin(@Body() body: { email: string; password: string }) {
    return this.usersService.createAdminUser(body.email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Body() body: { email: string }) {
    return this.usersService.findByEmail(body.email);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Request() req) {
    const user = await this.usersService.findById(req.user.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
