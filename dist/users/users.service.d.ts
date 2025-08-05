import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { User, UserDocument } from './schemas/user.schema';
import { AuditLogService } from '../audit/audit.service';
export interface LoginResult {
    token: string;
    user: User;
}
export declare class UsersService {
    private userModel;
    private auditLogService;
    private configService;
    constructor(userModel: Model<UserDocument>, auditLogService: AuditLogService, configService: ConfigService);
    registerUser(email: string, password: string): Promise<User>;
    loginUser(email: string, password: string): Promise<LoginResult>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
}
