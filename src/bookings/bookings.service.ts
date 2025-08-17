import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Booking } from '@prisma/client';

import { AuditLogService } from '@/audit/audit.service';
import { PrismaService } from '@/prisma/prisma.service';

export interface CreateBookingDto {
  hotelId: string;
  hotelName: string;
  numDays: number;
  numRooms: number;
  totalPrice: number;
}

export interface CreateBookingData extends CreateBookingDto {
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
    private prisma: PrismaService,
    private auditLogService: AuditLogService
  ) {}

  async createBooking(data: CreateBookingData): Promise<Booking> {
    // Validate required fields
    if (
      !data.hotelId ||
      !data.hotelName ||
      !data.numDays ||
      !data.numRooms ||
      !data.totalPrice
    ) {
      throw new BadRequestException('All booking fields are required');
    }

    // Validate positive values
    if (data.numDays <= 0 || data.numRooms <= 0 || data.totalPrice <= 0) {
      throw new BadRequestException(
        'Days, rooms, and price must be positive numbers'
      );
    }

    const booking = await this.prisma.booking.create({
      data,
    });

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
      data: bookings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async getAllBookings(
    page: number = 1,
    limit: number = 10,
    search?: string,
    filter: Record<string, any> = {}
  ) {
    const skip = (page - 1) * limit;
    let where: any = { ...filter };

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
      data: bookings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async getBookingById(id: string): Promise<Booking | null> {
    return this.prisma.booking.findUnique({
      where: { id },
    });
  }

  async updateBooking(
    id: string,
    data: UpdateBookingDto,
    userEmail: string
  ): Promise<Booking | null> {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const before = booking;
    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data,
    });

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
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const before = booking;
    const cancelledBooking = await this.prisma.booking.update({
      where: { id },
      data: { isCancelled: true },
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
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const before = booking;
    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: { isCancelled: !booking.isCancelled },
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
    const [totalBookings, activeBookings, cancelledBookings, totalRevenueAgg] =
      await Promise.all([
        this.prisma.booking.count(),
        this.prisma.booking.count({ where: { isCancelled: false } }),
        this.prisma.booking.count({ where: { isCancelled: true } }),
        this.prisma.booking.aggregate({
          _sum: {
            totalPrice: true,
          },
        }),
      ]);

    return {
      totalBookings,
      activeBookings,
      cancelledBookings,
      totalRevenue: totalRevenueAgg._sum.totalPrice || 0,
    };
  }
}
