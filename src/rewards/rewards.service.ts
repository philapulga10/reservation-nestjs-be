import { DatabaseService } from '@/database/database.service';
import { RewardHistory } from '@/database/schema';

import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

export interface CreateRewardDto {
  userId: string;
  amount: number;
  reason: string;
}

@Injectable()
export class RewardsService {
  constructor(private databaseService: DatabaseService) {}

  async addPoints(data: CreateRewardDto): Promise<RewardHistory> {
    // Validate required fields
    if (!data.userId || !data.amount || !data.reason) {
      throw new BadRequestException('userId, amount, and reason are required');
    }

    // Validate amount is positive
    if (data.amount <= 0) {
      throw new BadRequestException('Amount must be a positive number');
    }

    // Check if user exists
    const user = await this.databaseService.findUserById(data.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Create reward history record
    const rewardHistory = await this.databaseService.createRewardHistory({
      userId: data.userId,
      points: data.amount,
      reason: data.reason,
    });

    // Update user points
    await this.databaseService.updateUser(data.userId, {
      points: user.points + data.amount,
    });

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
