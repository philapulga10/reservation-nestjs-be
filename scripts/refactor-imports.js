const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Import mapping rules
const importMappings = [
  // Module imports
  { from: '../prisma/prisma.module', to: '@/prisma/prisma.module' },
  { from: '../prisma/prisma.service', to: '@/prisma/prisma.service' },
  { from: '../../prisma/prisma.service', to: '@/prisma/prisma.service' },
  
  // Auth imports
  { from: '../auth/guards/jwt-auth.guard', to: '@/auth/guards/jwt-auth.guard' },
  { from: '../../auth/guards/jwt-auth.guard', to: '@/auth/guards/jwt-auth.guard' },
  { from: '../auth/auth.module', to: '@/auth/auth.module' },
  
  // User imports
  { from: '../users/users.module', to: '@/users/users.module' },
  { from: '../users/users.service', to: '@/users/users.service' },
  
  // Hotel imports
  { from: '../hotels/hotels.module', to: '@/hotels/hotels.module' },
  { from: '../hotels/hotels.service', to: '@/hotels/hotels.service' },
  
  // Booking imports
  { from: '../bookings/bookings.module', to: '@/bookings/bookings.module' },
  { from: '../bookings/bookings.service', to: '@/bookings/bookings.service' },
  
  // Admin imports
  { from: '../admin/admin.module', to: '@/admin/admin.module' },
  { from: '../admin/admin-log.service', to: '@/admin/admin-log.service' },
  { from: '../admin/admin-log.controller', to: '@/admin/admin-log.controller' },
  
  // Audit imports
  { from: '../audit/audit.module', to: '@/audit/audit.module' },
  { from: '../audit/audit.service', to: '@/audit/audit.service' },
  { from: '../audit/audit.controller', to: '@/audit/audit.controller' },
  
  // Rewards imports
  { from: '../rewards/rewards.module', to: '@/rewards/rewards.module' },
  { from: '../rewards/rewards.service', to: '@/rewards/rewards.service' },
  { from: '../rewards/rewards.controller', to: '@/rewards/rewards.controller' },
];

function refactorImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  
  importMappings.forEach(mapping => {
    const regex = new RegExp(`from\\s+['"]${mapping.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, `from '${mapping.to}'`);
      hasChanges = true;
      console.log(`✅ Updated import in ${filePath}: ${mapping.from} → ${mapping.to}`);
    }
  });
  
  if (hasChanges) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
  
  return hasChanges;
}

// Find all TypeScript files
const files = glob.sync('src/**/*.ts', { ignore: ['src/**/*.spec.ts', 'src/**/*.test.ts'] });

console.log('🔄 Starting import refactoring...');
console.log(`📁 Found ${files.length} TypeScript files`);

let updatedFiles = 0;
files.forEach(file => {
  if (refactorImports(file)) {
    updatedFiles++;
  }
});

console.log(`\n✨ Refactoring complete!`);
console.log(`📊 Updated ${updatedFiles} files`);
console.log(`\n💡 Next steps:`);
console.log(`1. Run: npm run build`);
console.log(`2. Test your application`);
console.log(`3. Update any remaining imports manually if needed`); 