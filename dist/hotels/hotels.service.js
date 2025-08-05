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
exports.HotelsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const hotel_schema_1 = require("./schemas/hotel.schema");
let HotelsService = class HotelsService {
    constructor(hotelModel) {
        this.hotelModel = hotelModel;
    }
    async getHotels(location, search, page = 1, limit = 10) {
        const filter = {};
        if (location && location !== 'all')
            filter.location = location;
        if (search)
            filter.name = { $regex: search, $options: 'i' };
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.hotelModel.find(filter).skip(skip).limit(limit).exec(),
            this.hotelModel.countDocuments(filter).exec(),
        ]);
        return {
            data,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        };
    }
    async getHotelById(id) {
        return this.hotelModel.findById(id).exec();
    }
};
exports.HotelsService = HotelsService;
exports.HotelsService = HotelsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(hotel_schema_1.Hotel.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], HotelsService);
//# sourceMappingURL=hotels.service.js.map