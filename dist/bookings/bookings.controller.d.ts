import { BookingsService, CreateBookingDto, UpdateBookingDto } from "./bookings.service";
import { AdminLogService } from "../admin/admin-log.service";
export declare class BookingsController {
    private readonly bookingsService;
    private readonly adminLogService;
    constructor(bookingsService: BookingsService, adminLogService: AdminLogService);
    createBooking(createBookingDto: CreateBookingDto): Promise<import("./schemas/booking.schema").Booking>;
    getBookings(req: any, page?: string, limit?: string, isCancelled?: string): Promise<{
        bookings: (import("mongoose").Document<unknown, {}, import("./schemas/booking.schema").BookingDocument, {}, {}> & import("./schemas/booking.schema").Booking & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    updateBooking(id: string, updateBookingDto: UpdateBookingDto, req: any): Promise<import("./schemas/booking.schema").Booking>;
    cancelBooking(id: string, req: any): Promise<import("./schemas/booking.schema").Booking>;
    getAllBookingsForAdmin(req: any, page?: string, limit?: string, hotelName?: string, isCancelled?: string, search?: string): Promise<{
        bookings: (import("mongoose").Document<unknown, {}, import("./schemas/booking.schema").BookingDocument, {}, {}> & import("./schemas/booking.schema").Booking & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getBookingDetailForAdmin(id: string, req: any): Promise<import("./schemas/booking.schema").Booking | {
        error: string;
    }>;
    toggleBookingStatus(id: string, req: any): Promise<{
        success: boolean;
        isCancelled: boolean;
    }>;
    getBookingStats(): Promise<{
        total: number;
        cancelled: number;
        active: number;
    }>;
}
