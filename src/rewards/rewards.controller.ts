import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

import { RewardsService, CreateRewardDto } from '@/rewards/rewards.service';

import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';

@Controller('ireward')
@UseGuards(JwtAuthGuard)
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Post('earn')
  async earnPoint(@Body() createRewardDto: CreateRewardDto) {
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
}