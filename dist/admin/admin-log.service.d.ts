import { PrismaService } from '../prisma/prisma.service';
import { AdminLog } from '@prisma/client';
export interface LogActionDto {
    adminId?: string;
    action: string;
    metadata?: Record<string, any>;
}
export declare class AdminLogService {
    private prisma;
    constructor(prisma: PrismaService);
    logAction(data: LogActionDto): Promise<AdminLog>;
    getAdminLogs(page?: number, limit?: number, search?: string): Promise<{
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
