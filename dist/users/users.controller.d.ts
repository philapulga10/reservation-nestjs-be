import { UsersService } from './users.service';
import { AdminLogService } from '../admin/admin-log.service';
export declare class RegisterDto {
    email: string;
    password: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class UsersController {
    private readonly usersService;
    private readonly adminLogService;
    constructor(usersService: UsersService, adminLogService: AdminLogService);
    register(registerDto: RegisterDto): Promise<{
        message: string;
        user: {
            id: string;
            email: string;
            createdAt: Date;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        message: string;
        token: string;
        user: {
            id: string;
            email: string;
            createdAt: Date;
            role: import(".prisma/client").$Enums.Role;
        };
    }>;
    getCurrentUser(req: any): Promise<any>;
}
