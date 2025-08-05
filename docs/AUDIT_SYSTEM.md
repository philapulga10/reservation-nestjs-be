# Hệ Thống Audit Logging

## Tổng Quan
Hệ thống audit logging sử dụng Prisma ORM để ghi lại tất cả các thay đổi trong hệ thống vào PostgreSQL database.

## Database Schema

### AuditLog Model (Prisma)
```prisma
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
```

## Service Implementation

### AuditLogService
```typescript
@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async logAction(data: LogActionDto): Promise<AuditLog> {
    return this.prisma.auditLog.create({
      data: {
        userEmail: data.userEmail,
        action: data.action,
        collectionName: data.collectionName,
        objectId: data.objectId,
        before: data.before,
        after: data.after,
      },
    });
  }

  async getAuditLogs(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { userEmail: { contains: search, mode: 'insensitive' } },
        { action: { contains: search, mode: 'insensitive' } },
        { collectionName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
```

## API Endpoints

### 1. Get Audit Logs
```typescript
@Get()
async getAuditLogs(
  @Query('page') page: string = '1',
  @Query('limit') limit: string = '10',
  @Query('search') search?: string,
) {
  return this.auditService.getAuditLogs(
    parseInt(page),
    parseInt(limit),
    search
  );
}
```

## Database Queries

### Create Audit Log
```typescript
const auditLog = await this.prisma.auditLog.create({
  data: {
    userEmail: 'user@example.com',
    action: 'create',
    collectionName: 'bookings',
    objectId: 'booking_id',
    before: null,
    after: { /* new data */ }
  }
});
```

### Find Audit Logs
```typescript
const logs = await this.prisma.auditLog.findMany({
  where: {
    collectionName: 'bookings',
    action: 'update'
  },
  orderBy: { createdAt: 'desc' },
  skip: (page - 1) * limit,
  take: limit
});
```

### Search Audit Logs
```typescript
const logs = await this.prisma.auditLog.findMany({
  where: {
    OR: [
      { userEmail: { contains: 'search_term', mode: 'insensitive' } },
      { action: { contains: 'search_term', mode: 'insensitive' } }
    ]
  }
});
```

## Usage Examples

### 1. Log User Registration
```typescript
await this.auditLogService.logAction({
  userEmail: email,
  action: 'register',
  collectionName: 'users',
  objectId: user.id,
  after: {
    email: user.email,
    createdAt: user.createdAt,
  },
});
```

### 2. Log Booking Creation
```typescript
await this.auditLogService.logAction({
  userEmail: data.userEmail,
  action: 'create',
  collectionName: 'bookings',
  objectId: booking.id,
  after: booking,
});
```

### 3. Log Booking Update
```typescript
await this.auditLogService.logAction({
  userEmail,
  action: 'update',
  collectionName: 'bookings',
  objectId: id,
  before: oldBooking,
  after: updatedBooking,
});
```

### 4. Log Booking Cancellation
```typescript
await this.auditLogService.logAction({
  userEmail,
  action: 'cancel',
  collectionName: 'bookings',
  objectId: id,
  before: booking,
  after: cancelledBooking,
});
```

## Features

### 1. Comprehensive Logging
- **Actions**: create, update, delete, cancel, login, register
- **Collections**: users, bookings, hotels, admin_logs
- **Data**: before/after states

### 2. Search & Filter
- Search by user email
- Search by action type
- Search by collection name
- Case-insensitive search

### 3. Pagination
- Configurable page size
- Total count and pages

### 4. Data Structure
- **id**: Unique identifier (CUID)
- **userEmail**: Email của user thực hiện action
- **action**: Loại hành động
- **collectionName**: Tên collection/table
- **objectId**: ID của object bị thay đổi
- **before**: Data trước khi thay đổi (JSON)
- **after**: Data sau khi thay đổi (JSON)
- **createdAt/updatedAt**: Timestamps

## Security & Privacy
- Không log sensitive data (passwords)
- Chỉ log metadata cho sensitive operations
- Audit logs không thể bị xóa bởi users

## Performance Considerations
- Index trên các field thường query
- Pagination để tránh load quá nhiều data
- JSON fields cho flexible data storage 