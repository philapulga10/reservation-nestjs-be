import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { AdminLogService } from '@/admin/admin-log.service';
import { Role } from '@prisma/client';

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
  @Throttle({ default: { limit: 5, ttl: 60 } })
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
  @Throttle({ default: { limit: 5, ttl: 60 } })
  async login(@Body() loginDto: LoginDto) {
    const { token, user } = await this.usersService.loginUser(
      loginDto.email,
      loginDto.password
    );

    if (user.role === Role.ADMIN) {
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

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Request() req) {
    const user = await this.usersService.findById(req.user.userId);
    if (!user) {
      return { error: 'User not found' };
    }

    const userDoc = user as any;
    const { password, ...userWithoutPassword } = userDoc.toObject
      ? userDoc.toObject()
      : userDoc;
    return userWithoutPassword;
  }
}
