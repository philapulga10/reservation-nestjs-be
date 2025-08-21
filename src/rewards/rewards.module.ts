import { Module } from '@nestjs/common';

import { DatabaseModule } from '@/database/database.module';

import { MemberRewardsController } from '@/rewards/member-rewards.controller';
import { AdminRewardsController } from '@/rewards/admin-rewards.controller';
import { RewardsService } from '@/rewards/rewards.service';

@Module({
  imports: [DatabaseModule],
  controllers: [MemberRewardsController, AdminRewardsController],
  providers: [RewardsService],
  exports: [RewardsService],
})
export class RewardsModule {}
