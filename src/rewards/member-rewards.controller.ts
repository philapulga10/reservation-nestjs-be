import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RewardsService } from '@/rewards/rewards.service';
import { EarnPointsDto } from '@/rewards/rewards.dto';
import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';

@UseGuards(JwtAuthGuard)
@Controller('rewards')
export class MemberRewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Post('earn')
  async earnPoint(@Body() dto: EarnPointsDto, @Request() req) {
    const userId = req.user.userId;
    return this.rewardsService.earnPoints(userId, dto);
  }

  @Get('history')
  async getMyHistory(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    return this.rewardsService.getUserRewards(
      req.user.userId,
      pageNum,
      limitNum
    );
  }
}
