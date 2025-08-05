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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config_1 = require("@nestjs/config");
const user_schema_1 = require("./schemas/user.schema");
const audit_service_1 = require("../audit/audit.service");
let UsersService = class UsersService {
    constructor(userModel, auditLogService, configService) {
        this.userModel = userModel;
        this.auditLogService = auditLogService;
        this.configService = configService;
    }
    async registerUser(email, password) {
        const existing = await this.userModel.findOne({ email });
        if (existing) {
            throw new common_1.ConflictException('Email already registered');
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const user = new this.userModel({ email, password: hashedPassword });
        await user.save();
        await this.auditLogService.logAction({
            userEmail: email,
            action: 'register',
            collectionName: 'users',
            objectId: user._id.toString(),
            after: {
                email: user.email,
                createdAt: user.createdAt,
            },
        });
        return user;
    }
    async loginUser(email, password) {
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const secret = this.configService.get('JWT_SECRET') || 'your_secret_key_here';
        const token = jwt.sign({
            userId: user._id,
            email: user.email,
            role: user.role,
        }, secret, { expiresIn: '7d' });
        await this.auditLogService.logAction({
            userEmail: email,
            action: 'login',
            collectionName: 'users',
            objectId: user._id.toString(),
        });
        return { token, user };
    }
    async findByEmail(email) {
        return this.userModel.findOne({ email }).exec();
    }
    async findById(id) {
        return this.userModel.findById(id).exec();
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        audit_service_1.AuditLogService,
        config_1.ConfigService])
], UsersService);
//# sourceMappingURL=users.service.js.map