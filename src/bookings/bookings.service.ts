import { Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService
  ) {}

  async createBooking(data: CreateBookingDto): Promise<Booking> {
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
      bookings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
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
      bookings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
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
}
