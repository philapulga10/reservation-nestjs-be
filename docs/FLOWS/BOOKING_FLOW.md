# 🏨 LUỒNG ĐẶT PHÒNG (BOOKING FLOW)

## �� Tổng quan
Hệ thống đặt phòng cho phép user tạo, xem, cập nhật và hủy booking với tích hợp hệ thống điểm thưởng.

## 🔄 Luồng tạo booking (Create Booking Flow)

```
1. Client gửi POST /bookings (với JWT token)
   ↓
2. JwtAuthGuard xác thực user
   ↓
3. BookingsController.createBooking()
   ↓
4. BookingsService.createBooking()
   ├── Tạo booking trong database
   ├── AuditLogService.logAction() - Ghi log tạo booking
   └── RewardsService.addPoints() - Cộng điểm thưởng
   ↓
5. Trả về booking object
```

## 🔄 Luồng xem booking (View Booking Flow)

### User xem booking của mình
```
1. Client gửi GET /bookings (với JWT token)
   ↓
2. JwtAuthGuard xác thực user
   ↓
3. BookingsController.getUserBookings()
   ↓
4. BookingsService.getBookingsForUser()
   ├── Lấy email từ JWT payload
   ├── Query bookings theo userEmail
   ├── Pagination support
   └── Filtering support
   ↓
5. Trả về { bookings, total, page, limit, totalPages }
```

### Admin xem tất cả bookings
```
1. Admin gửi GET /bookings/admin/all
   ↓
2. JwtAuthGuard + Role check
   ↓
3. BookingsController.getAllBookings()
   ↓
4. BookingsService.getAllBookings()
   ├── Query tất cả bookings
   ├── Search functionality
   ├── Pagination support
   └── Filtering support
   ↓
5. Trả về danh sách bookings
```

## 🔄 Luồng cập nhật booking (Update Booking Flow)

```
1. Client gửi PUT /bookings/:id
   ↓
2. JwtAuthGuard xác thực user
   ↓
3. BookingsController.updateBooking()
   ↓
4. BookingsService.updateBooking()
   ├── Kiểm tra booking thuộc về user
   ├── Cập nhật booking data
   ├── AuditLogService.logAction() - Ghi log cập nhật
   └── Recalculate totalPrice nếu cần
   ↓
5. Trả về booking đã cập nhật
```

## 🔄 Luồng hủy booking (Cancel Booking Flow)

```
1. Client gửi DELETE /bookings/:id
   ↓
2. JwtAuthGuard xác thực user
   ↓
3. BookingsController.cancelBooking()
   ↓
4. BookingsService.cancelBooking()
   ├── Kiểm tra booking thuộc về user
   ├── Set isCancelled = true (soft delete)
   ├── AuditLogService.logAction() - Ghi log hủy
   └── RewardsService.addPoints() - Trừ điểm (nếu cần)
   ↓
5. Trả về booking đã hủy
```

##  Luồng Admin quản lý booking

### Toggle booking status
```
1. Admin gửi PUT /bookings/admin/:id/toggle
   ↓
2. JwtAuthGuard + Admin role check
   ↓
3. BookingsController.toggleBookingStatus()
   ↓
4. BookingsService.toggleBookingStatus()
   ├── Toggle isCancelled status
   ├── AuditLogService.logAction() - Ghi log admin action
   └── AdminLogService.logAction() - Ghi admin log
   ↓
5. Trả về booking đã toggle
```

### Thống kê booking
```
1. Admin gửi GET /bookings/admin/stats
   ↓
2. JwtAuthGuard + Admin role check
   ↓
3. BookingsController.getBookingStats()
   ↓
4. BookingsService.getBookingStats()
   ├── Tổng số bookings
   ├── Số bookings đã hủy
   ├── Số bookings active
   └── Revenue statistics
   ↓
5. Trả về thống kê
```

##  Hệ thống điểm thưởng tích hợp

### Khi tạo booking
```
BookingsService.createBooking()
├── Tạo booking
├── AuditLogService.logAction()
└── RewardsService.addPoints()
    ├── Tạo RewardHistory record
    └── Cộng điểm vào user.points
```

### Khi hủy booking
```
BookingsService.cancelBooking()
├── Soft delete booking
├── AuditLogService.logAction()
└── RewardsService.addPoints() (trừ điểm nếu cần)
```

## 📊 Data Structure

### CreateBookingDto
```typescript
{
  hotelId: string;
  hotelName: string;
  numDays: number;
  numRooms: number;
  totalPrice: number;
}
```

### Booking Entity
```typescript
{
  id: string;
  userId: string;
  userEmail: string;
  hotelId: string;
  hotelName: string;
  numDays: number;
  numRooms: number;
  totalPrice: number;
  isCancelled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔧 Các Service liên quan

### BookingsService
- `createBooking(data)`: Tạo booking mới
- `getBookingsForUser(email, page, limit, filter)`: Lấy booking của user
- `getAllBookings(page, limit, search, filter)`: Lấy tất cả booking (admin)
- `updateBooking(id, data, userEmail)`: Cập nhật booking
- `cancelBooking(id, userEmail)`: Hủy booking
- `toggleBookingStatus(id)`: Toggle status (admin)
- `getBookingStats()`: Thống kê booking

### RewardsService
- `addPoints(data)`: Cộng/trừ điểm thưởng

### AuditLogService
- `logAction(data)`: Ghi log mọi action

## 🚨 Error Handling

### Common Errors
- `NotFoundException`: Booking không tồn tại
- `UnauthorizedException`: User không có quyền
- `ForbiddenException`: Không phải owner của booking

##  Audit Logging

Mọi action booking đều được log:
- **Create**: `action: 'create'`
- **Update**: `action: 'update'`
- **Cancel**: `action: 'cancel'`
- **Admin Toggle**: `action: 'admin_toggle'`
```
