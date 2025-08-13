import { Injectable } from '@nestjs/common';
import { RewardHistory } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';

export interface CreateRewardDto {
  userId: string;
  points: number;
  reason: string;
}

@Injectable()
export class RewardsService {
  constructor(private prisma: PrismaService) {}

  async addPoints(data: CreateRewardDto): Promise<RewardHistory> {
    // Create reward history record
    const rewardHistory = await this.prisma.rewardHistory.create({
      data,
    });

    // Update user points
    await this.prisma.user.update({
      where: { id: data.userId },
      data: {
        points: {
          increment: data.points,
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
