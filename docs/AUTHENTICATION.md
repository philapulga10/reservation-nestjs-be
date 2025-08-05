# Hệ Thống Authentication

## Tổng Quan

Hệ thống authentication sử dụng JWT (JSON Web Tokens) với Prisma ORM để quản lý users trong PostgreSQL.

## Cấu Trúc User Model

### Database Schema (Prisma)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  role      Role     @default(USER)
  points    Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  bookings        Booking[]
  rewardHistories RewardHistory[]
  adminLogs       AdminLog[]
}

enum Role {
  USER
  ADMIN
}
```

## Authentication Flow

### 1. Registration

```typescript
// UsersService.registerUser()
async registerUser(email: string, password: string): Promise<User> {
  // Check existing user
  const existing = await this.prisma.user.findUnique({
    where: { email },
  });

  // Hash password
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create user
  const user = await this.prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: Role.USER,
    },
  });

  return user;
}
```

### 2. Login

```typescript
// UsersService.loginUser()
async loginUser(email: string, password: string): Promise<LoginResult> {
  // Find user
  const user = await this.prisma.user.findUnique({
    where: { email },
  });

  // Verify password
  const isMatch = await bcrypt.compare(password, user.password);

  // Generate JWT
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    secret,
    { expiresIn: '7d' }
  );

  return { token, user };
}
```

### 3. JWT Strategy

```typescript
// JwtStrategy.validate()
async validate(payload: any) {
  const user = await this.prisma.user.findUnique({
    where: { id: payload.userId },
  });

  return {
    userId: user?.id,
    email: user?.email,
    role: user?.role,
  };
}
```

## Authorization

### Role-based Access Control

- **USER**: Có thể đặt phòng, xem booking history
- **ADMIN**: Có thể quản lý tất cả bookings, hotels, users

### Guards

```typescript
@UseGuards(JwtAuthGuard)
@Controller("bookings")
export class BookingsController {
  // Protected endpoints
}
```

## Security Features

### Password Hashing

- Sử dụng bcrypt với salt rounds = 10
- Không lưu plain text password

### JWT Configuration

- Secret key từ environment variables
- Expiration time: 7 days
- Payload: userId, email, role

### Rate Limiting

- 100 requests/minute cho general endpoints
- 5 requests/minute cho auth endpoints

## Database Operations

### User Queries (Prisma)

```typescript
// Find by email
const user = await this.prisma.user.findUnique({
  where: { email },
});

// Find by ID
const user = await this.prisma.user.findUnique({
  where: { id },
});

// Create user
const user = await this.prisma.user.create({
  data: { email, password: hashedPassword, role: Role.USER },
});
```

## Error Handling

- Duplicate email: ConflictException
- Invalid credentials: UnauthorizedException
- User not found: NotFoundException
