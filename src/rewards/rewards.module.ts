import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';

import { RewardsController } from '@/rewards/rewards.controller';
import { RewardsService } from '@/rewards/rewards.service';

@Module({
  imports: [PrismaModule],
  controllers: [RewardsController],
  providers: [RewardsService],
  exports: [RewardsService],
})
export class RewardsModule {}