import { Controller, UseGuards } from '@nestjs/common';

import { AuditLogService } from '@/audit/audit.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('audits')
@UseGuards(JwtAuthGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}
}
