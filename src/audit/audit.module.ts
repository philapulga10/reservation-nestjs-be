import { Module } from '@nestjs/common';
import { AuditLogController } from './audit.controller';
import { AuditLogService } from './audit.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AuditLogController],
  providers: [AuditLogService],
  exports: [AuditLogService],
})
export class AuditModule {}
