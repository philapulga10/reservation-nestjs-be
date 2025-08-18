import { Module } from '@nestjs/common';

import { DatabaseModule } from '@/database/database.module';

import { HotelsController } from '@/hotels/hotels.controller';
import { HotelsService } from '@/hotels/hotels.service';

@Module({
  imports: [DatabaseModule],
  controllers: [HotelsController],
  providers: [HotelsService],
  exports: [HotelsService],
})
export class HotelsModule {}
