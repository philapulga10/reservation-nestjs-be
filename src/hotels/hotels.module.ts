import { Module } from '@nestjs/common';

import { HotelsController } from '@/hotels/hotels.controller';
import { HotelsService } from '@/hotels/hotels.service';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HotelsController],
  providers: [HotelsService],
  exports: [HotelsService],
})
export class HotelsModule {}
