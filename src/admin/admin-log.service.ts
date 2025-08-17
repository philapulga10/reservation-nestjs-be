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

  async getAdminLogs(
    page: number = 1, 
    limit: number = 10, 
    action?: string,
    fromDate?: string,
    toDate?: string,
    adminEmail?: string
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    // Filter by action
    if (action) {
      where.action = action;
    }

    // Filter by date range
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) {
        where.createdAt.gte = new Date(fromDate);
      }
      if (toDate) {
        where.createdAt.lte = new Date(toDate);
      }
    }

    // Filter by admin email
    if (adminEmail) {
      where.admin = {
        email: {
          contains: adminEmail,
          mode: 'insensitive'
        }
      };
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
      data: logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }
}
