import { AuditLogService } from './audit.service';
export declare class AuditLogController {
    private readonly auditLogService;
    constructor(auditLogService: AuditLogService);
    getLogs(page?: string, limit?: string, search?: string): Promise<{
        logs: {
            id: string;
            userEmail: string | null;
            action: string;
            collectionName: string;
            objectId: string;
            before: import("@prisma/client/runtime/library").JsonValue | null;
            after: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
