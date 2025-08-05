import { Document, Types } from 'mongoose';
export type RewardHistoryDocument = RewardHistory & Document;
export declare class RewardHistory {
    userId: Types.ObjectId;
    date: Date;
    points: number;
    reason: string;
}
export declare const RewardHistorySchema: import("mongoose").Schema<RewardHistory, import("mongoose").Model<RewardHistory, any, any, any, Document<unknown, any, RewardHistory, any, {}> & RewardHistory & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, RewardHistory, Document<unknown, {}, import("mongoose").FlatRecord<RewardHistory>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<RewardHistory> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
