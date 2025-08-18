import { AuditLogService } from '@/audit/audit.service';
import { Booking } from '@/database/schema';

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  DatabaseService,
  CreateBookingData,
  UpdateBookingData,
} from '@/database/database.service';

// ✅ Custom types để match với decimal schema
export interface CreateBookingDto {
  hotelId: string;
  hotelName: string;
  numDays: number;
  numRooms: number;
  totalPrice: number;
}

export interface CreateBookingDataDto extends CreateBookingDto {
  userId: string;
  userEmail: string;
}

export interface UpdateBookingDto {
  numDays?: number;
  numRooms?: number;
  totalPrice?: number;
}

export interface BookingStats {
  totalBookings: number;
  activeBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
}

@Injectable()
export class BookingsService {
  constructor(
    private databaseService: DatabaseService,
    private auditLogService: AuditLogService
  ) {}

  async createBooking(data: CreateBookingDataDto): Promise<Booking> {
    // Validate required fields
    if (
      !data.hotelId ||
      !data.hotelName ||
      !data.numDays ||
      !data.numRooms ||
      data.totalPrice === undefined
    ) {
      throw new BadRequestException('All booking fields are required');
    }

    // Validate positive values
    if (data.numDays <= 0 || data.numRooms <= 0 || data.totalPrice <= 0) {
      throw new BadRequestException(
        'Days, rooms, and price must be positive numbers'
      );
    }

    // ✅ Convert to database format
    const bookingData: CreateBookingData = {
      ...data,
      totalPrice: data.totalPrice, // Drizzle will automatically convert number → decimal
    };

    const booking = await this.databaseService.createBooking(bookingData);

    // Audit log
    await this.auditLogService.logAction({
      userEmail: data.userEmail,
      action: 'create',
      collectionName: 'bookings',
      objectId: booking.id,
      after: booking,
    });

    return booking;
  }

  async getBookingsForUser(
    email: string,
    page: number = 1,
    limit: number = 10,
    filter: Record<string, any> = {}
  ) {
    return this.databaseService.findBookingsForUser({
      userEmail: email,
      page,
      limit,
      ...filter,
    });
  }

  async getAllBookings(
    page: number = 1,
    limit: number = 10,
    search?: string,
    filter: Record<string, any> = {}
  ) {
    return this.databaseService.getAllBookings({
      page,
      limit,
      search,
      ...filter,
    });
  }

  async getBookingById(id: string): Promise<Booking | null> {
    return this.databaseService.findBookingById(id);
  }

  async updateBooking(
    id: string,
    data: UpdateBookingDto,
    userEmail: string
  ): Promise<Booking | null> {
    const booking = await this.databaseService.findBookingById(id);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const before = booking;

    // ✅ Convert to database format
    const updateData: UpdateBookingData = {
      ...data,
      updatedAt: new Date(),
    };

    const updatedBooking = await this.databaseService.updateBooking(
      id,
      updateData
    );

    // Audit log
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

  async cancelBooking(id: string, userEmail: string): Promise<Booking | null> {
    const booking = await this.databaseService.findBookingById(id);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const before = booking;
    const cancelledBooking = await this.databaseService.updateBooking(id, {
      isCancelled: true,
    });

    // Audit log
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

  async toggleStatus(id: string, userEmail: string): Promise<Booking | null> {
    const booking = await this.databaseService.findBookingById(id);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const before = booking;
    const updatedBooking = await this.databaseService.updateBooking(id, {
      isCancelled: !booking.isCancelled,
    });

    // Audit log
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

  async getBookingStats(): Promise<BookingStats> {
    return this.databaseService.getBookingStats();
  }
}
