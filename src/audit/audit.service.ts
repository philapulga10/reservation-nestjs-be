import { Injectable } from '@nestjs/common';

import { DatabaseService } from '@/database/database.service';
import { AuditLog } from '@/database/schema';

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
  constructor(private databaseService: DatabaseService) {}

  async logAction(data: LogActionDto): Promise<AuditLog> {
    return this.databaseService.createAuditLog({
      userEmail: data.userEmail,
      action: data.action,
      collectionName: data.collectionName,
      objectId: data.objectId,
      before: data.before,
      after: data.after,
    });
  }

  async getAuditLogs(
    page: number = 1,
    limit: number = 10,
    action?: string,
    userEmail?: string,
    collectionName?: string,
    fromDate?: string,
    toDate?: string
  ) {
    return this.databaseService.getAuditLogs({
      page,
      limit,
      action,
      userEmail,
      collectionName,
      fromDate,
      toDate,
    });
  }
}
