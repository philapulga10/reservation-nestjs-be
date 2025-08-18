import { AdminLogService } from '@/admin/admin-log.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { BookingsService } from '@/bookings/bookings.service';

import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  Param,
  Patch,
  NotFoundException,
} from '@nestjs/common';

export interface BookingStats {
  totalBookings: number;
  activeBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
}

@Controller('admin/bookings')
@UseGuards(JwtAuthGuard)
export class AdminBookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly adminLogService: AdminLogService
  ) {}

  @Get()
  async getAdminBookings(
    @Request() req,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('hotelName') hotelName?: string,
    @Query('isCancelled') isCancelled?: string,
    @Query('search') search?: string
  ) {
    const filter: Record<string, any> = {};
    if (hotelName) filter.hotelName = hotelName;
    if (isCancelled !== undefined) {
      filter.isCancelled = isCancelled === 'true';
    }

    const bookings = await this.bookingsService.getAllBookings(
      parseInt(page),
      parseInt(limit),
      search,
      filter
    );

    // Log admin actions
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

  @Get('stats')
  async getBookingStats(@Request() req) {
    const stats = await this.bookingsService.getBookingStats();

    await this.adminLogService.logAction({
      adminId: req.user.userId,
      action: 'VIEW_BOOKING_STATS',
      metadata: {},
    });

    return stats;
  }

  @Get(':id')
  async getBookingDetailForAdmin(@Request() req, @Param('id') id: string) {
    const booking = await this.bookingsService.getBookingById(id);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    await this.adminLogService.logAction({
      adminId: req.user.userId,
      action: 'VIEW_BOOKING_DETAIL',
      metadata: { bookingId: id },
    });

    return booking;
  }

  @Patch(':id/toggle-status')
  async toggleBookingStatus(@Param('id') id: string, @Request() req) {
    const updatedBooking = await this.bookingsService.toggleStatus(
      id,
      req.user.email
    );

    await this.adminLogService.logAction({
      adminId: req.user.userId,
      action: 'TOGGLE_BOOKING_STATUS',
      metadata: { bookingId: id, newStatus: updatedBooking.isCancelled },
    });

    return { success: true, isCancelled: updatedBooking.isCancelled };
  }
}
