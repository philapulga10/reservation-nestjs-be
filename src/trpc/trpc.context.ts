import { inferAsyncReturnType } from '@trpc/server';
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { HotelsService } from '../hotels/hotels.service';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { BookingsService } from '../bookings/bookings.service';
import { AdminLogService } from '../admin/admin-log.service';

export type CreateContextParams = CreateExpressContextOptions & {
  hotelsService?: HotelsService;
  usersService?: UsersService;
  authService?: AuthService;
  bookingsService?: BookingsService;
  adminLogService?: AdminLogService;
};

export async function createContext({
  req,
  res,
  hotelsService,
  usersService,
  authService,
  bookingsService,
  adminLogService,
}: CreateContextParams) {
  return {
    req,
    res,
    hotelsService,
    usersService,
    authService,
    bookingsService,
    adminLogService,
  };
}

export type TrpcContext = inferAsyncReturnType<typeof createContext>;
