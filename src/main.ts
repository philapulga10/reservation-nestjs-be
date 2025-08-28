import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import * as dotenv from 'dotenv';

import { AppModule } from '@/app.module';
import { appRouter } from '@/trpc/trpc.router';
import { createContext } from '@/trpc/trpc.context';
import { HotelsService } from '@/hotels/hotels.service';
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Enable CORS
  app.enableCors({
    origin: [
      process.env.CORS_ORIGIN || 'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3001',
      'http://localhost:3002',
    ],
    credentials: true,
  });

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  const expressInstance = app.getHttpAdapter().getInstance();
  expressInstance.use(
    '/trpc',
    createExpressMiddleware({
      router: appRouter,
      createContext: (opts) =>
        createContext({
          ...opts,
          hotelsService: app.get(HotelsService),
        } as any),
    })
  );

  const port = process.env.PORT || 5000;
  await app.listen(port as number);
  logger.log(`🚀 Server running on http://localhost:${port} (tRPC at /trpc)`);
}

bootstrap();
