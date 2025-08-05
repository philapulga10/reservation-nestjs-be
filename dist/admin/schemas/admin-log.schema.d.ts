import { Document, Types } from 'mongoose';
export type AdminLogDocument = AdminLog & Document;
export declare class AdminLog {
    adminId?: Types.ObjectId;
    action: string;
    metadata: Record<string, any>;
}
export declare const AdminLogSchema: import("mongoose").Schema<AdminLog, import("mongoose").Model<AdminLog, any, any, any, Document<unknown, any, AdminLog, any, {}> & AdminLog & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, AdminLog, Document<unknown, {}, import("mongoose").FlatRecord<AdminLog>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<AdminLog> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
