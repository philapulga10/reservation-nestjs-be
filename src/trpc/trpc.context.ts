import { inferAsyncReturnType } from '@trpc/server';
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { HotelsService } from '@/hotels/hotels.service';

export type CreateContextParams = CreateExpressContextOptions & {
  hotelsService?: HotelsService;
};

export async function createContext({ req, res, hotelsService }: CreateContextParams) {
  return { req, res, hotelsService };
}

export type TrpcContext = inferAsyncReturnType<typeof createContext>;


