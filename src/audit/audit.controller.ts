import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditLogService } from './audit.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('audits')
@UseGuards(JwtAuthGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  async getLogs(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('search') search?: string
  ) {
    return this.auditLogService.getAuditLogs(
      parseInt(page),
      parseInt(limit),
      search
    );
  }
}
