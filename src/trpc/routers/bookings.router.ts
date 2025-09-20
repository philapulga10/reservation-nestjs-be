import { z } from 'zod';
import { publicProcedure, router } from '../trpc.core';

export const bookingsRouter = router({
  list: publicProcedure
    .input(
      z.object({
        token: z.string(),
        page: z.number().int().positive().optional(),
        limit: z.number().int().positive().optional(),
        status: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify token and get user
      const payload = await ctx.authService!.verifyToken(input.token);
      const user = await ctx.usersService!.findById(payload.userId);

      if (!user) {
        throw new Error('User not found');
      }

      const filter: Record<string, any> = {};

      // Handle status parameter
      if (input.status !== undefined) {
        if (input.status === 'cancelled') {
          filter.isCancelled = true;
        } else if (input.status === 'active') {
          filter.isCancelled = false;
        }
      }

      return ctx.bookingsService!.getBookingsForUser(
        user.email,
        input.page || 1,
        input.limit || 5,
        filter
      );
    }),
});
