import { initTRPC } from '@trpc/server';
import { TrpcContext } from '@/trpc/trpc.context';

const t = initTRPC.context<TrpcContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
