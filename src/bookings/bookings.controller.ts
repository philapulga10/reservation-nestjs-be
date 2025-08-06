import {
  Controller,
  Get,
  Post,
  Put,
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
  UpdateBookingDto,
} from './bookings.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { AdminLogService } from '@/admin/admin-log.service';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly adminLogService: AdminLogService
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBooking(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.createBooking(createBookingDto);
  }

  @Get()
  async getBookings(
    @Request() req,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '6',
    @Query('isCancelled') isCancelled?: string
  ) {
    const filter: Record<string, any> = {};
    if (isCancelled !== undefined) {
      filter.isCancelled = isCancelled === 'true';
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

  @Get('admin/all')
  async getAllBookingsForAdmin(
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

  @Get('admin/:id')
  async getBookingDetailForAdmin(@Param('id') id: string, @Request() req) {
    const booking = await this.bookingsService.getBookingById(id);
    if (!booking) {
      return { error: 'Booking not found' };
    }

    await this.adminLogService.logAction({
      adminId: req.user.userId,
      action: 'VIEW_BOOKING_DETAIL',
      metadata: { bookingId: id },
    });

    return booking;
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

  @Get('admin/stats')
  async getBookingStats() {
    return this.bookingsService.getBookingStats();
  }
}
