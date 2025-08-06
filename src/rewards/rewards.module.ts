import { Module } from '@nestjs/common';
import { RewardsController } from '@/rewards/rewards.controller';
import { RewardsService } from '@/rewards/rewards.service';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RewardsController],
  providers: [RewardsService],
  exports: [RewardsService],
})
export class RewardsModule {}
