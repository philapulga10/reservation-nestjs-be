import { inferAsyncReturnType } from '@trpc/server';
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { HotelsService } from '../hotels/hotels.service';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';

export type CreateContextParams = CreateExpressContextOptions & {
  hotelsService?: HotelsService;
  usersService?: UsersService;
  authService?: AuthService;
};

export async function createContext({
  req,
  res,
  hotelsService,
  usersService,
  authService,
}: CreateContextParams) {
  return { req, res, hotelsService, usersService, authService };
}

export type TrpcContext = inferAsyncReturnType<typeof createContext>;
