import { Module } from '@nestjs/common';

import { AuditLogController } from '@/audit/audit.controller';
import { AuditLogService } from '@/audit/audit.service';
import { DatabaseModule } from '@/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AuditLogController],
  providers: [AuditLogService],
  exports: [AuditLogService],
})
export class AuditModule {}
