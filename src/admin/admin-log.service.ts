import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { AdminLog } from '@/database/schema';

export interface LogActionDto {
  adminId: string;
  action: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class AdminLogService {
  constructor(private databaseService: DatabaseService) {}

  async logAction(data: LogActionDto): Promise<AdminLog> {
    return this.databaseService.createAdminLog({
      adminId: data.adminId,
      action: data.action,
      metadata: data.metadata || {},
    });
  }

  async getAdminLogs(
    page: number = 1,
    limit: number = 10,
    action?: string,
    adminEmail?: string,
    fromDate?: string,
    toDate?: string
  ) {
    return this.databaseService.getAdminLogs({
      page,
      limit,
      action,
      adminEmail,
      fromDate,
      toDate,
    });
  }
}
