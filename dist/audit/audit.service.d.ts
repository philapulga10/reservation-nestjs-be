import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';
export interface AuditLogData {
    userEmail?: string;
    action: string;
    collectionName: string;
    objectId: string;
    before?: Record<string, any>;
    after?: Record<string, any>;
}
export declare class AuditLogService {
    private auditLogModel;
    constructor(auditLogModel: Model<AuditLogDocument>);
    logAction(data: AuditLogData): Promise<AuditLog>;
    getLogs(page?: number, limit?: number, search?: string): Promise<{
        logs: (import("mongoose").Document<unknown, {}, AuditLogDocument, {}, {}> & AuditLog & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
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
