# Prisma Notes - Từ MongoDB Sang PostgreSQL

## Prisma là gì?

Prisma là một ORM (Object-Relational Mapping) hiện đại cho Node.js và TypeScript, cung cấp type safety và developer experience tốt hơn so với Mongoose.

## Các Bước Đã Thực Hiện

### 1. Cài Đặt Prisma

```bash
npm install @prisma/client
npm install -D prisma
```

### 2. Tạo Prisma Schema

File: `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  role      Role     @default(USER)
  points    Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  bookings        Booking[]
  rewardHistories RewardHistory[]
  adminLogs       AdminLog[]
}

model Hotel {
  id       String @id @default(cuid())
  name     String
  location String
  price    Float
  rating   Float
  image    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  bookings Booking[]
}

model Booking {
  id         String @id @default(cuid())
  userId     String
  userEmail  String
  hotelId    String
  hotelName  String
  numDays    Int
  numRooms   Int
  totalPrice Float
  isCancelled Boolean @default(false)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  user  User  @relation(fields: [userId], references: [id])
  hotel Hotel @relation(fields: [hotelId], references: [id])
}

model AuditLog {
  id             String @id @default(cuid())
  userEmail      String?
  action         String
  collectionName String
  objectId       String
  before         Json?
  after          Json?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model AdminLog {
  id       String @id @default(cuid())
  adminId  String?
  action   String
  metadata Json   @default("{}")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  admin User? @relation(fields: [adminId], references: [id])
}

model RewardHistory {
  id     String @id @default(cuid())
  userId String
  date   DateTime @default(now())
  points Int
  reason String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])
}

enum Role {
  USER
  ADMIN
}
```

### 3. Tạo Prisma Service

File: `src/prisma/prisma.service.ts`

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

### 4. Tạo Prisma Module

File: `src/prisma/prisma.module.ts`

```typescript
import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

### 5. Cấu Hình Environment

File: `.env`

```env
DATABASE_URL="postgresql://phinguyenuit10:123456@localhost:5432/reservation_db?schema=public"
```

### 6. Khởi Tạo Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema lên database
npx prisma db push
```

## Các Lệnh Prisma Cơ Bản

### Generate Client

```bash
npx prisma generate
```

- Tạo Prisma Client từ schema
- Cần chạy mỗi khi thay đổi schema

### Push Schema

```bash
npx prisma db push
```

- Đẩy schema lên database
- Tạo/cập nhật tables

### Prisma Studio

```bash
npx prisma studio
```

- Mở web interface để xem/edit data
- Chạy tại http://localhost:5555

### Migration

```bash
# Tạo migration
npx prisma migrate dev --name migration_name

# Xem status
npx prisma migrate status

# Reset database
npx prisma migrate reset
```

## So Sánh Mongoose vs Prisma

### Mongoose (Trước)

```typescript
@InjectModel(User.name) private userModel: Model<UserDocument>

async findAll(): Promise<User[]> {
  return this.userModel.find().exec();
}

async findById(id: string): Promise<User | null> {
  return this.userModel.findById(id).exec();
}
```

### Prisma (Sau)

```typescript
constructor(private prisma: PrismaService) {}

async findAll(): Promise<User[]> {
  return this.prisma.user.findMany();
}

async findById(id: string): Promise<User | null> {
  return this.prisma.user.findUnique({
    where: { id }
  });
}
```

## Ưu Điểm Của Prisma

1. **Type Safety**: Tự động generate types từ schema
2. **Relationships**: Dễ dàng định nghĩa relationships giữa models
3. **Query Builder**: API dễ sử dụng và intuitive
4. **Migrations**: Quản lý database schema changes
5. **Studio**: Web interface để xem/edit data
6. **Performance**: Tối ưu queries và connection pooling

## Lưu Ý Quan Trọng

1. **Generate Client**: Luôn chạy `npx prisma generate` sau khi thay đổi schema
2. **Environment**: Đảm bảo DATABASE_URL đúng format
3. **Relations**: Định nghĩa relationships trong schema để có type safety
4. **Transactions**: Sử dụng `$transaction` cho operations phức tạp
5. **Error Handling**: Prisma có error types riêng, cần handle phù hợp
