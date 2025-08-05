import { PrismaService } from '../prisma/prisma.service';
import { AuditLog } from '@prisma/client';
export interface LogActionDto {
    userEmail?: string;
    action: string;
    collectionName: string;
    objectId: string;
    before?: Record<string, any>;
    after?: Record<string, any>;
}
export declare class AuditLogService {
    private prisma;
    constructor(prisma: PrismaService);
    logAction(data: LogActionDto): Promise<AuditLog>;
    getAuditLogs(page?: number, limit?: number, search?: string): Promise<{
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
