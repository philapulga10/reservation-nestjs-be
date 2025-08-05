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
exports.AdminLogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AdminLogService = class AdminLogService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async logAction(data) {
        return this.prisma.adminLog.create({
            data: {
                adminId: data.adminId,
                action: data.action,
                metadata: data.metadata || {},
            },
        });
    }
    async getAdminLogs(page = 1, limit = 10, search) {
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [{ action: { contains: search, mode: 'insensitive' } }];
        }
        const [logs, total] = await Promise.all([
            this.prisma.adminLog.findMany({
                where,
                include: {
                    admin: {
                        select: {
                            id: true,
                            email: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.adminLog.count({ where }),
        ]);
        return {
            logs,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
};
exports.AdminLogService = AdminLogService;
exports.AdminLogService = AdminLogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminLogService);
//# sourceMappingURL=admin-log.service.js.map