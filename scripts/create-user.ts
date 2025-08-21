#!/usr/bin/env ts-node

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { DatabaseService } from '../src/database/database.service';
import * as readline from 'readline';
import * as bcrypt from 'bcrypt';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function createUser() {
  let app;

  try {
    console.log('=== Create Regular User ===\n');

    // Initialize NestJS app
    console.log('Initializing application...');
    app = await NestFactory.createApplicationContext(AppModule);

    // Get DatabaseService
    const databaseService = app.get(DatabaseService);

    // Get email
    const email = await new Promise<string>(resolve => {
      rl.question('Enter user email: ', answer => {
        resolve(answer.trim());
      });
    });

    if (!email) {
      console.error('Email is required');
      process.exit(1);
    }

    // Check if email already exists
    const existingUser = await databaseService.findUserByEmail(email);
    if (existingUser) {
      console.error('❌ User with this email already exists');
      process.exit(1);
    }

    // Get password
    const password = await new Promise<string>(resolve => {
      rl.question('Enter user password: ', answer => {
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
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('\nCreating user...');
    console.log('Email:', email);
    console.log('Role: USER');

    // Create user
    const userData = {
      email,
      password: hashedPassword,
      role: 'USER' as const,
      points: 0,
    };

    const createdUser = await databaseService.createUser(userData);

    console.log('\n✅ User created successfully!');
    console.log('User ID:', createdUser.id);
    console.log('Email:', createdUser.email);
    console.log('Role:', createdUser.role);
    console.log('Points:', createdUser.points);
    console.log('Created at:', createdUser.createdAt);

  } catch (error) {
    console.error('❌ Error creating user:', error);

    if (error.message.includes('DATABASE_URL')) {
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

createUser();
