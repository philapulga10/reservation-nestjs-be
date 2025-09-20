import { z } from 'zod';
import { publicProcedure, router } from '../trpc.core';

export const adminRouter = router({
  bookings: publicProcedure
    .input(
      z.object({
        token: z.string(),
        page: z.number().int().positive().optional(),
        limit: z.number().int().positive().optional(),
        searchKeyword: z.string().optional(),
        statusFilter: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const payload = await ctx.authService!.verifyToken(input.token);
      const user = await ctx.usersService!.findById(payload.userId);

      if (!user || user.role !== 'ADMIN') {
        throw new Error('Admin access required');
      }

      const filter: Record<string, any> = {};
      if (input.statusFilter) {
        if (input.statusFilter === 'cancelled') {
          filter.isCancelled = true;
        } else if (input.statusFilter === 'active') {
          filter.isCancelled = false;
        }
      }

      return ctx.bookingsService!.getAllBookings(
        input.page || 1,
        input.limit || 10,
        input.searchKeyword,
        filter
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
