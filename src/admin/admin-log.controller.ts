import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminLogService } from './admin-log.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('admin/logs')
@UseGuards(JwtAuthGuard)
export class AdminLogController {
  constructor(private readonly adminLogService: AdminLogService) {}

  @Get()
  async getLogs(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('search') search?: string
  ) {
    return this.adminLogService.getAdminLogs(
      parseInt(page),
      parseInt(limit),
      search
    );
  }
}
