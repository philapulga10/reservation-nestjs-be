import { Module, forwardRef } from '@nestjs/common';

import { AdminBookingsController } from '@/admin/admin-bookings.controller';
import { AdminLogController } from '@/admin/admin-log.controller';
import { AdminLogService } from '@/admin/admin-log.service';
import { BookingsModule } from '@/bookings/bookings.module';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule, forwardRef(() => BookingsModule)],
  controllers: [AdminLogController, AdminBookingsController],
  providers: [AdminLogService],
  exports: [AdminLogService],
})
export class AdminModule {}
