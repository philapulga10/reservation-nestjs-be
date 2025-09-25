import { Module, forwardRef } from '@nestjs/common';

import { AdminLogService } from '@/admin/admin-log.service';
import { BookingsModule } from '@/bookings/bookings.module';
import { DatabaseModule } from '@/database/database.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => BookingsModule)],
  controllers: [],
  providers: [AdminLogService],
  exports: [AdminLogService],
})
export class AdminModule {}
