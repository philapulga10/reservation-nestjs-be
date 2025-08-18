import * as bcrypt from 'bcrypt';

import { AuditLogService } from '@/audit/audit.service';
import { AuthService } from '@/auth/auth.service';
import { DatabaseService } from '@/database/database.service';
import { User } from '@/database/schema';

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
    private databaseService: DatabaseService,
    private auditLogService: AuditLogService,
    private authService: AuthService
  ) {}

  async registerUser(email: string, password: string): Promise<User> {
    // Check if user already exists
    const existing = await this.databaseService.findUserByEmail(email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Save user
    const user = await this.databaseService.createUser({
      email,
      password: hashedPassword,
      role: 'USER',
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
    const user = await this.databaseService.findUserByEmail(email);
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
    return this.databaseService.findUserByEmail(email);
  }

  async findById(id: string): Promise<User | null> {
    return this.databaseService.findUserById(id);
  }

  async createAdminUser(email: string, password: string): Promise<User> {
    // Check if user already exists
    const existing = await this.databaseService.findUserByEmail(email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Save admin user
    const adminUser = await this.databaseService.createUser({
      email,
      password: hashedPassword,
      role: 'ADMIN',
    });

    // Audit log
    await this.auditLogService.logAction({
      userEmail: email,
      action: 'create_admin',
      collectionName: 'users',
      objectId: adminUser.id,
      after: {
        email: adminUser.email,
        role: adminUser.role,
        createdAt: adminUser.createdAt,
      },
    });

    return adminUser;
  }
}
