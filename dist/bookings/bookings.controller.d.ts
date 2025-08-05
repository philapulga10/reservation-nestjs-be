import { BookingsService, CreateBookingDto, UpdateBookingDto } from './bookings.service';
import { AdminLogService } from '../admin/admin-log.service';
export declare class BookingsController {
    private readonly bookingsService;
    private readonly adminLogService;
    constructor(bookingsService: BookingsService, adminLogService: AdminLogService);
    createBooking(createBookingDto: CreateBookingDto): Promise<{
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
    }>;
    getBookings(req: any, page?: string, limit?: string, isCancelled?: string): Promise<{
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
    updateBooking(id: string, updateBookingDto: UpdateBookingDto, req: any): Promise<{
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
    }>;
    cancelBooking(id: string, req: any): Promise<{
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
    }>;
    getAllBookingsForAdmin(req: any, page?: string, limit?: string, hotelName?: string, isCancelled?: string, search?: string): Promise<{
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
    getBookingDetailForAdmin(id: string, req: any): Promise<{
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
    } | {
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
