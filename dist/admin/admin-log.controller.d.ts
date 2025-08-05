import { AdminLogService } from './admin-log.service';
export declare class AdminLogController {
    private readonly adminLogService;
    constructor(adminLogService: AdminLogService);
    getLogs(page?: string, limit?: string, search?: string): Promise<{
        logs: (import("mongoose").Document<unknown, {}, import("./schemas/admin-log.schema").AdminLogDocument, {}, {}> & import("./schemas/admin-log.schema").AdminLog & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
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
