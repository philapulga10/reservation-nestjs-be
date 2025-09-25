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
      const payload = await ctx.authService!.verifyToken(input.token);
      const user = await ctx.usersService!.findById(payload.userId);

      if (!user) {
        throw new Error('User not found');
      }

      const filter: Record<string, any> = {};

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
        { status: input.status as 'active' | 'cancelled' | undefined }
      );
    }),

  create: publicProcedure
    .input(
      z.object({
        token: z.string(),
        hotelId: z.string(),
        hotelName: z.string(),
        numDays: z.number(),
        numRooms: z.number(),
        totalPrice: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const payload = await ctx.authService!.verifyToken(input.token);
      const user = await ctx.usersService!.findById(payload.userId);

      if (!user) {
        throw new Error('User not found');
      }

      const bookingData = {
        hotelId: input.hotelId,
        hotelName: input.hotelName,
        numDays: input.numDays,
        numRooms: input.numRooms,
        totalPrice: input.totalPrice,
        userId: user.id,
        userEmail: user.email,
      };

      return ctx.bookingsService!.createBooking(bookingData);
    }),

  cancel: publicProcedure
    .input(
      z.object({
        token: z.string(),
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const payload = await ctx.authService!.verifyToken(input.token);
      const user = await ctx.usersService!.findById(payload.userId);

      if (!user) {
        throw new Error('User not found');
      }

      return ctx.bookingsService!.cancelBooking(input.id, user.email);
    }),

  update: publicProcedure
    .input(
      z.object({
        token: z.string(),
        id: z.string(),
        payload: z.object({
          checkIn: z.string().optional(),
          checkOut: z.string().optional(),
          guests: z.number().optional(),
          numRooms: z.number().optional(),
          numDays: z.number().optional(),
          totalPrice: z.number().optional(),
          status: z
            .enum(['pending', 'confirmed', 'cancelled', 'completed'])
            .optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const payload = await ctx.authService!.verifyToken(input.token);
      const user = await ctx.usersService!.findById(payload.userId);

      if (!user) {
        throw new Error('User not found');
      }

      return ctx.bookingsService!.updateBooking(
        input.id,
        input.payload,
        user.email
      );
    }),
});
