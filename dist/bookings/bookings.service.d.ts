import { Model } from 'mongoose';
import { Booking, BookingDocument } from './schemas/booking.schema';
import { AuditLogService } from '../audit/audit.service';
export interface CreateBookingDto {
    userId: string;
    userEmail: string;
    hotelId: string;
    hotelName: string;
    numDays: number;
    numRooms: number;
    totalPrice: number;
}
export interface UpdateBookingDto {
    numDays?: number;
    numRooms?: number;
    totalPrice?: number;
}
export declare class BookingsService {
    private bookingModel;
    private auditLogService;
    constructor(bookingModel: Model<BookingDocument>, auditLogService: AuditLogService);
    createBooking(data: CreateBookingDto): Promise<Booking>;
    getBookingsForUser(email: string, page?: number, limit?: number, filter?: Record<string, any>): Promise<{
        bookings: (import("mongoose").Document<unknown, {}, BookingDocument, {}, {}> & Booking & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getAllBookings(page?: number, limit?: number, search?: string, filter?: Record<string, any>): Promise<{
        bookings: (import("mongoose").Document<unknown, {}, BookingDocument, {}, {}> & Booking & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getBookingById(id: string): Promise<Booking | null>;
    updateBooking(id: string, data: UpdateBookingDto, userEmail: string): Promise<Booking | null>;
    cancelBooking(id: string, userEmail: string): Promise<Booking | null>;
    toggleStatus(id: string, userEmail: string): Promise<Booking | null>;
    getBookingStats(): Promise<{
        total: number;
        cancelled: number;
        active: number;
    }>;
}
