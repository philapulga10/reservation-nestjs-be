import { router, publicProcedure } from './trpc.core';
import { hotelsRouter } from './routers/hotels.router';

export const appRouter = router({
  health: publicProcedure.query(() => ({ ok: true })),
  hotels: hotelsRouter,
});

export type AppRouter = typeof appRouter;
