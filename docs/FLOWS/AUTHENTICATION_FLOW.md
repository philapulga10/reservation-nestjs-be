# 🔐 LUỒNG XÁC THỰC (AUTHENTICATION FLOW)

## 🎯 Tổng quan

Hệ thống xác thực sử dụng JWT (JSON Web Token) với bcrypt để mã hóa mật khẩu, cung cấp bảo mật cao cho toàn bộ hệ thống đặt phòng khách sạn.

## 🔄 Luồng đăng ký (Registration Flow)

```
1. Client gửi POST /users/register
   ↓
2. UsersController.registerUser()
   ↓
3. UsersService.registerUser()
   ├── Kiểm tra email đã tồn tại chưa
   ├── Hash password với bcrypt (saltRounds: 10)
   ├── Tạo user mới với role: USER
   └── AuditLogService.logAction() - Ghi log đăng ký
   ↓
4. Trả về user object (không có password)
```

## 🔄 Luồng đăng nhập (Login Flow)

```
1. Client gửi POST /users/login
   ↓
2. UsersController.loginUser()
   ↓
3. UsersService.loginUser()
   ├── Tìm user theo email
   ├── So sánh password với bcrypt.compare()
   ├── AuthService.generateToken() - Tạo JWT
   └── AuditLogService.logAction() - Ghi log đăng nhập
   ↓
4. Trả về { token, user }
```

## 🔑 JWT Token Structure

```typescript
// JwtPayload Interface
{
  userId: string;
  email: string;
  role: 'USER' | 'ADMIN';
}
```

## 🛡️ Route Protection

### Protected Routes

- Tất cả routes cần authentication đều có `@UseGuards(JwtAuthGuard)`
- JWT token được gửi trong header: `Authorization: Bearer <token>`

### JwtAuthGuard Flow

```
1. Request đến protected route
   ↓
2. JwtAuthGuard.intercept()
   ↓
3. JwtStrategy.validate()
   ├── Verify JWT token
   ├── Extract payload
   └── Return user object
   ↓
4. Request tiếp tục đến controller
```

## 🔧 Các Service liên quan

### AuthService

- `generateToken(user)`: Tạo JWT token
- `verifyToken(token)`: Xác thực JWT token

### UsersService

- `registerUser(email, password)`: Đăng ký user mới
- `loginUser(email, password)`: Đăng nhập
- `findByEmail(email)`: Tìm user theo email

## 🚨 Error Handling

### Registration Errors

- `ConflictException`: Email đã tồn tại

### Login Errors

- `UnauthorizedException`: Email/password không đúng

### Token Errors

- `UnauthorizedException`: Token không hợp lệ

## Audit Logging

Mọi action authentication đều được log:

- **Register**: `action: 'register'`
- **Login**: `action: 'login'`

## 🔒 Security Features

1. **Password Hashing**: bcrypt với saltRounds = 10
2. **JWT Expiration**: Token có thời hạn
3. **Role-based Access**: USER/ADMIN roles
4. **Rate Limiting**: 5 requests/minute cho auth routes

## 🔗 Tích hợp với các Module khác

### Với Booking System

- JWT token được sử dụng để xác định user khi tạo booking
- Role-based access cho admin booking management

### Với Rewards System

- User authentication cần thiết để xem lịch sử điểm thưởng
- Admin role cần thiết để quản lý rewards

### Với Audit System

- Mọi authentication action đều được log
- User email được track trong audit logs

## 📊 Data Flow

### Registration Data Flow

```
Client → UsersController → UsersService → PrismaService → Database
                                    ↓
                              AuditLogService → AuditLog
```

### Login Data Flow

```
Client → UsersController → UsersService → AuthService → JWT Token
                                    ↓
                              AuditLogService → AuditLog
```

### Protected Route Data Flow

```
Client → JwtAuthGuard → JwtStrategy → Controller → Service → Database
```

## Best Practices

1. **Token Management**: Luôn sử dụng Bearer token trong Authorization header
2. **Password Security**: Sử dụng bcrypt với saltRounds >= 10
3. **Role Verification**: Kiểm tra role trước khi cho phép access
4. **Error Handling**: Không expose thông tin nhạy cảm trong error messages
5. **Rate Limiting**: Áp dụng rate limiting cho auth endpoints
6. **Audit Logging**: Log mọi authentication attempt

## 🔍 Debugging Tips

### Common Issues

- **Token Expired**: Kiểm tra JWT expiration time
- **Invalid Token**: Verify JWT secret và token format
- **Role Access Denied**: Kiểm tra user role trong JWT payload
- **Rate Limit Exceeded**: Đợi hoặc tăng rate limit cho development

### Debug Commands

```bash
# Check JWT token
jwt decode <token>

# Test authentication endpoint
curl -X POST /users/login -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"password"}'
```

```

File này giờ đây tập trung hoàn toàn vào luồng authentication và loại bỏ các phần trùng lặp với các file khác. Mỗi file flow giờ đây có trách nhiệm riêng biệt:

- **AUTHENTICATION_FLOW.md**: Chỉ về authentication và authorization
- **BOOKING_FLOW.md**: Chỉ về booking system
- **REWARDS_FLOW.md**: Chỉ về reward system
- **ADMIN_FLOW.md**: Chỉ về admin functionality
- **AUDIT_FLOW.md**: Chỉ về audit logging

Điều này giúp:
1. **Tránh trùng lặp** thông tin
2. **Dễ bảo trì** hơn
3. **Tập trung** vào từng tính năng cụ thể
4. **Dễ đọc** và hiểu hơn
```
