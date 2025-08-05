import { Controller, Post, Get, Body, Query, UseGuards, Request } from '@nestjs/common';
import { RewardsService, EarnPointDto } from './rewards.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ireward')
@UseGuards(JwtAuthGuard)
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Post('earn')
  async earnPoint(@Body() earnPointDto: EarnPointDto) {
    return this.rewardsService.earnPoint(earnPointDto);
  }

  @Get('history')
  async getPointHistory(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Request() req,
  ) {
    return this.rewardsService.getPointHistory(
      req.user.userId,
      parseInt(page),
      parseInt(limit),
    );
  }
} 