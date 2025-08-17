import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';

import { AppModule } from '@/app.module';

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

  const port = process.env.PORT || 5000;
  await app.listen(port);

  logger.log(`🚀 Server running on http://localhost:${port}`);
}

bootstrap();
