import { Injectable } from '@nestjs/common';
import { AdminLog } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';

export interface LogActionDto {
  adminId?: string;
  action: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class AdminLogService {
  constructor(private prisma: PrismaService) {}

  async logAction(data: LogActionDto): Promise<AdminLog> {
    return this.prisma.adminLog.create({
      data: {
        adminId: data.adminId,
        action: data.action,
        metadata: data.metadata || {},
      },
    });
  }

  async getAdminLogs(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [{ action: { contains: search, mode: 'insensitive' } }];
    }

    const [logs, total] = await Promise.all([
      this.prisma.adminLog.findMany({
        where,
        include: {
          admin: {
            select: {
              id: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.adminLog.count({ where }),
    ]);

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
