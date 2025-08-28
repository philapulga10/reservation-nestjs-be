import { router, publicProcedure } from '@/trpc/trpc.core';
import { hotelsRouter } from '@/trpc/routers/hotels.router';

export const appRouter = router({
  health: publicProcedure.query(() => ({ ok: true })),
  hotels: hotelsRouter,
});

export type AppRouter = typeof appRouter;


