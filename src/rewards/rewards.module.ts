import { Module } from '@nestjs/common';

import { DatabaseModule } from '@/database/database.module';

import { RewardsService } from '@/rewards/rewards.service';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [RewardsService],
  exports: [RewardsService],
})
export class RewardsModule {}
