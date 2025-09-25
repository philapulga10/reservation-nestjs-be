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

  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { token, user } = await ctx.usersService!.loginUser(
        input.email,
        input.password
      );

      if (user.role === 'ADMIN') {
        await ctx.adminLogService!.logAction({
          adminId: user.id.toString(),
          action: 'LOGIN_SUCCESS',
          metadata: { email: input.email },
        });
      }

      return {
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
          role: user.role,
        },
      };
    }),

  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.usersService!.registerUser(
        input.email,
        input.password
      );

      return {
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
        },
      };
    }),

  logout: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const payload = await ctx.authService!.verifyToken(input.token);

      await ctx.usersService!.logoutUser(payload.userId, input.token);

      return {
        message: 'Logged out successfully',
      };
    }),
});
