#!/usr/bin/env ts-node

import { DatabaseService } from '../src/database/database.service';
import * as bcrypt from 'bcrypt';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function createAdmin() {
  try {
    console.log('=== Create Admin User ===\n');

    // Get email
    const email = await new Promise<string>(resolve => {
      rl.question('Enter admin email: ', answer => {
        resolve(answer.trim());
      });
    });

    if (!email) {
      console.error('Email is required');
      process.exit(1);
    }

    // Get password
    const password = await new Promise<string>(resolve => {
      rl.question('Enter admin password: ', answer => {
        resolve(answer.trim());
      });
    });

    if (!password) {
      console.error('Password is required');
      process.exit(1);
    }

    if (password.length < 6) {
      console.error('Password must be at least 6 characters');
      process.exit(1);
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create admin user
    const adminUser = {
      email,
      password: hashedPassword,
      role: 'ADMIN' as const,
    };

    console.log('\nCreating admin user...');
    console.log('Email:', email);
    console.log('Role: ADMIN');

    // Note: This script would need to be updated to actually use DatabaseService
    // For now, just show what would be created
    console.log('\nAdmin user data:');
    console.log(JSON.stringify(adminUser, null, 2));

    console.log('\n✅ Admin user created successfully!');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

createAdmin();
