# Kiến Trúc Hệ Thống Reservation Backend

## Tổng Quan

Hệ thống reservation backend được xây dựng theo kiến trúc module-based của NestJS, với các tính năng chính:

- Authentication & Authorization
- Hotel Management
- Booking System
- Admin Panel
- Audit Logging
- Reward Points System

## Kiến Trúc Module

### 1. Core Modules

- **AppModule**: Module gốc, kết nối tất cả các module con
- **ConfigModule**: Quản lý cấu hình môi trường
- **PrismaModule**: Kết nối PostgreSQL thông qua Prisma ORM

### 2. Feature Modules

- **UsersModule**: Quản lý người dùng và authentication
- **HotelsModule**: Quản lý thông tin khách sạn
- **BookingsModule**: Quản lý đặt phòng
- **AdminModule**: Panel quản trị
- **AuditModule**: Ghi log hoạt động
- **RewardsModule**: Hệ thống điểm thưởng

### 3. Shared Modules

- **AuthModule**: JWT authentication và authorization
- **Guards**: Bảo vệ các endpoint

## Database Schema

### Tables (PostgreSQL)

1. **users**: Thông tin người dùng
2. **hotels**: Thông tin khách sạn
3. **bookings**: Đặt phòng
4. **audit_logs**: Log hoạt động
5. **admin_logs**: Log admin
6. **reward_history**: Lịch sử điểm thưởng

### Relationships

- `users` ↔ `bookings` (1:N)
- `users` ↔ `reward_history` (1:N)
- `users` ↔ `admin_logs` (1:N)
- `hotels` ↔ `bookings` (1:N)

## Technology Stack

- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Validation**: Class-validator
- **Documentation**: Swagger/OpenAPI

## Security Features

- JWT Authentication
- Role-based Authorization (user/admin)
- Rate Limiting
- Input Validation
- CORS Configuration

## API Design Pattern

- RESTful API
- Consistent Response Format
- Error Handling
- Pagination Support
- Search & Filtering
