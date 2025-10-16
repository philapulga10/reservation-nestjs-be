import { z } from 'zod';
import { publicProcedure, router } from "@/trpc/trpc.core";

export const rewardsRouter = router({
  earn: publicProcedure
    .input(
      z.object({
        token: z.string(),
        amount: z.number(),
        reason: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const payload = await ctx.authService!.verifyToken(input.token);
      const user = await ctx.usersService!.findById(payload.userId);

      if (!user) {
        throw new Error('User not found');
      }

      const earnPointsDto = {
        amount: input.amount,
        reason: input.reason,
      };

      return ctx.rewardsService!.earnPoints(user.id, earnPointsDto);
    }),

  history: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      const payload = await ctx.authService!.verifyToken(input.token);
      const user = await ctx.usersService!.findById(payload.userId);

      if (!user) {
        throw new Error('User not found');
      }

      return ctx.rewardsService!.getUserRewards(user.id, 1, 100);
    }),
});
