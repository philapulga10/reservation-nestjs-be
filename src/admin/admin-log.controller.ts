import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { AdminLogService } from '@/admin/admin-log.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('admin/logs')
@UseGuards(JwtAuthGuard)
export class AdminLogController {
  constructor(private readonly adminLogService: AdminLogService) {}

  @Get()
  async getLogs(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('action') action?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('adminEmail') adminEmail?: string
  ) {
    return this.adminLogService.getAdminLogs(
      parseInt(page),
      parseInt(limit),
      action,
      fromDate,
      toDate,
      adminEmail
    );
  }
}
