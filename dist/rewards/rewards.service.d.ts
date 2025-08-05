import { PrismaService } from '../prisma/prisma.service';
import { RewardHistory } from '@prisma/client';
export interface CreateRewardDto {
    userId: string;
    points: number;
    reason: string;
}
export declare class RewardsService {
    private prisma;
    constructor(prisma: PrismaService);
    addPoints(data: CreateRewardDto): Promise<RewardHistory>;
    getUserRewards(userId: string, page?: number, limit?: number): Promise<{
        rewards: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            points: number;
            userId: string;
            date: Date;
            reason: string;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getAllRewards(page?: number, limit?: number, search?: string): Promise<{
        rewards: ({
            user: {
                id: string;
                email: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            points: number;
            userId: string;
            date: Date;
            reason: string;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
