import { DatabaseService } from '@/database/database.service';
import { RewardHistory } from '@/database/schema';

import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { EarnPointsDto } from './rewards.dto';

@Injectable()
export class RewardsService {
  constructor(private databaseService: DatabaseService) {}

  async earnPoints(userId: string, dto: EarnPointsDto): Promise<RewardHistory> {
    const { amount, reason } = dto;

    if (!amount || amount <= 0) {
      throw new BadRequestException('Amount must be a positive number');
    }
    if (!reason) {
      throw new BadRequestException('Reason is required');
    }

    const user = await this.databaseService.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const newBalance = (user.points || 0) + amount;

    const rewardHistory = await this.databaseService.createRewardHistory({
      userId,
      points: amount,
      reason,
      balanceAfter: newBalance,
      type: 'EARN',
      actorId: userId,
      metadata: { source: 'member' },
      correlationId: dto.correlationId,
    });

    await this.databaseService.updateUser(userId, { points: newBalance });
    return rewardHistory;
  }

  async adjustPoints(
    targetUserId: string,
    delta: number,
    reason: string,
    actorId: string
  ): Promise<RewardHistory> {
    if (!targetUserId) throw new BadRequestException('userId is required');
    if (!reason) throw new BadRequestException('reason is required');
    if (!delta || delta === 0)
      throw new BadRequestException('delta must be a non-zero number');

    const user = await this.databaseService.findUserById(targetUserId);
    if (!user) throw new NotFoundException('User not found');

    const newBalance = (user.points || 0) + delta;

    const rewardHistory = await this.databaseService.createRewardHistory({
      userId: targetUserId,
      points: delta,
      reason: `ADMIN_ADJUST: ${reason}`,
      balanceAfter: newBalance,
      type: 'ADJUST',
      actorId,
      metadata: { source: 'admin' },
    });

    await this.databaseService.updateUser(targetUserId, { points: newBalance });
    return rewardHistory;
  }

  async getUserRewards(userId: string, page: number = 1, limit: number = 10) {
    return this.databaseService.findRewardHistoryByUserId({
      userId,
      page,
      limit,
    });
  }

  async getAllRewards(page: number = 1, limit: number = 10, search?: string) {
    return this.databaseService.getAllRewardHistory({
      page,
      limit,
      search,
    });
  }
}
