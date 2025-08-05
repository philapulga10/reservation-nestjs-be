import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { UsersModule } from './users/users.module';
import { HotelsModule } from './hotels/hotels.module';
import { BookingsModule } from './bookings/bookings.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { AuditModule } from './audit/audit.module';
import { RewardsModule } from './rewards/rewards.module';
import { PrismaModule } from './prisma/prisma.module';
import { ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
      {
        ttl: 60000, // 1 minute
        limit: 5, // 5 requests per minute for auth routes
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
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
