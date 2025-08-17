import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

import { RewardsService, CreateRewardDto } from '@/rewards/rewards.service';

import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';

@Controller('ireward')
@UseGuards(JwtAuthGuard)
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Post('earn')
  async earnPoint(@Body() createRewardDto: CreateRewardDto, @Request() req) {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Admin privileges required');
    }

    return this.rewardsService.addPoints(createRewardDto);
  }

  @Get('history')
  async getPointHistory(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Request() req
  ) {
    return this.rewardsService.getUserRewards(
      req.user.userId,
      parseInt(page),
      parseInt(limit)
    );
  }

  @Get('history/:userId')
  async getPointHistoryByUserId(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Param('userId') userId: string,
    @Request() req
  ) {
    // Check if user is admin or viewing their own history
    const isAdmin = req.user.role === 'ADMIN';
    const isSelf = req.user.userId === userId;

    if (!isAdmin && !isSelf) {
      throw new ForbiddenException('Access denied');
    }

    return this.rewardsService.getUserRewards(
      userId,
      parseInt(page),
      parseInt(limit)
    );
  }
}
