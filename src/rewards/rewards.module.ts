import { Module } from '@nestjs/common';

import { DatabaseModule } from '@/database/database.module';

import { AdminRewardsController } from '@/rewards/admin-rewards.controller';
import { RewardsService } from '@/rewards/rewards.service';

@Module({
  imports: [DatabaseModule],
  controllers: [AdminRewardsController],
  providers: [RewardsService],
  exports: [RewardsService],
})
export class RewardsModule {}
