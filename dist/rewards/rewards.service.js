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
exports.RewardsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RewardsService = class RewardsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async addPoints(data) {
        const rewardHistory = await this.prisma.rewardHistory.create({
            data,
        });
        await this.prisma.user.update({
            where: { id: data.userId },
            data: {
                points: {
                    increment: data.points,
                },
            },
        });
        return rewardHistory;
    }
    async getUserRewards(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [rewards, total] = await Promise.all([
            this.prisma.rewardHistory.findMany({
                where: { userId },
                orderBy: { date: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.rewardHistory.count({ where: { userId } }),
        ]);
        return {
            rewards,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getAllRewards(page = 1, limit = 10, search) {
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { reason: { contains: search, mode: 'insensitive' } },
                { user: { email: { contains: search, mode: 'insensitive' } } },
            ];
        }
        const [rewards, total] = await Promise.all([
            this.prisma.rewardHistory.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                        },
                    },
                },
                orderBy: { date: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.rewardHistory.count({ where }),
        ]);
        return {
            rewards,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
};
exports.RewardsService = RewardsService;
exports.RewardsService = RewardsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RewardsService);
//# sourceMappingURL=rewards.service.js.map