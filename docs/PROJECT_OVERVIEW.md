# 📋 TỔNG QUAN DỰ ÁN RESERVATION NESTJS BACKEND

## 🎯 Mục đích dự án

Hệ thống backend quản lý đặt phòng khách sạn được xây dựng bằng NestJS, chuyển đổi từ Express.js với các tính năng hiện đại và bảo mật cao.

## 🏗️ Kiến trúc & Công nghệ

### Core Technologies

- **Framework**: NestJS (Node.js framework)
- **Database**: PostgreSQL với Prisma ORM
- **Authentication**: JWT + Passport.js
- **Rate Limiting**: @nestjs/throttler
- **Logging**: Winston
- **Validation**: Built-in NestJS validation

### Cấu trúc Database

```
 Database Schema:
├── User (Người dùng)
│   ├── id, email, password, role (USER/ADMIN)
│   ├── points (hệ thống điểm thưởng)
│   └── relationships: bookings, rewardHistories, adminLogs
├── Hotel (Khách sạn)
│   ├── id, name, location, price, rating, image
│   └── relationships: bookings
├── Booking (Đặt phòng)
│   ├── userId, hotelId, numDays, numRooms, totalPrice
│   ├── isCancelled (trạng thái hủy)
│   └── relationships: user, hotel
├── AuditLog (Nhật ký kiểm toán)
│   ├── userEmail, action, collectionName, objectId
│   ├── before/after (tracking changes)
├── AdminLog (Nhật ký admin)
│   ├── adminId, action, metadata
├── RewardHistory (Lịch sử điểm thưởng)
│   ├── userId, points, reason, date
```

## Các Module Chính

### 1. 🔐 Authentication Module (`/auth`)

- **Chức năng**: Xác thực và phân quyền người dùng
- **Features**:
  - JWT token generation/validation
  - Role-based access control (USER/ADMIN)
  - Password hashing với bcrypt
- **Endpoints**: Login, Register, JWT Strategy

### 2. 👥 Users Module (`/users`)

- **Chức năng**: Quản lý thông tin người dùng
- **Features**:
  - CRUD operations cho user
  - Point system management
  - Profile management
- **Endpoints**: Register, Login, Get Profile, Update Profile

### 3. 🏨 Hotels Module (`/hotels`)

- **Chức năng**: Quản lý thông tin khách sạn
- **Features**:
  - Hiển thị danh sách khách sạn
  - Filtering và searching
  - Hotel details với rating và pricing
- **Endpoints**: Get All Hotels, Get Hotel by ID

### 4. Bookings Module (`/bookings`)

- **Chức năng**: Quản lý đặt phòng
- **Features**:
  - Tạo booking mới
  - Quản lý trạng thái booking
  - Tính toán giá tiền
  - Hủy booking
- **Endpoints**: Create, Read, Update, Delete bookings

### 5. ‍💼 Admin Module (`/admin`)

- **Chức năng**: Panel quản trị cho admin
- **Features**:
  - Xem tất cả bookings
  - Thống kê hệ thống
  - Toggle booking status
  - Admin logs tracking
- **Endpoints**: Admin-specific booking operations, Statistics

### 6. 📊 Audit Module (`/audit`)

- **Chức năng**: Theo dõi thay đổi trong hệ thống
- **Features**:
  - Track all CRUD operations
  - Before/After data comparison
  - User action logging
- **Endpoints**: Get audit logs

### 7. Rewards Module (`/rewards`)

- **Chức năng**: Hệ thống điểm thưởng
- **Features**:
  - Earn points for actions
  - Point history tracking
  - Reward redemption system
- **Endpoints**: Earn points, Get point history

## 🔧 Cấu hình & Security

### Rate Limiting

```typescript
// Global: 100 requests/minute
// Auth routes: 5 requests/minute
ThrottlerModule.forRoot([
  { ttl: 60000, limit: 100 },
  { ttl: 60000, limit: 5, name: 'auth' },
]);
```

### Environment Variables

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/db"
JWT_SECRET=your_jwt_secret_here
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

## 📁 Cấu trúc thư mục quan trọng

```
src/
├── 📂 auth/           # Authentication & Authorization
├── 📂 users/          # User management
├── 📂 hotels/         # Hotel management
├── 📂 bookings/       # Booking system
├── 📂 admin/          # Admin panel
├── 📂 audit/          # Audit logging
├── 📂 rewards/        # Reward system
├── 📂 prisma/         # Database ORM
├── 📂 guards/         # Route guards
├── 📂 config/         # Configuration
└── 📂 utils/          # Utility functions
```

## API Endpoints Tổng quan

### Public Routes

- `POST /users/register` - Đăng ký
- `POST /users/login` - Đăng nhập
- `GET /hotels` - Xem khách sạn
- `GET /hotels/:id` - Chi tiết khách sạn

### Protected Routes (User)

- `GET /users/me` - Thông tin cá nhân
- `POST /bookings` - Tạo booking
- `GET /bookings` - Xem booking của mình
- `PUT /bookings/:id` - Cập nhật booking
- `DELETE /bookings/:id` - Hủy booking
- `GET /rewards/history` - Lịch sử điểm

### Admin Routes

- `GET /bookings/admin/all` - Tất cả bookings
- `GET /bookings/admin/stats` - Thống kê
- `PUT /bookings/admin/:id/toggle` - Toggle status
- `GET /admin/logs` - Admin logs
- `GET /audits` - Audit logs

## 🚀 Scripts chạy

```bash
# Development
npm run start:dev

# Production
npm run start:prod

# Database
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run migrations
npm run prisma:studio      # Open Prisma Studio
npm run db:push           # Push schema to DB

# Testing
npm run test
npm run test:e2e
```

## 🔍 Điểm nổi bật cần nhớ

### 1. **Security Features**

- JWT authentication với role-based access
- Password hashing với bcrypt
- Rate limiting cho API protection
- CORS configuration

### 2. **Data Tracking**

- Audit logs cho mọi thay đổi
- Admin action logging
- Reward point history

### 3. **Business Logic**

- Booking system với cancellation
- Hotel management với pricing
- User point system
- Admin statistics

### 4. **Database Design**

- PostgreSQL với Prisma ORM
- Proper relationships giữa các entities
- Soft delete pattern cho bookings

## 💡 Tips khi làm việc với project

1. **Database**: Luôn chạy `npm run prisma:generate` sau khi thay đổi schema
2. **Environment**: Copy `env.example` và cấu hình database
3. **Testing**: Sử dụng `npm run test:watch` để development
4. **Logs**: Check audit logs để debug user actions
5. **Admin**: Sử dụng admin routes để quản lý hệ thống

## Dependencies chính

### Production

- `@nestjs/*` - Core NestJS modules
- `@prisma/client` - Database ORM
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT handling
- `winston` - Logging
- `@nestjs/throttler` - Rate limiting

### Development

- `prisma` - Database tooling
- `@nestjs/cli` - NestJS CLI
- `typescript` - Type safety

## Tài liệu tham khảo

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
