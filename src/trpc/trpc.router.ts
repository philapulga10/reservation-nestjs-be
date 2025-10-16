import { router, publicProcedure } from "@/trpc/trpc.core";
import { hotelsRouter } from "@/trpc/routers/hotels.router";
import { usersRouter } from "@/trpc/routers/users.router";
import { bookingsRouter } from "@/trpc/routers/bookings.router";
import { adminRouter } from "@/trpc/routers/admin.router";
import { rewardsRouter } from "@/trpc/routers/rewards.router";

export const appRouter = router({
  health: publicProcedure.query(() => ({ ok: true })),
  hotels: hotelsRouter,
  users: usersRouter,
  bookings: bookingsRouter,
  admin: adminRouter,
  rewards: rewardsRouter,
});

export type AppRouter = typeof appRouter;
