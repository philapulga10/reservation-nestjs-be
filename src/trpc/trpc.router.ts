import { router, publicProcedure } from './trpc.core';
import { hotelsRouter } from './routers/hotels.router';
import { usersRouter } from './routers/users.router';
import { bookingsRouter } from './routers/bookings.router';

export const appRouter = router({
  health: publicProcedure.query(() => ({ ok: true })),
  hotels: hotelsRouter,
  users: usersRouter,
  bookings: bookingsRouter,
});

export type AppRouter = typeof appRouter;
