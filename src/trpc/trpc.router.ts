import { router, publicProcedure } from './trpc.core';
import { hotelsRouter } from './routers/hotels.router';
import { usersRouter } from './routers/users.router';

export const appRouter = router({
  health: publicProcedure.query(() => ({ ok: true })),
  hotels: hotelsRouter,
  users: usersRouter,
});

export type AppRouter = typeof appRouter;
