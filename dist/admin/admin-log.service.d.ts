import { Model } from 'mongoose';
import { AdminLog, AdminLogDocument } from './schemas/admin-log.schema';
export interface AdminLogData {
    adminId?: string;
    action: string;
    metadata?: Record<string, any>;
}
export declare class AdminLogService {
    private adminLogModel;
    constructor(adminLogModel: Model<AdminLogDocument>);
    logAction(data: AdminLogData): Promise<AdminLog>;
    getLogs(page?: number, limit?: number, search?: string): Promise<{
        logs: (import("mongoose").Document<unknown, {}, AdminLogDocument, {}, {}> & AdminLog & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
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
