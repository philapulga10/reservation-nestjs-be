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
exports.BookingsController = void 0;
const common_1 = require("@nestjs/common");
const bookings_service_1 = require("./bookings.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const admin_log_service_1 = require("../admin/admin-log.service");
let BookingsController = class BookingsController {
    constructor(bookingsService, adminLogService) {
        this.bookingsService = bookingsService;
        this.adminLogService = adminLogService;
    }
    async createBooking(createBookingDto) {
        return this.bookingsService.createBooking(createBookingDto);
    }
    async getBookings(req, page = '1', limit = '6', isCancelled) {
        const filter = {};
        if (isCancelled !== undefined) {
            filter.isCancelled = isCancelled === 'true';
        }
        return this.bookingsService.getBookingsForUser(req.user.email, parseInt(page), parseInt(limit), filter);
    }
    async updateBooking(id, updateBookingDto, req) {
        return this.bookingsService.updateBooking(id, updateBookingDto, req.user.email);
    }
    async cancelBooking(id, req) {
        return this.bookingsService.cancelBooking(id, req.user.email);
    }
    async getAllBookingsForAdmin(req, page = '1', limit = '10', hotelName, isCancelled, search) {
        const filter = {};
        if (hotelName)
            filter.hotelName = hotelName;
        if (isCancelled !== undefined) {
            filter.isCancelled = isCancelled === 'true';
        }
        const bookings = await this.bookingsService.getAllBookings(parseInt(page), parseInt(limit), search, filter);
        if (hotelName || isCancelled !== undefined) {
            await this.adminLogService.logAction({
                adminId: req.user.userId,
                action: 'FILTER_BOOKING',
                metadata: { hotelName, isCancelled },
            });
        }
        if (search) {
            await this.adminLogService.logAction({
                adminId: req.user.userId,
                action: 'SEARCH_BOOKING',
                metadata: { search },
            });
        }
        await this.adminLogService.logAction({
            adminId: req.user.userId,
            action: 'ADMIN_VIEW_BOOKINGS',
            metadata: { page, limit, hotelName, isCancelled, search },
        });
        return bookings;
    }
    async getBookingDetailForAdmin(id, req) {
        const booking = await this.bookingsService.getBookingById(id);
        if (!booking) {
            return { error: 'Booking not found' };
        }
        await this.adminLogService.logAction({
            adminId: req.user.userId,
            action: 'VIEW_BOOKING_DETAIL',
            metadata: { bookingId: id },
        });
        return booking;
    }
    async toggleBookingStatus(id, req) {
        const updatedBooking = await this.bookingsService.toggleStatus(id, req.user.email);
        await this.adminLogService.logAction({
            adminId: req.user.userId,
            action: 'TOGGLE_BOOKING_STATUS',
            metadata: { bookingId: id, newStatus: updatedBooking.isCancelled },
        });
        return { success: true, isCancelled: updatedBooking.isCancelled };
    }
    async getBookingStats() {
        return this.bookingsService.getBookingStats();
    }
};
exports.BookingsController = BookingsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "createBooking", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('isCancelled')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "getBookings", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "updateBooking", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "cancelBooking", null);
__decorate([
    (0, common_1.Get)('admin/all'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('hotelName')),
    __param(4, (0, common_1.Query)('isCancelled')),
    __param(5, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "getAllBookingsForAdmin", null);
__decorate([
    (0, common_1.Get)('admin/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "getBookingDetailForAdmin", null);
__decorate([
    (0, common_1.Put)('admin/:id/toggle'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "toggleBookingStatus", null);
__decorate([
    (0, common_1.Get)('admin/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "getBookingStats", null);
exports.BookingsController = BookingsController = __decorate([
    (0, common_1.Controller)('bookings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [bookings_service_1.BookingsService,
        admin_log_service_1.AdminLogService])
], BookingsController);
//# sourceMappingURL=bookings.controller.js.map