import { Module } from '@nestjs/common';

import { DatabaseModule } from '@/database/database.module';

import { HotelsService } from '@/hotels/hotels.service';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [HotelsService],
  exports: [HotelsService],
})
export class HotelsModule {}
