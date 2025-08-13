# 👨‍💼 LUỒNG QUẢN TRỊ (ADMIN FLOW)

## 🎯 Tổng quan

Hệ thống quản trị cho phép admin quản lý toàn bộ hệ thống, xem thống kê và theo dõi hoạt động của users với quyền truy cập đặc biệt.

## 🔄 Luồng xem tất cả bookings (View All Bookings Flow)

```
1. Admin gửi GET /bookings/admin/all (với JWT token)
   ↓
2. JwtAuthGuard xác thực + Role check (ADMIN)
   ↓
3. BookingsController.getAllBookings()
   ↓
4. BookingsService.getAllBookings()
   ├── Query tất cả bookings (không filter theo user)
   ├── Search functionality (userEmail, hotelName)
   ├── Pagination support
   ├── Filtering support
   └── OrderBy createdAt desc
   ↓
5. Trả về danh sách tất cả bookings
```

## 🔄 Luồng thống kê hệ thống (System Statistics Flow)

```
1. Admin gửi GET /bookings/admin/stats
   ↓
2. JwtAuthGuard xác thực + Role check (ADMIN)
   ↓
3. BookingsController.getBookingStats()
   ↓
4. BookingsService.getBookingStats()
   ├── Tổng số bookings
   ├── Số bookings active (isCancelled = false)
   ├── Số bookings cancelled (isCancelled = true)
   ├── Tổng revenue từ bookings
   ├── Revenue theo thời gian
   └── Top hotels theo số booking
   ↓
5. Trả về thống kê chi tiết
```

## 🔄 Luồng toggle booking status (Toggle Booking Status Flow)

```
1. Admin gửi PUT /bookings/admin/:id/toggle
   ↓
2. JwtAuthGuard xác thực + Role check (ADMIN)
   ↓
3. BookingsController.toggleBookingStatus()
   ↓
4. BookingsService.toggleBookingStatus()
   ├── Tìm booking theo ID
   ├── Toggle isCancelled status
   ├── AuditLogService.logAction() - Ghi log admin action
   └── AdminLogService.logAction() - Ghi admin log
   ↓
5. Trả về booking đã toggle
```

## 🔄 Luồng xem admin logs (View Admin Logs Flow)

```
1. Admin gửi GET /admin/logs
   ↓
2. JwtAuthGuard xác thực + Role check (ADMIN)
   ↓
3. AdminLogController.getAdminLogs()
   ↓
4. AdminLogService.getAdminLogs()
   ├── Query AdminLog table
   ├── Include admin user information
   ├── Pagination support
   ├── Search functionality
   └── OrderBy createdAt desc
   ↓
5. Trả về danh sách admin logs
```

## 🔄 Luồng xem audit logs (View Audit Logs Flow)

```
1. Admin gửi GET /audits
   ↓
2. JwtAuthGuard xác thực + Role check (ADMIN)
   ↓
3. AuditController.getAuditLogs()
   ↓
4. AuditService.getAuditLogs()
   ├── Query AuditLog table
   ├── Search functionality (userEmail, action, collectionName)
   ├── Pagination support
   ├── Date range filtering
   └── OrderBy createdAt desc
   ↓
5. Trả về danh sách audit logs
```

## 🔄 Luồng xem tất cả rewards (View All Rewards Flow)

```
1. Admin gửi GET /rewards/admin/all
   ↓
2. JwtAuthGuard xác thực + Role check (ADMIN)
   ↓
3. RewardsController.getAllRewards()
   ↓
4. RewardsService.getAllRewards()
   ├── Query tất cả RewardHistory
   ├── Include user information
   ├── Search functionality (reason, user email)
   ├── Pagination support
   └── OrderBy date desc
   ↓
5. Trả về danh sách reward history
```

## 📊 Data Structure

### AdminLog Entity

```typescript
{
  id: string;
  adminId: string;
  action: string;
  metadata: any;
  createdAt: Date;
  admin: User; // Relation
}
```

### Booking Statistics

```typescript
{
  totalBookings: number;
  activeBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  topHotels: Array<{ hotelName: string; bookings: number }>;
}
```

## 🔧 Các Service liên quan

### AdminLogService

- `logAction(adminId, action, metadata)`: Ghi admin log
- `getAdminLogs(page, limit, search)`: Lấy admin logs

### BookingsService (Admin methods)

- `getAllBookings(page, limit, search, filter)`: Lấy tất cả bookings
- `getBookingStats()`: Thống kê booking
- `toggleBookingStatus(id)`: Toggle booking status

### AuditService

- `getAuditLogs(page, limit, search, dateRange)`: Lấy audit logs

### RewardsService (Admin methods)

- `getAllRewards(page, limit, search)`: Lấy tất cả reward history

## 🛡️ Security & Authorization

### Role-based Access Control

```typescript
// Tất cả admin routes đều check role
@UseGuards(JwtAuthGuard)
@Roles('ADMIN') // Custom decorator
```

### Admin Actions Logging

- Mọi admin action đều được log vào AdminLog
- Metadata chứa thông tin chi tiết về action
- AuditLog cũng ghi lại admin actions

## 📊 Admin Dashboard Features

### Booking Management

- Xem tất cả bookings
- Toggle booking status
- Search và filter bookings
- Thống kê booking

### User Management

- Xem thông tin users
- Theo dõi hoạt động users
- Xem lịch sử điểm thưởng

### System Monitoring

- Audit logs
- Admin logs
- System statistics

### Reward Management

- Xem tất cả reward history
- Thống kê điểm thưởng
- Search reward transactions

## 🔍 Search & Filter Capabilities

### Booking Search

```typescript
// Search by user email hoặc hotel name
where.OR = [
  { userEmail: { contains: search, mode: 'insensitive' } },
  { hotelName: { contains: search, mode: 'insensitive' } },
];
```

### Audit Log Search

```typescript
// Search by user email, action, collection name
where.OR = [
  { userEmail: { contains: search, mode: 'insensitive' } },
  { action: { contains: search, mode: 'insensitive' } },
  { collectionName: { contains: search, mode: 'insensitive' } },
];
```

### Reward History Search

```typescript
// Search by reason hoặc user email
where.OR = [
  { reason: { contains: search, mode: 'insensitive' } },
  { user: { email: { contains: search, mode: 'insensitive' } } },
];
```

## 📊 Statistics & Analytics

### Booking Statistics

- Tổng số bookings
- Tỷ lệ hủy booking
- Revenue theo thời gian
- Top hotels

### User Statistics

- Số lượng users
- Users hoạt động
- Top users theo điểm

### System Statistics

- Tổng revenue
- Tổng điểm đã phát hành
- Audit log frequency

## 🚨 Error Handling

### Common Errors

- `ForbiddenException`: Không có quyền admin
- `NotFoundException`: Resource không tồn tại
- `UnauthorizedException`: Token không hợp lệ

## 📊 Audit Logging

Mọi admin action đều được log:

- **Admin Log**: Chi tiết admin action
- **Audit Log**: Tracking changes trong system

## 💡 Best Practices

1. **Role Verification**: Luôn check admin role trước khi thực hiện action
2. **Action Logging**: Ghi log mọi admin action
3. **Data Validation**: Validate dữ liệu trước khi thực hiện
4. **Pagination**: Sử dụng pagination cho large datasets
5. **Search Optimization**: Index các field thường search

## 🔍 Debugging Tips

### Common Issues

- **Access Denied**: Kiểm tra user role có phải ADMIN không
- **Missing Data**: Verify admin permissions cho resource
- **Search Issues**: Kiểm tra search parameters và filters

### Debug Commands

```bash
# Test admin endpoint
curl -X GET /bookings/admin/all -H "Authorization: Bearer <admin_token>"

# Check admin logs
curl -X GET /admin/logs -H "Authorization: Bearer <admin_token>"
```
