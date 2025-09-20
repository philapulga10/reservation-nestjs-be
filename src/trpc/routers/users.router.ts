import { z } from 'zod';
import { publicProcedure, router } from '../trpc.core';

export const usersRouter = router({
  me: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      const payload = await ctx.authService!.verifyToken(input.token);
      const user = await ctx.usersService!.findById(payload.userId);

      if (!user) {
        throw new Error('User not found');
      }

      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }),
});
