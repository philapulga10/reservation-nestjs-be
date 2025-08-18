import { Module, forwardRef } from '@nestjs/common';

import { AdminBookingsController } from '@/admin/admin-bookings.controller';
import { AdminLogController } from '@/admin/admin-log.controller';
import { AdminLogService } from '@/admin/admin-log.service';
import { BookingsModule } from '@/bookings/bookings.module';
import { DatabaseModule } from '@/database/database.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => BookingsModule)],
  controllers: [AdminLogController, AdminBookingsController],
  providers: [AdminLogService],
  exports: [AdminLogService],
})
export class AdminModule {}
