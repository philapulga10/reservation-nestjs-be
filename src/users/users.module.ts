import { Module } from '@nestjs/common';

import { AdminModule } from '@/admin/admin.module';
import { AuditModule } from '@/audit/audit.module';
import { AuthModule } from '@/auth/auth.module';

import { PrismaModule } from '@/prisma/prisma.module';
import { UsersController } from '@/users/users.controller';
import { UsersService } from '@/users/users.service';

@Module({
  imports: [PrismaModule, AuditModule, AdminModule, AuthModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}