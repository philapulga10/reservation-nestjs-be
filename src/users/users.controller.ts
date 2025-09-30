// import { Throttle } from '@nestjs/throttler';

import { UsersService } from '@/users/users.service';

import { Controller, Post, Body } from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('admin')
  async createAdmin(@Body() body: { email: string; password: string }) {
    return this.usersService.createAdminUser(body.email, body.password);
  }
}
