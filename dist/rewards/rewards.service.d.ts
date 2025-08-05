import { Model } from 'mongoose';
import { RewardHistory, RewardHistoryDocument } from './schemas/reward-history.schema';
import { UserDocument } from '../users/schemas/user.schema';
export interface EarnPointDto {
    userId: string;
    amount: number;
    reason: string;
}
export declare class RewardsService {
    private rewardHistoryModel;
    private userModel;
    constructor(rewardHistoryModel: Model<RewardHistoryDocument>, userModel: Model<UserDocument>);
    earnPoint(data: EarnPointDto): Promise<{
        message: string;
        totalPoints: number;
    }>;
    getPointHistory(userId: string, page?: number, limit?: number): Promise<{
        history: (import("mongoose").Document<unknown, {}, RewardHistoryDocument, {}, {}> & RewardHistory & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
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
