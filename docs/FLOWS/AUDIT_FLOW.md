# �� LUỒNG KIỂM TOÁN (AUDIT FLOW)

## �� Tổng quan

Hệ thống audit logging theo dõi mọi thay đổi trong hệ thống, lưu trữ thông tin before/after và cho phép admin xem lịch sử hoạt động.

## 🔄 Luồng ghi audit log (Log Action Flow)

```
1. Action xảy ra trong hệ thống (create, update, delete, login, etc.)
   ↓
2. Service gọi AuditLogService.logAction()
   ↓
3. AuditLogService.logAction()
   ├── Tạo AuditLog record
   │   ├── userEmail: string
   │   ├── action: string
   │   ├── collectionName: string
   │   ├── objectId: string
   │   ├── before: any (dữ liệu trước thay đổi)
   │   ├── after: any (dữ liệu sau thay đổi)
   │   └── createdAt: Date
   └── Lưu vào database
   ↓
4. Trả về AuditLog object
```

## 🔄 Luồng xem audit logs (View Audit Logs Flow)

### Admin xem audit logs

```
1. Admin gửi GET /audits (với JWT token)
   ↓
2. JwtAuthGuard xác thực + Role check (ADMIN)
   ↓
3. AuditController.getAuditLogs()
   ↓
4. AuditService.getAuditLogs()
   ├── Query AuditLog table
   ├── Search functionality
   ├── Pagination support
   ├── Date range filtering
   └── OrderBy createdAt desc
   ↓
5. Trả về danh sách audit logs
```

## 📊 Data Structure

### AuditLog Entity

```typescript
{
  id: string;
  userEmail: string;
  action: string;
  collectionName: string;
  objectId: string;
  before: any; // Dữ liệu trước thay đổi
  after: any; // Dữ liệu sau thay đổi
  createdAt: Date;
}
```

### LogActionDto

```typescript
{
  userEmail: string;
  action: string;
  collectionName: string;
  objectId: string;
  before?: any;
  after?: any;
}
```

## 🔧 Các Service tích hợp Audit

### UsersService

```typescript
// Register
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

// Login
await this.auditLogService.logAction({
  userEmail: email,
  action: 'login',
  collectionName: 'users',
  objectId: user.id,
});
```

### BookingsService

```typescript
// Create booking
await this.auditLogService.logAction({
  userEmail: data.userEmail,
  action: 'create',
  collectionName: 'bookings',
  objectId: booking.id,
  after: booking,
});

// Update booking
await this.auditLogService.logAction({
  userEmail: userEmail,
  action: 'update',
  collectionName: 'bookings',
  objectId: id,
  before: existingBooking,
  after: updatedBooking,
});

// Cancel booking
await this.auditLogService.logAction({
  userEmail: userEmail,
  action: 'cancel',
  collectionName: 'bookings',
  objectId: id,
  before: booking,
  after: { ...booking, isCancelled: true },
});
```

### HotelsService

```typescript
// View hotel (optional logging)
await this.auditLogService.logAction({
  userEmail: userEmail,
  action: 'view',
  collectionName: 'hotels',
  objectId: hotel.id,
});
```

## 📋 Các loại Action được log

### User Actions

- `register`: Đăng ký user mới
- `login`: Đăng nhập
- `update_profile`: Cập nhật thông tin cá nhân

### Booking Actions

- `create`: Tạo booking mới
- `update`: Cập nhật booking
- `cancel`: Hủy booking
- `admin_toggle`: Admin toggle status

### Hotel Actions

- `view`: Xem thông tin khách sạn

### Reward Actions

- `add_points`: Cộng điểm thưởng
- `deduct_points`: Trừ điểm thưởng

### Admin Actions

- `admin_action`: Các action của admin
- `system_action`: Các action hệ thống

## 🔍 Search & Filter Capabilities

### Search Parameters

```typescript
{
  userEmail?: string;    // Filter theo user
  action?: string;       // Filter theo loại action
  collectionName?: string; // Filter theo collection
  dateRange?: {          // Filter theo thời gian
    start: Date;
    end: Date;
  };
  search?: string;       // Search tổng quát
}
```

### Search Implementation

```typescript
// Search logic
if (search) {
  where.OR = [
    { userEmail: { contains: search, mode: 'insensitive' } },
    { action: { contains: search, mode: 'insensitive' } },
    { collectionName: { contains: search, mode: 'insensitive' } },
  ];
}
```

## Audit Log Analysis

### User Activity Tracking

- Theo dõi hoạt động của từng user
- Phát hiện hành vi bất thường
- Thống kê tần suất sử dụng

### System Health Monitoring

- Theo dõi lỗi hệ thống
- Phân tích performance
- Debug issues

### Compliance & Security

- Đáp ứng yêu cầu compliance
- Phát hiện security breaches
- Data integrity verification

## 🔧 AuditService Methods

### Core Methods

- `logAction(data)`: Ghi audit log
- `getAuditLogs(page, limit, search, dateRange)`: Lấy audit logs

### Utility Methods

- `getUserActivity(userEmail, dateRange)`: Hoạt động của user
- `getSystemStats(dateRange)`: Thống kê hệ thống
- `exportAuditLogs(dateRange)`: Export audit logs

## 🚨 Error Handling

### Common Errors

- `BadRequestException`: Dữ liệu audit không hợp lệ
- `InternalServerError`: Lỗi khi ghi audit log

### Fallback Strategy

- Nếu audit logging fail, không ảnh hưởng đến business logic
- Retry mechanism cho audit logging
- Alert system cho audit failures

## 📊 Performance Considerations

### Database Optimization

- Index trên các field thường query
- Partitioning theo thời gian
- Archiving old audit logs

### Query Optimization

- Pagination để tránh large result sets
- Efficient search queries
- Caching cho frequent queries

## Best Practices

1. **Comprehensive Logging**: Log mọi action quan trọng
2. **Data Integrity**: Lưu trữ before/after data chính xác
3. **Performance**: Không ảnh hưởng đến business logic
4. **Security**: Bảo vệ audit logs khỏi unauthorized access
5. **Retention**:
