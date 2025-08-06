import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '@/audit/audit.service';
import { User, Role } from '@prisma/client';

export interface LoginResult {
  token: string;
  user: User;
}

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
    private configService: ConfigService
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

    // Create JWT
    const secret =
      this.configService.get<string>('JWT_SECRET') || 'your_secret_key_here';
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      secret,
      { expiresIn: '7d' }
    );

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
