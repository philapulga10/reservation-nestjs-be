"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = exports.LoginDto = exports.RegisterDto = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const users_service_1 = require("./users.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const admin_log_service_1 = require("../admin/admin-log.service");
const client_1 = require("@prisma/client");
class RegisterDto {
}
exports.RegisterDto = RegisterDto;
class LoginDto {
}
exports.LoginDto = LoginDto;
let UsersController = class UsersController {
    constructor(usersService, adminLogService) {
        this.usersService = usersService;
        this.adminLogService = adminLogService;
    }
    async register(registerDto) {
        const user = await this.usersService.registerUser(registerDto.email, registerDto.password);
        return {
            message: 'User registered successfully',
            user: {
                id: user.id,
                email: user.email,
                createdAt: user.createdAt,
            },
        };
    }
    async login(loginDto) {
        const { token, user } = await this.usersService.loginUser(loginDto.email, loginDto.password);
        if (user.role === client_1.Role.ADMIN) {
            await this.adminLogService.logAction({
                adminId: user.id.toString(),
                action: 'LOGIN_SUCCESS',
                metadata: { email: loginDto.email },
            });
        }
        return {
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                createdAt: user.createdAt,
                role: user.role,
            },
        };
    }
    async getCurrentUser(req) {
        const user = await this.usersService.findById(req.user.userId);
        if (!user) {
            return { error: 'User not found' };
        }
        const userDoc = user;
        const { password, ...userWithoutPassword } = userDoc.toObject
            ? userDoc.toObject()
            : userDoc;
        return userWithoutPassword;
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60 } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RegisterDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60 } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getCurrentUser", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        admin_log_service_1.AdminLogService])
], UsersController);
//# sourceMappingURL=users.controller.js.map