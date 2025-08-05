import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit/audit.service';
import { Booking } from '@prisma/client';
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
    private prisma;
    private auditLogService;
    constructor(prisma: PrismaService, auditLogService: AuditLogService);
    createBooking(data: CreateBookingDto): Promise<Booking>;
    getBookingsForUser(email: string, page?: number, limit?: number, filter?: Record<string, any>): Promise<{
        bookings: {
            id: string;
            userEmail: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            hotelId: string;
            hotelName: string;
            numDays: number;
            numRooms: number;
            totalPrice: number;
            isCancelled: boolean;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getAllBookings(page?: number, limit?: number, search?: string, filter?: Record<string, any>): Promise<{
        bookings: {
            id: string;
            userEmail: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            hotelId: string;
            hotelName: string;
            numDays: number;
            numRooms: number;
            totalPrice: number;
            isCancelled: boolean;
        }[];
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
