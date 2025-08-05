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
exports.RewardsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const reward_history_schema_1 = require("./schemas/reward-history.schema");
const user_schema_1 = require("../users/schemas/user.schema");
let RewardsService = class RewardsService {
    constructor(rewardHistoryModel, userModel) {
        this.rewardHistoryModel = rewardHistoryModel;
        this.userModel = userModel;
    }
    async earnPoint(data) {
        const user = await this.userModel.findById(data.userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        user.points = (user.points || 0) + data.amount;
        await user.save();
        await this.rewardHistoryModel.create({
            userId: new mongoose_2.Types.ObjectId(data.userId),
            points: data.amount,
            reason: data.reason,
            date: new Date(),
        });
        return { message: 'Points added', totalPoints: user.points };
    }
    async getPointHistory(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [history, total] = await Promise.all([
            this.rewardHistoryModel
                .find({ userId: new mongoose_2.Types.ObjectId(userId) })
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.rewardHistoryModel.countDocuments({ userId: new mongoose_2.Types.ObjectId(userId) }).exec(),
        ]);
        return {
            history,
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
    __param(0, (0, mongoose_1.InjectModel)(reward_history_schema_1.RewardHistory.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], RewardsService);
//# sourceMappingURL=rewards.service.js.map