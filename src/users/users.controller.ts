// import { Throttle } from '@nestjs/throttler';

import { UsersService } from '@/users/users.service';

import { Controller, Post, Get, Body } from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('admin')
  async createAdmin(@Body() body: { email: string; password: string }) {
    return this.usersService.createAdminUser(body.email, body.password);
  }

  @Get('profile')
  async getProfile(@Body() body: { email: string }) {
    return this.usersService.findByEmail(body.email);
  }
}
