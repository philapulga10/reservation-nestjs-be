# Scripts

Thư mục này chứa các script tiện ích cho dự án.

## Scripts có sẵn

### 1. Tạo Admin User

#### Cách 1: Sử dụng npm script (Khuyến nghị)

```bash
npm run create:admin
```

#### Cách 2: Chạy trực tiếp

```bash
npx ts-node scripts/create-admin.ts
```

### 2. API Endpoint

Bạn cũng có thể tạo admin thông qua API endpoint:

```bash
curl -X POST http://localhost:3000/users/admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your_password"
  }'
```

## Lưu ý

- Script sẽ kiểm tra email đã tồn tại chưa trước khi tạo
- Password sẽ được hash với bcrypt trước khi lưu vào database
- Admin user sẽ có role `ADMIN` và có thể truy cập các chức năng admin
- Tất cả các thao tác tạo admin đều được log trong audit log

## Yêu cầu

- Database phải được kết nối và chạy
- Prisma client phải được generate: `npm run prisma:generate`
- Các dependencies phải được cài đặt: `npm install`

<!-- admin@gmail.com/Admin@123 -->
