import { AdminLogService } from './admin-log.service';
export declare class AdminLogController {
    private readonly adminLogService;
    constructor(adminLogService: AdminLogService);
    getLogs(page?: string, limit?: string, search?: string): Promise<{
        logs: ({
            admin: {
                id: string;
                email: string;
            };
        } & {
            id: string;
            action: string;
            createdAt: Date;
            updatedAt: Date;
            adminId: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
