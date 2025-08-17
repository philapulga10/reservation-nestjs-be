import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerGuard } from '@nestjs/throttler';

import { AdminModule } from '@/admin/admin.module';
import { AuditModule } from '@/audit/audit.module';
import { AuthModule } from '@/auth/auth.module';
import { BookingsModule } from '@/bookings/bookings.module';
import { HotelsModule } from '@/hotels/hotels.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { RewardsModule } from '@/rewards/rewards.module';
import { UsersModule } from '@/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 1000, // 1000 requests per minute (increased for development)
      },
      {
        ttl: 60000, // 1 minute
        limit: 20, // 20 requests per minute for auth routes (increased)
        name: 'auth',
      },
    ]),
    UsersModule,
    HotelsModule,
    BookingsModule,
    AuthModule,
    AdminModule,
    AuditModule,
    RewardsModule,
  ],
  providers: [
    // Temporarily disabled rate limiting for development
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
  ],
})
export class AppModule {}
