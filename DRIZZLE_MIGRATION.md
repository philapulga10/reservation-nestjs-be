# Migration từ Prisma sang Drizzle ORM

## Tổng quan

Dự án đã được chuyển từ Prisma sang Drizzle ORM để cải thiện hiệu suất và giảm bundle size.

## Thay đổi chính

### 1. Schema Definition

- **Trước**: `prisma/schema.prisma`
- **Sau**: `src/database/schema.ts`

### 2. Database Connection

- **Trước**: `PrismaService`
- **Sau**: `DatabaseService` với Drizzle connection

### 3. Query Syntax

- **Trước**: Prisma query builder
- **Sau**: Drizzle query builder với type safety

## Cấu trúc mới

### Database Files

```
src/database/
├── schema.ts          # Drizzle schema definition
├── connection.ts      # Database connection
├── database.service.ts # Database operations
└── database.module.ts # NestJS module
```

### Schema Mapping

| Prisma                 | Drizzle                                                         |
| ---------------------- | --------------------------------------------------------------- |
| `model User`           | `pgTable('users', {...})`                                       |
| `@id @default(cuid())` | `text('id').primaryKey().$defaultFn(() => crypto.randomUUID())` |
| `@relation`            | `relations()` function                                          |
| `enum Role`            | `pgEnum('role', [...])`                                         |

## Features được giữ nguyên

### ✅ Authentication

- Login/Register với JWT
- Role-based access control
- Password hashing với bcrypt

### ✅ Hotels

- CRUD operations
- Search và pagination
- Location filtering

### ✅ Bookings

- Create/Update/Cancel bookings
- User booking history
- Admin booking management
- Booking statistics

### ✅ Rewards

- Add points (admin only)
- Reward history
- Points tracking

### ✅ Admin Features

- Admin logs
- Audit logs
- Booking management
- Statistics dashboard

## Migration Steps

### 1. Cài đặt Dependencies

```bash
npm uninstall @prisma/client prisma
npm install drizzle-orm @types/pg pg drizzle-kit
```

### 2. Tạo Schema

- Định nghĩa tables trong `src/database/schema.ts`
- Sử dụng Drizzle syntax thay vì Prisma

### 3. Database Connection

- Tạo connection pool với PostgreSQL
- Setup Drizzle instance

### 4. Update Services

- Thay thế `PrismaService` bằng `DatabaseService`
- Cập nhật query syntax

### 5. Generate Migrations

```bash
npm run db:generate
npm run db:migrate
```

## Database Operations

### Before (Prisma)

```typescript
// Find user
const user = await this.prisma.user.findUnique({
  where: { email },
});

// Create booking
const booking = await this.prisma.booking.create({
  data: { ... },
});
```

### After (Drizzle)

```typescript
// Find user
const user = await this.databaseService.findUserByEmail(email);

// Create booking
const booking = await this.databaseService.createBooking(data);
```

## Benefits của Drizzle

1. **Performance**: Nhẹ hơn Prisma, ít overhead
2. **Type Safety**: Full TypeScript support
3. **Bundle Size**: Nhỏ hơn đáng kể
4. **Flexibility**: SQL-like syntax
5. **Migration**: Đơn giản hơn

## Environment Variables

Đảm bảo có trong `.env`:

```
DATABASE_URL=postgresql://user:password@localhost:5432/database
```

## Commands

```bash
# Generate migration
npm run db:generate

# Run migration
npm run db:migrate

# Open Drizzle Studio
npm run db:studio
```

## Testing

Tất cả tests vẫn hoạt động bình thường. Chỉ cần cập nhật mocks nếu có sử dụng PrismaService.

## Rollback

Nếu cần rollback về Prisma:

1. Restore Prisma files
2. Reinstall Prisma dependencies
3. Update services back to Prisma syntax
4. Run Prisma migrations
