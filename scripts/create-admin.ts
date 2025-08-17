#!/usr/bin/env ts-node

import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

async function createAdmin(): Promise<void> {
  try {
    console.log('=== Tạo Admin User ===\n');

    const email = await question('Nhập email cho admin: ');
    const password = await question('Nhập password cho admin: ');
    const confirmPassword = await question('Xác nhận password: ');

    if (password !== confirmPassword) {
      console.log('❌ Password không khớp!');
      process.exit(1);
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      console.log('❌ Email đã tồn tại!');
      process.exit(1);
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: Role.ADMIN,
      },
    });

    console.log('\n✅ Admin user đã được tạo thành công!');
    console.log(`📧 Email: ${adminUser.email}`);
    console.log(`🆔 ID: ${adminUser.id}`);
    console.log(`👤 Role: ${adminUser.role}`);
    console.log(`📅 Created: ${adminUser.createdAt}`);
  } catch (error) {
    console.error(
      '❌ Lỗi khi tạo admin:',
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

// Run the script
createAdmin();
