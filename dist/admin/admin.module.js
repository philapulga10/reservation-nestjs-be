"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const admin_log_controller_1 = require("./admin-log.controller");
const admin_log_service_1 = require("./admin-log.service");
const admin_log_schema_1 = require("./schemas/admin-log.schema");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: admin_log_schema_1.AdminLog.name, schema: admin_log_schema_1.AdminLogSchema }]),
        ],
        controllers: [admin_log_controller_1.AdminLogController],
        providers: [admin_log_service_1.AdminLogService],
        exports: [admin_log_service_1.AdminLogService],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map