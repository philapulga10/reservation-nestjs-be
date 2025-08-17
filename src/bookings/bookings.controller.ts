import { AdminLogService } from '@/admin/admin-log.service';

import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  BookingsService,
  CreateBookingDto,
  CreateBookingData,
  UpdateBookingDto,
} from '@/bookings/bookings.service';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly adminLogService: AdminLogService
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBooking(
    @Body() createBookingDto: CreateBookingDto,
    @Request() req
  ) {
    const bookingData: CreateBookingData = {
      ...createBookingDto,
      userId: req.user.userId,
      userEmail: req.user.email,
    };
    return this.bookingsService.createBooking(bookingData);
  }

  @Get()
  async getBookings(
    @Request() req,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '6',
    @Query('isCancelled') isCancelled?: string,
    @Query('status') status?: string
  ) {
    const filter: Record<string, any> = {};

    // Handle both isCancelled and status parameters for compatibility
    if (isCancelled !== undefined) {
      filter.isCancelled = isCancelled === 'true';
    } else if (status !== undefined) {
      if (status === 'cancelled') {
        filter.isCancelled = true;
      } else if (status === 'active') {
        filter.isCancelled = false;
      }
    }

    return this.bookingsService.getBookingsForUser(
      req.user.email,
      parseInt(page),
      parseInt(limit),
      filter
    );
  }

  @Put(':id')
  async updateBooking(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @Request() req
  ) {
    return this.bookingsService.updateBooking(
      id,
      updateBookingDto,
      req.user.email
    );
  }

  @Delete(':id')
  async cancelBooking(@Param('id') id: string, @Request() req) {
    return this.bookingsService.cancelBooking(id, req.user.email);
  }

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



  @Put('admin/:id/toggle')
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

  @Get('admin/stats')
  async getBookingStats() {
    return this.bookingsService.getBookingStats();
  }

  @Get('admin/bookings/stats')
  async getAdminBookingStats() {
    return this.bookingsService.getBookingStats();
  }
}
