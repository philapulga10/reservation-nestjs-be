import { z } from 'zod';

import { publicProcedure, router } from '../trpc.core';

export const hotelsRouter = router({
  list: publicProcedure
    .input(
      z
        .object({
          location: z.string().optional(),
          search: z.string().optional(),
          page: z.number().int().positive().optional(),
          limit: z.number().int().positive().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const { location, search, page = 1, limit = 10 } = input ?? {};
      return ctx.hotelsService!.getHotels(location, search, page, limit);
    }),
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.hotelsService!.getHotelById(input.id);
    }),
});
