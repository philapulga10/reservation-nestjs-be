import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { appRouter } from '../src/trpc/trpc.router';

// Generate TypeScript types from tRPC router
const generateTypes = () => {
  const routerType = typeof appRouter;
  
  // Create types content
  const typesContent = `// Auto-generated tRPC types from backend
// Run: npm run generate:trpc-types

import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '../../reservation-nestjs-be/src/trpc/trpc.router';

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

// Specific types for Hotels
export type HotelsListInput = RouterInputs['hotels']['list'];
export type HotelsListOutput = RouterOutputs['hotels']['list'];
export type HotelsByIdInput = RouterInputs['hotels']['byId'];
export type HotelsByIdOutput = RouterOutputs['hotels']['byId'];

// Health check types
export type HealthCheckOutput = RouterOutputs['health'];
`;

  // Ensure target directory exists
  const targetDir = join(__dirname, '../../reservation-fe/src/types');
  mkdirSync(targetDir, { recursive: true });
  
  // Write types file
  const targetFile = join(targetDir, 'trpc.ts');
  writeFileSync(targetFile, typesContent, 'utf-8');
  
  console.log(`✅ Generated tRPC types to: ${targetFile}`);
  console.log('📝 You can now import types from "@/types/trpc" in your frontend code');
};

generateTypes();
