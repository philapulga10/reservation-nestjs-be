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
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const booking_schema_1 = require("./schemas/booking.schema");
const audit_service_1 = require("../audit/audit.service");
let BookingsService = class BookingsService {
    constructor(bookingModel, auditLogService) {
        this.bookingModel = bookingModel;
        this.auditLogService = auditLogService;
    }
    async createBooking(data) {
        const booking = new this.bookingModel(data);
        await booking.save();
        await this.auditLogService.logAction({
            userEmail: data.userEmail,
            action: 'create',
            collectionName: 'bookings',
            objectId: booking._id.toString(),
            after: booking.toObject(),
        });
        return booking;
    }
    async getBookingsForUser(email, page = 1, limit = 10, filter = {}) {
        const skip = (page - 1) * limit;
        const query = { userEmail: email, ...filter };
        const [bookings, total] = await Promise.all([
            this.bookingModel
                .find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.bookingModel.countDocuments(query).exec(),
        ]);
        return {
            bookings,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getAllBookings(page = 1, limit = 10, search, filter = {}) {
        const skip = (page - 1) * limit;
        let query = { ...filter };
        if (search) {
            query = {
                ...query,
                $or: [
                    { userEmail: { $regex: search, $options: 'i' } },
                    { hotelName: { $regex: search, $options: 'i' } },
                ],
            };
        }
        const [bookings, total] = await Promise.all([
            this.bookingModel
                .find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.bookingModel.countDocuments(query).exec(),
        ]);
        return {
            bookings,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getBookingById(id) {
        return this.bookingModel.findById(id).exec();
    }
    async updateBooking(id, data, userEmail) {
        const booking = await this.bookingModel.findById(id);
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        const before = booking.toObject();
        const updatedBooking = await this.bookingModel
            .findByIdAndUpdate(id, data, { new: true })
            .exec();
        if (updatedBooking) {
            await this.auditLogService.logAction({
                userEmail,
                action: 'update',
                collectionName: 'bookings',
                objectId: id,
                before,
                after: updatedBooking.toObject(),
            });
        }
        return updatedBooking;
    }
    async cancelBooking(id, userEmail) {
        const booking = await this.bookingModel.findById(id);
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        const before = booking.toObject();
        const cancelledBooking = await this.bookingModel
            .findByIdAndUpdate(id, { isCancelled: true }, { new: true })
            .exec();
        if (cancelledBooking) {
            await this.auditLogService.logAction({
                userEmail,
                action: 'cancel',
                collectionName: 'bookings',
                objectId: id,
                before,
                after: cancelledBooking.toObject(),
            });
        }
        return cancelledBooking;
    }
    async toggleStatus(id, userEmail) {
        const booking = await this.bookingModel.findById(id);
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        const before = booking.toObject();
        const updatedBooking = await this.bookingModel
            .findByIdAndUpdate(id, { isCancelled: !booking.isCancelled }, { new: true })
            .exec();
        if (updatedBooking) {
            await this.auditLogService.logAction({
                userEmail,
                action: 'toggle_status',
                collectionName: 'bookings',
                objectId: id,
                before,
                after: updatedBooking.toObject(),
            });
        }
        return updatedBooking;
    }
    async getBookingStats() {
        const [total, cancelled, active] = await Promise.all([
            this.bookingModel.countDocuments().exec(),
            this.bookingModel.countDocuments({ isCancelled: true }).exec(),
            this.bookingModel.countDocuments({ isCancelled: false }).exec(),
        ]);
        return {
            total,
            cancelled,
            active,
        };
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(booking_schema_1.Booking.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        audit_service_1.AuditLogService])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map