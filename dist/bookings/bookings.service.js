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
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
let BookingsService = class BookingsService {
    constructor(prisma, auditLogService) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
    }
    async createBooking(data) {
        const booking = await this.prisma.booking.create({
            data,
        });
        await this.auditLogService.logAction({
            userEmail: data.userEmail,
            action: 'create',
            collectionName: 'bookings',
            objectId: booking.id,
            after: booking,
        });
        return booking;
    }
    async getBookingsForUser(email, page = 1, limit = 10, filter = {}) {
        const skip = (page - 1) * limit;
        const where = { userEmail: email, ...filter };
        const [bookings, total] = await Promise.all([
            this.prisma.booking.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.booking.count({ where }),
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
        let where = { ...filter };
        if (search) {
            where.OR = [
                { userEmail: { contains: search, mode: 'insensitive' } },
                { hotelName: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [bookings, total] = await Promise.all([
            this.prisma.booking.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.booking.count({ where }),
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
        return this.prisma.booking.findUnique({
            where: { id },
        });
    }
    async updateBooking(id, data, userEmail) {
        const booking = await this.prisma.booking.findUnique({
            where: { id },
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        const before = booking;
        const updatedBooking = await this.prisma.booking.update({
            where: { id },
            data,
        });
        await this.auditLogService.logAction({
            userEmail,
            action: 'update',
            collectionName: 'bookings',
            objectId: id,
            before,
            after: updatedBooking,
        });
        return updatedBooking;
    }
    async cancelBooking(id, userEmail) {
        const booking = await this.prisma.booking.findUnique({
            where: { id },
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        const before = booking;
        const cancelledBooking = await this.prisma.booking.update({
            where: { id },
            data: { isCancelled: true },
        });
        await this.auditLogService.logAction({
            userEmail,
            action: 'cancel',
            collectionName: 'bookings',
            objectId: id,
            before,
            after: cancelledBooking,
        });
        return cancelledBooking;
    }
    async toggleStatus(id, userEmail) {
        const booking = await this.prisma.booking.findUnique({
            where: { id },
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        const before = booking;
        const updatedBooking = await this.prisma.booking.update({
            where: { id },
            data: { isCancelled: !booking.isCancelled },
        });
        await this.auditLogService.logAction({
            userEmail,
            action: 'toggle_status',
            collectionName: 'bookings',
            objectId: id,
            before,
            after: updatedBooking,
        });
        return updatedBooking;
    }
    async getBookingStats() {
        const [total, cancelled, active] = await Promise.all([
            this.prisma.booking.count(),
            this.prisma.booking.count({ where: { isCancelled: true } }),
            this.prisma.booking.count({ where: { isCancelled: false } }),
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
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditLogService])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map