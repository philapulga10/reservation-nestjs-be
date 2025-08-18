import { Module } from '@nestjs/common';

import { HotelsController } from '@/hotels/hotels.controller';
import { HotelsService } from '@/hotels/hotels.service';
import { DatabaseModule } from '@/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [HotelsController],
  providers: [HotelsService],
  exports: [HotelsService],
})
export class HotelsModule {}
