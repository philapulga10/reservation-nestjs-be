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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const client_1 = require("@prisma/client");
let UsersService = class UsersService {
    constructor(prisma, auditLogService, configService) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
        this.configService = configService;
    }
    async registerUser(email, password) {
        const existing = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existing) {
            throw new common_1.ConflictException('Email already registered');
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const user = await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: client_1.Role.USER,
            },
        });
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
    async loginUser(email, password) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const secret = this.configService.get('JWT_SECRET') || 'your_secret_key_here';
        const token = jwt.sign({
            userId: user.id,
            email: user.email,
            role: user.role,
        }, secret, { expiresIn: '7d' });
        await this.auditLogService.logAction({
            userEmail: email,
            action: 'login',
            collectionName: 'users',
            objectId: user.id,
        });
        return { token, user };
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }
    async findById(id) {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditLogService,
        config_1.ConfigService])
], UsersService);
//# sourceMappingURL=users.service.js.map