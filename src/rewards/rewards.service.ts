import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { RewardHistory } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';

export interface CreateRewardDto {
  userId: string;
  amount: number;
  reason: string;
}

@Injectable()
export class RewardsService {
  constructor(private prisma: PrismaService) {}

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
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Create reward history record
    const rewardHistory = await this.prisma.rewardHistory.create({
      data: {
        userId: data.userId,
        points: data.amount,
        reason: data.reason,
      },
    });

    // Update user points
    await this.prisma.user.update({
      where: { id: data.userId },
      data: {
        points: {
          increment: data.amount,
        },
      },
    });

    return rewardHistory;
  }

  async getUserRewards(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [rewards, total] = await Promise.all([
      this.prisma.rewardHistory.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.rewardHistory.count({ where: { userId } }),
    ]);

    return {
      data: rewards,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async getAllRewards(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { reason: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [rewards, total] = await Promise.all([
      this.prisma.rewardHistory.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.rewardHistory.count({ where }),
    ]);

    return {
      data: rewards,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }
}
