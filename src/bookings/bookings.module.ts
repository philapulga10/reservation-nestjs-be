import { Module, forwardRef } from '@nestjs/common';

import { AdminModule } from '@/admin/admin.module';

import { AuditModule } from '@/audit/audit.module';
import { BookingsController } from '@/bookings/bookings.controller';
import { BookingsService } from '@/bookings/bookings.service';
import { DatabaseModule } from '@/database/database.module';

@Module({
  imports: [DatabaseModule, AuditModule, forwardRef(() => AdminModule)],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
