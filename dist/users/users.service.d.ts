import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit/audit.service';
import { User } from '@prisma/client';
export interface LoginResult {
    token: string;
    user: User;
}
export declare class UsersService {
    private prisma;
    private auditLogService;
    private configService;
    constructor(prisma: PrismaService, auditLogService: AuditLogService, configService: ConfigService);
    registerUser(email: string, password: string): Promise<User>;
    loginUser(email: string, password: string): Promise<LoginResult>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
}
