import { Injectable } from '@nestjs/common';
import { AuditLog } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';

export interface LogActionDto {
  userEmail?: string;
  action: string;
  collectionName: string;
  objectId: string;
  before?: Record<string, any>;
  after?: Record<string, any>;
}

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async logAction(data: LogActionDto): Promise<AuditLog> {
    return this.prisma.auditLog.create({
      data: {
        userEmail: data.userEmail,
        action: data.action,
        collectionName: data.collectionName,
        objectId: data.objectId,
        before: data.before,
        after: data.after,
      },
    });
  }

  async getAuditLogs(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { userEmail: { contains: search, mode: 'insensitive' } },
        { action: { contains: search, mode: 'insensitive' } },
        { collectionName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }
}
