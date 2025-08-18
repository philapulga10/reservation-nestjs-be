#!/usr/bin/env ts-node

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/users/users.service';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function createAdmin() {
  let app;

  try {
    console.log('=== Create Admin User ===\n');

    // Initialize NestJS app
    console.log('Initializing application...');
    app = await NestFactory.createApplicationContext(AppModule);

    // Get UsersService
    const usersService = app.get(UsersService);

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

    console.log('\nCreating admin user...');
    console.log('Email:', email);
    console.log('Role: ADMIN');

    // Create admin user using UsersService
    const adminUser = await usersService.createAdminUser(email, password);

    console.log('\n✅ Admin user created successfully!');
    console.log('User ID:', adminUser.id);
    console.log('Email:', adminUser.email);
    console.log('Role:', adminUser.role);
    console.log('Created at:', adminUser.createdAt);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);

    if (error.message.includes('Email already registered')) {
      console.error(
        'This email is already registered. Please use a different email.'
      );
    } else if (error.message.includes('DATABASE_URL')) {
      console.error(
        'Database connection failed. Please check your .env file and database connection.'
      );
    } else {
      console.error('Unexpected error:', error.message);
    }

    process.exit(1);
  } finally {
    rl.close();
    if (app) {
      await app.close();
    }
  }
}

createAdmin();
