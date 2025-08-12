# �� LUỒNG HỆ THỐNG ĐIỂM THƯỞNG (REWARDS FLOW)

## �� Tổng quan

Hệ thống điểm thưởng tích hợp với booking system, cho phép user tích lũy điểm từ các hoạt động và xem lịch sử điểm.

## 🔄 Luồng cộng điểm (Add Points Flow)

```
1. Trigger từ các action khác (booking, admin action)
   ↓
2. RewardsService.addPoints(data)
   ├── Tạo RewardHistory record
   │   ├── userId: string
   │   ├── points: number (có thể âm)
   │   ├── reason: string
   │   └── date: Date
   └── Cập nhật user.points
      ├── Increment points trong User table
      └── Atomic operation với Prisma
   ↓
3. Trả về RewardHistory object
```

## 🔄 Luồng xem lịch sử điểm (View Reward History Flow)

### User xem lịch sử điểm của mình

```
1. Client gửi GET /rewards/history (với JWT token)
   ↓
2. JwtAuthGuard xác thực user
   ↓
3. RewardsController.getUserRewards()
   ↓
4. RewardsService.getUserRewards()
   ├── Lấy userId từ JWT payload
   ├── Query RewardHistory theo userId
   ├── Pagination support
   └── OrderBy date desc
   ↓
5. Trả về { rewards, total, page, limit, totalPages }
```

### Admin xem tất cả lịch sử điểm

```
1. Admin gửi GET /rewards/admin/all
   ↓
2. JwtAuthGuard + Admin role check
   ↓
3. RewardsController.getAllRewards()
   ↓
4. RewardsService.getAllRewards()
   ├── Query tất cả RewardHistory
   ├── Include user information
   ├── Search functionality
   ├── Pagination support
   └── OrderBy date desc
   ↓
5. Trả về danh sách reward history
```

## 📊 Data Structure

### CreateRewardDto

```typescript
{
  userId: string;
  points: number; // Có thể âm để trừ điểm
  reason: string;
}
```

### RewardHistory Entity

```typescript
{
  id: string;
  userId: string;
  points: number;
  reason: string;
  date: Date;
  user: User; // Relation
}
```

### User Entity (points field)

```typescript
{
  // ... other fields
  points: number; // Tổng điểm hiện tại
}
```

## 🔧 Các Service liên quan

### RewardsService

- `addPoints(data)`: Cộng/trừ điểm thưởng
- `getUserRewards(userId, page, limit)`: Lấy lịch sử điểm của user
- `getAllRewards(page, limit, search)`: Lấy tất cả lịch sử điểm (admin)

### BookingsService

- Tích hợp với RewardsService khi tạo/hủy booking

### AuditLogService

- Ghi log mọi thay đổi điểm thưởng

## 🚨 Error Handling

### Common Errors

- `NotFoundException`: User không tồn tại
- `BadRequestException`: Dữ liệu không hợp lệ

## 📊 Business Rules

### Point Calculation

1. **Atomic Operations**: Sử dụng Prisma increment để tránh race condition
2. **History Tracking**: Mọi thay đổi điểm đều được ghi vào RewardHistory
3. **Reason Tracking**: Mỗi thay đổi điểm đều có lý do cụ thể

### User Experience

1. **Real-time Updates**: Điểm được cập nhật ngay lập tức
2. **Transparent History**: User có thể xem toàn bộ lịch sử điểm
3. **Pagination**: Hỗ trợ phân trang cho lịch sử dài

## 🔍 Search & Filter

### User Search

- Không có search (chỉ xem lịch sử của mình)

### Admin Search

```typescript
// Search by reason hoặc user email
where.OR = [
  { reason: { contains: search, mode: 'insensitive' } },
  { user: { email: { contains: search, mode: 'insensitive' } } },
];
```

## 📊 Statistics

### User Statistics

- Tổng điểm hiện tại
- Số lượng giao dịch điểm
- Lịch sử điểm theo thời gian

### Admin Statistics

- Tổng điểm đã phát hành
- Top users theo điểm
- Thống kê theo loại điểm thưởng

## 🚨 Error Handling

### Common Errors

- `NotFoundException`: User không tồn tại
- `BadRequestException`: Dữ liệu không hợp lệ

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

- `NotFoundException`: User không tồn tại
- `BadRequestException`: Dữ liệu không hợp lệ

## 📊 Performance Considerations

### Database Optimization

- Index trên các field thường query
- Partitioning theo thời gian
- Archiving old audit logs

### Query Optimization

- Pagination để tránh large result sets
- Efficient search queries
- Caching cho frequent queries

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

## 📋 Audit Log Analysis

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

## 📋 Best Practices

1. **Comprehensive Logging**: Log mọi action quan trọng
2. **Data Integrity**: Lưu trữ before/after data chính xác
3. **Performance**: Không ảnh hưởng đến business logic
4. **Security**: Bảo vệ audit logs khỏi unauthorized access
5. **Retention**
