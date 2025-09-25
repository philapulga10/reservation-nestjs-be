import { AdminLogService } from '@/admin/admin-log.service';

import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

import {
  Controller,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BookingsService, UpdateBookingDto } from '@/bookings/bookings.service';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly adminLogService: AdminLogService
  ) {}

  @Patch(':id/cancel')
  async cancelBookingPatch(@Param('id') id: string, @Request() req) {
    const cancelledBooking = await this.bookingsService.cancelBooking(
      id,
      req.user.email
    );
    return {
      message: 'Booking cancelled successfully',
      booking: cancelledBooking,
    };
  }

  @Patch('admin/:id/cancel')
  async adminCancelBooking(@Param('id') id: string, @Request() req) {
    const cancelledBooking = await this.bookingsService.cancelBooking(
      id,
      req.user.email
    );

    await this.adminLogService.logAction({
      adminId: req.user.userId,
      action: 'CANCEL_BOOKING',
      metadata: { bookingId: id },
    });

    return { success: true, updated: cancelledBooking };
  }

  @Patch('admin/:id/toggle-status')
  async adminToggleBookingStatus(@Param('id') id: string, @Request() req) {
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

  @Patch('admin/:id')
  async adminUpdateBooking(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @Request() req
  ) {
    const updatedBooking = await this.bookingsService.updateBooking(
      id,
      updateBookingDto,
      req.user.email
    );

    await this.adminLogService.logAction({
      adminId: req.user.userId,
      action: 'UPDATE_BOOKING',
      metadata: { bookingId: id },
    });

    return { success: true, booking: updatedBooking };
  }
}
