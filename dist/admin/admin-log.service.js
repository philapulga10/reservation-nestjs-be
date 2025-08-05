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
exports.AdminLogService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const admin_log_schema_1 = require("./schemas/admin-log.schema");
let AdminLogService = class AdminLogService {
    constructor(adminLogModel) {
        this.adminLogModel = adminLogModel;
    }
    async logAction(data) {
        const adminLog = new this.adminLogModel({
            ...data,
            adminId: data.adminId ? new mongoose_2.Types.ObjectId(data.adminId) : undefined,
        });
        return adminLog.save();
    }
    async getLogs(page = 1, limit = 10, search) {
        const skip = (page - 1) * limit;
        let query = this.adminLogModel.find().populate('adminId', 'email');
        if (search) {
            query = query.or([
                { action: { $regex: search, $options: 'i' } },
                { 'metadata.email': { $regex: search, $options: 'i' } },
            ]);
        }
        const [logs, total] = await Promise.all([
            query.sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
            query.countDocuments().exec(),
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
    __param(0, (0, mongoose_1.InjectModel)(admin_log_schema_1.AdminLog.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], AdminLogService);
//# sourceMappingURL=admin-log.service.js.map