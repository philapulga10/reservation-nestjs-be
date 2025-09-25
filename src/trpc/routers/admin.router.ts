import { z } from 'zod';
import { publicProcedure, router } from '../trpc.core';
import { BookingStatusFilter, filterToDomainStatus } from '@mini-pn/contracts';

export const adminRouter = router({
  bookings: publicProcedure
    .input(
      z.object({
        token: z.string(),
        page: z.number().int().positive().optional(),
        limit: z.number().int().positive().optional(),
        searchKeyword: z.string().optional(),
        statusFilter: BookingStatusFilter.optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const payload = await ctx.authService!.verifyToken(input.token);
      const user = await ctx.usersService!.findById(payload.userId);

      if (!user || user.role !== 'ADMIN') {
        throw new Error('Admin access required');
      }

      const domainStatus = filterToDomainStatus(input.statusFilter);
      return ctx.bookingsService!.getAllBookings(
        input.page || 1,
        input.limit || 10,
        input.searchKeyword,
        { status: domainStatus }
      );
    }),

  bookingStats: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      const payload = await ctx.authService!.verifyToken(input.token);
      const user = await ctx.usersService!.findById(payload.userId);

      if (!user || user.role !== 'ADMIN') {
        throw new Error('Admin access required');
      }

      return ctx.bookingsService!.getBookingStats();
    }),
});
