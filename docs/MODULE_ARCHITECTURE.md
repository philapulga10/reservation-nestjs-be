# 🏗️ KIẾN TRÚC MODULE & DEPENDENCIES

## 📋 Tổng quan App Module

```typescript
// src/app.module.ts - Root Module
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),  // Global config
    PrismaModule,                              // Database connection
    ThrottlerModule.forRoot([...]),            // Rate limiting
    UsersModule,                               // User management
    HotelsModule,                              // Hotel management
    BookingsModule,                            // Booking system
    AuthModule,                                // Authentication
    AdminModule,                               // Admin panel
    AuditModule,                               // Audit logging
    RewardsModule,                             // Reward system
  ],
  providers: [ThrottlerGuard],                 // Global guards
})
export class AppModule {}
```

## 🔗 Module Dependencies Map

### 1. **PrismaModule** (Core Database)

```
📦 PrismaModule
├── 🔧 PrismaService (Database connection)
└── 📤 Exports: PrismaService
    ↓ (Used by ALL modules)
```

### 2. **AuthModule** (Authentication)

```
📦 AuthModule
├── 🔧 JwtStrategy (JWT validation)
├── 🔧 JwtAuthGuard (Route protection)
├── 📤 Exports: JwtAuthGuard
└── 📥 Imports: PrismaModule
```

### 3. **UsersModule** (User Management)

```
 UsersModule
├── 🎮 UsersController
│   ├── POST /users/register
│   ├── POST /users/login
│   └── GET /users/me
├── 🔧 UsersService
├── 📥 Imports: [PrismaModule, AuditModule, AdminModule]
└── 📤 Exports: UsersService
```

### 4. **HotelsModule** (Hotel Management)

```
📦 HotelsModule
├──  HotelsController
│   ├── GET /hotels
│   └── GET /hotels/:id
├── 🔧 HotelsService
├── 📥 Imports: [PrismaModule, AuditModule]
└── 📤 Exports: HotelsService
```

### 5. **BookingsModule** (Booking System)

```
 BookingsModule
├──  BookingsController
│   ├── POST /bookings
│   ├── GET /bookings
│   ├── PUT /bookings/:id
│   └── DELETE /bookings/:id
├── 🔧 BookingsService
├── 📥 Imports: [PrismaModule, AuditModule, RewardsModule]
└── 📤 Exports: BookingsService
```

### 6. **AdminModule** (Admin Panel)

```
 AdminModule
├──  AdminLogController
│   └── GET /admin/logs
├── 🔧 AdminLogService
├── 📥 Imports: [PrismaModule]
└── 📤 Exports: AdminLogService
```

### 7. **AuditModule** (Audit Logging)

```
 AuditModule
├── 🎮 AuditController
│   └── GET /audits
├── 🔧 AuditService
├── 📥 Imports: [PrismaModule]
└── 📤 Exports: AuditService
```

### 8. **RewardsModule** (Reward System)

```
📦 RewardsModule
├──  RewardsController
│   ├── GET /rewards/history
│   └── POST /rewards/earn
├──  RewardsService
├── 📥 Imports: [PrismaModule, AuditModule]
└── 📤 Exports: RewardsService
```

## 🔄 Dependency Flow

### Authentication Flow

```
Client Request → JwtAuthGuard → JwtStrategy → UsersService → Database
```

### Booking Flow

```
Client Request → BookingsController → BookingsService →
├── AuditService (log action)
├── RewardsService (earn points)
└── Database (save booking)
```

### Admin Flow

```
Admin Request → AdminLogController → AdminLogService →
├── AuditService (log admin action)
└── Database (save admin log)
```

## 🎯 Service Responsibilities

### Core Services

- **PrismaService**: Database operations
- **UsersService**: User CRUD, authentication
- **HotelsService**: Hotel management
- **BookingsService**: Booking operations

### Support Services

- **AuditService**: Track all changes
- **AdminLogService**: Admin action logging
- **RewardsService**: Point system management

### Guard Services

- **JwtAuthGuard**: Route protection
- **ThrottlerGuard**: Rate limiting

## 🔧 Configuration Modules

### Global Config

```typescript
ConfigModule.forRoot({
  isGlobal: true, // Available everywhere
});
```

### Rate Limiting

```typescript
ThrottlerModule.forRoot([
  { ttl: 60000, limit: 100 }, // Global: 100 req/min
  { ttl: 60000, limit: 5, name: 'auth' }, // Auth: 5 req/min
]);
```

## 📊 Database Relationships

```
User (1) ←→ (N) Booking (N) ←→ (1) Hotel
User (1) ←→ (N) RewardHistory
User (1) ←→ (N) AdminLog (if admin)
User (1) ←→ (N) AuditLog
```

## 🚀 Module Loading Order

1. **ConfigModule** (Global config)
2. **PrismaModule** (Database connection)
3. **ThrottlerModule** (Rate limiting)
4. **Feature Modules** (Users, Hotels, etc.)
5. **Global Guards** (ThrottlerGuard)

## 💡 Key Design Patterns

### 1. **Dependency Injection**

- Services injected into Controllers
- Modules imported where needed
- Clean separation of concerns

### 2. **Audit Pattern**

- All modules import AuditModule
- Every action logged automatically
- Before/after data tracking

### 3. **Guard Pattern**

- JwtAuthGuard for protected routes
- ThrottlerGuard for rate limiting
- Role-based access control

### 4. **Service Pattern**

- Business logic in Services
- Controllers handle HTTP requests
- Clean API design

## 🔍 Debugging Tips

### Module Issues

```bash
# Check module dependencies
npm run start  # Shows loading order

# Common errors:
# - Missing imports in module
# - Service not exported
# - Circular dependencies
```

### Database Issues

```bash
# Reset database
npm run prisma:migrate:reset

# Generate client
npm run prisma:generate
```

### Authentication Issues

```bash
# Check JWT token
# Verify guard is applied
# Check role permissions
```

## Best Practices

1. **Always import PrismaModule** in feature modules
2. **Use AuditModule** for tracking changes
3. **Export services** that other modules need
4. **Apply guards** to protected routes
5. **Follow naming conventions** (Module, Controller, Service)
6. **Keep modules focused** on single responsibility

```

File này sẽ giúp bạn:
- Hiểu rõ cách các module kết nối với nhau
- Biết được dependencies giữa các thành phần
- Dễ dàng debug khi có lỗi module
- Nắm được flow của các chức năng chính
- Hiểu được design patterns được sử dụng

Bạn có muốn tôi tạo thêm file nào khác để hỗ trợ việc đọc hiểu source code không?
```
