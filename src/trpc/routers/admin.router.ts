import { z } from 'zod';
import { publicProcedure, router } from '../trpc.core';
import {
  BookingStatusFilter,
  filterToDomainStatus,
  AdminActions,
} from '@mini-pn/contracts';

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
      const result = await ctx.bookingsService!.getAllBookings(
        input.page || 1,
        input.limit || 10,
        input.searchKeyword,
        { status: domainStatus }
      );

      const hasFilters =
        input.searchKeyword ||
        (input.statusFilter && input.statusFilter !== 'all');
      await ctx.adminLogService!.logAction({
        adminId: user.id,
        action: hasFilters ? 'FILTER_BOOKING' : 'ADMIN_VIEW_BOOKINGS',
        metadata: {
          page: input.page,
          limit: input.limit,
          searchKeyword: input.searchKeyword,
          statusFilter: input.statusFilter,
          resultCount: result.data.length,
        },
      });

      return result;
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

  adjustPoints: publicProcedure
    .input(
      z.object({
        token: z.string(),
        userId: z.string(),
        delta: z.number(),
        reason: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const payload = await ctx.authService!.verifyToken(input.token);
      const user = await ctx.usersService!.findById(payload.userId);

      if (!user || user.role !== 'ADMIN') {
        throw new Error('Admin access required');
      }

      const result = await ctx.rewardsService!.adjustPoints(
        input.userId,
        input.delta,
        input.reason,
        user.id
      );

      await ctx.adminLogService!.logAction({
        adminId: user.id,
        action: AdminActions.enum.ADJUST_POINTS,
        metadata: {
          targetUserId: input.userId,
          delta: input.delta,
          reason: input.reason,
          newBalance: result.balanceAfter,
        },
      });

      return result;
    }),

  logs: publicProcedure
    .input(
      z.object({
        token: z.string(),
        page: z.string().optional(),
        limit: z.string().optional(),
        action: z.string().optional(),
        fromDate: z.string().optional(),
        toDate: z.string().optional(),
        adminEmail: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const payload = await ctx.authService!.verifyToken(input.token);
      const user = await ctx.usersService!.findById(payload.userId);

      if (!user || user.role !== 'ADMIN') {
        throw new Error('Admin access required');
      }

      const result = await ctx.adminLogService!.getAdminLogs(
        parseInt(input.page || '1'),
        parseInt(input.limit || '20'),
        input.action,
        input.fromDate,
        input.toDate,
        input.adminEmail
      );

      await ctx.adminLogService!.logAction({
        adminId: user.id,
        action: AdminActions.enum.ADMIN_VIEW_LOGS,
        metadata: {
          page: input.page,
          limit: input.limit,
          filters: {
            action: input.action,
            fromDate: input.fromDate,
            toDate: input.toDate,
            adminEmail: input.adminEmail,
          },
          resultCount: result.data?.length || 0,
        },
      });

      return result;
    }),

  rewardTransactions: publicProcedure
    .input(
      z.object({
        token: z.string(),
        page: z.number().int().positive().optional(),
        limit: z.number().int().positive().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const payload = await ctx.authService!.verifyToken(input.token);
      const user = await ctx.usersService!.findById(payload.userId);

      if (!user || user.role !== 'ADMIN') {
        throw new Error('Admin access required');
      }

      const result = await ctx.rewardsService!.getAllRewards(
        input.page || 1,
        input.limit || 10,
        input.search
      );

      await ctx.adminLogService!.logAction({
        adminId: user.id,
        action: AdminActions.enum.ADMIN_VIEW_REWARD_TRANSACTIONS,
        metadata: {
          page: input.page,
          limit: input.limit,
          search: input.search,
          resultCount: result.data?.length || 0,
        },
      });

      return result;
    }),

  toggleBookingStatus: publicProcedure
    .input(
      z.object({
        token: z.string(),
        bookingId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const payload = await ctx.authService!.verifyToken(input.token);
      const user = await ctx.usersService!.findById(payload.userId);

      if (!user || user.role !== 'ADMIN') {
        throw new Error('Admin access required');
      }

      const updatedBooking = await ctx.bookingsService!.toggleStatus(
        input.bookingId,
        user.email
      );

      await ctx.adminLogService!.logAction({
        adminId: user.id,
        action: 'TOGGLE_BOOKING_STATUS',
        metadata: {
          bookingId: input.bookingId,
          newStatus: updatedBooking.isCancelled,
        },
      });

      return { success: true, isCancelled: updatedBooking.isCancelled };
    }),

  usersList: publicProcedure
    .input(
      z.object({
        token: z.string(),
        q: z.string().optional(),
        page: z.number().int().positive().optional(),
        limit: z.number().int().positive().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const payload = await ctx.authService!.verifyToken(input.token);
      const me = await ctx.usersService!.findById(payload.userId);
      if (!me || me.role !== 'ADMIN') throw new Error('Admin access required');

      return ctx.usersService!.getUsers({
        q: input.q,
        page: input.page ?? 1,
        limit: input.limit ?? 20,
      });
    }),

  rewardStats: publicProcedure
    .input(
      z.object({
        token: z.string(),
        topN: z.number().int().positive().max(50).optional(),
        recentN: z.number().int().positive().max(50).optional(),
        fromDate: z.string().optional(), // expect 'YYYY-MM-DD' or ISO
        toDate: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const payload = await ctx.authService!.verifyToken(input.token);
      const me = await ctx.usersService!.findById(payload.userId);
      if (!me || me.role !== 'ADMIN') throw new Error('Admin access required');

      // optional: validate date strings more strictly here if needed
      return ctx.rewardsService!.getRewardStats(
        input.topN ?? 5,
        input.recentN ?? 5,
        input.fromDate,
        input.toDate
      );
    }),
});
