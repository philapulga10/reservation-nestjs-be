import { ConfigService } from '@nestjs/config';
import { User, Role } from '@prisma/client';

import * as bcrypt from 'bcrypt';

import { AuditLogService } from '@/audit/audit.service';
import { AuthService } from '@/auth/auth.service';
import { PrismaService } from '@/prisma/prisma.service';

import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';

export interface LoginResult {
  token: string;
  user: User;
}

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
    private configService: ConfigService,
    private authService: AuthService
  ) {}

  async registerUser(email: string, password: string): Promise<User> {
    // Check if user already exists
    const existing = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Save user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: Role.USER,
      },
    });

    // Audit log
    await this.auditLogService.logAction({
      userEmail: email,
      action: 'register',
      collectionName: 'users',
      objectId: user.id,
      after: {
        email: user.email,
        createdAt: user.createdAt,
      },
    });

    return user;
  }

  async loginUser(email: string, password: string): Promise<LoginResult> {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Create JWT using AuthService
    const token = await this.authService.generateToken(user);

    // Audit log
    await this.auditLogService.logAction({
      userEmail: email,
      action: 'login',
      collectionName: 'users',
      objectId: user.id,
    });

    return { token, user };
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }
}