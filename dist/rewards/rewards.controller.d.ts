import { RewardsService, CreateRewardDto } from './rewards.service';
export declare class RewardsController {
    private readonly rewardsService;
    constructor(rewardsService: RewardsService);
    earnPoint(createRewardDto: CreateRewardDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        points: number;
        userId: string;
        date: Date;
        reason: string;
    }>;
    getPointHistory(page: string, limit: string, req: any): Promise<{
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
}
