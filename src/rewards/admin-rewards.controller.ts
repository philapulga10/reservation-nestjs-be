import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RewardsService } from '@/rewards/rewards.service';
import { AdminAdjustDto } from '@/rewards/rewards.dto';
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
  ParseIntPipe,
} from '@nestjs/common';

@UseGuards(JwtAuthGuard)
@Controller('admin/rewards')
export class AdminRewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  // Admin adds/subtracts points for any user
  @Post('adjust')
  async adjust(@Body() dto: AdminAdjustDto, @Request() req) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Admin privileges required');
    }
    return this.rewardsService.adjustPoints(
      dto.userId,
      dto.delta,
      dto.reason,
      req.user.userId
    );
  }

  // Admin views history of a specific user
  @Get('members/:userId/history')
  async historyByUserId(
    @Param('userId') userId: string,
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Admin privileges required');
    }
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.rewardsService.getUserRewards(userId, pageNum, limitNum);
  }

  // (optional) list system-wide transactions with search/paging
  @Get('transactions')
  async transactions(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string
  ) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Admin privileges required');
    }
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.rewardsService.getAllRewards(pageNum, limitNum, search);
  }
}
