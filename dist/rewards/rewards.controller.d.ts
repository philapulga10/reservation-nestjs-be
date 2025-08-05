import { RewardsService, EarnPointDto } from './rewards.service';
export declare class RewardsController {
    private readonly rewardsService;
    constructor(rewardsService: RewardsService);
    earnPoint(earnPointDto: EarnPointDto): Promise<{
        message: string;
        totalPoints: number;
    }>;
    getPointHistory(page: string, limit: string, req: any): Promise<{
        history: (import("mongoose").Document<unknown, {}, import("./schemas/reward-history.schema").RewardHistoryDocument, {}, {}> & import("./schemas/reward-history.schema").RewardHistory & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
