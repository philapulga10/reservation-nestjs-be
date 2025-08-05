# Bảo Mật Hệ Thống

## Tổng Quan
Hệ thống bảo mật được thiết kế với nhiều lớp bảo vệ, sử dụng Prisma ORM để đảm bảo type safety và prevent SQL injection.

## Authentication & Authorization

### JWT Implementation
```typescript
// JWT Strategy với Prisma
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

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
}
```

### Password Security
```typescript
// Password hashing với bcrypt
async registerUser(email: string, password: string): Promise<User> {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const user = await this.prisma.user.create({
    data: { 
      email, 
      password: hashedPassword,
      role: Role.USER,
    },
  });

  return user;
}

// Password verification
async loginUser(email: string, password: string): Promise<LoginResult> {
  const user = await this.prisma.user.findUnique({
    where: { email },
  });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new UnauthorizedException('Invalid email or password');
  }

  // Generate JWT...
}
```

## Database Security

### Prisma ORM Security
- **Type Safety**: Prevent SQL injection through type checking
- **Parameterized Queries**: Automatic query parameterization
- **Input Validation**: Built-in validation through Prisma schema

### Database Access Control
```sql
-- User permissions
GRANT ALL ON SCHEMA public TO phinguyenuit10;
GRANT CREATE ON SCHEMA public TO phinguyenuit10;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO phinguyenuit10;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO phinguyenuit10;
```

### Environment Variables
```env
# Database connection (PostgreSQL)
DATABASE_URL="postgresql://phinguyenuit10:123456@localhost:5432/reservation_db?schema=public"

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Server configuration
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

## Input Validation

### DTO Validation
```typescript
export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEmail()
  userEmail: string;

  @IsString()
  @IsNotEmpty()
  hotelId: string;

  @IsString()
  @IsNotEmpty()
  hotelName: string;

  @IsNumber()
  @Min(1)
  numDays: number;

  @IsNumber()
  @Min(1)
  numRooms: number;

  @IsNumber()
  @Min(0)
  totalPrice: number;
}
```

### Prisma Schema Validation
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique  // Unique constraint
  password  String
  role      Role     @default(USER)  // Enum validation
  points    Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role {
  USER
  ADMIN
}
```

## Rate Limiting

### Throttler Configuration
```typescript
@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
      {
        ttl: 60000, // 1 minute
        limit: 5, // 5 requests per minute for auth routes
        name: "auth",
      },
    ]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

## CORS Configuration

### CORS Setup
```typescript
// main.ts
app.enableCors({
  origin: process.env.CORS_ORIN || 'http://localhost:3000',
  credentials: true,
});
```

## Data Protection

### Audit Logging
```typescript
// Log all sensitive operations
await this.auditLogService.logAction({
  userEmail: userEmail,
  action: 'update',
  collectionName: 'bookings',
  objectId: id,
  before: oldData,
  after: newData,
});
```

### Sensitive Data Handling
```typescript
// Don't log sensitive data
await this.auditLogService.logAction({
  userEmail: email,
  action: 'login',
  collectionName: 'users',
  objectId: user.id,
  // Don't include password in logs
});
```

## Error Handling

### Prisma Error Handling
```typescript
try {
  const user = await this.prisma.user.create({
    data: { email, password: hashedPassword }
  });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      throw new ConflictException('Email already exists');
    }
  }
  throw error;
}
```

### Custom Error Responses
```typescript
@Post()
async createBooking(@Body() createBookingDto: CreateBookingDto) {
  try {
    return await this.bookingsService.createBooking(createBookingDto);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific Prisma errors
      throw new BadRequestException('Invalid booking data');
    }
    throw error;
  }
}
```

## Security Headers

### Helmet Configuration
```typescript
import helmet from 'helmet';

app.use(helmet());
```

## Database Security Best Practices

### 1. Connection Security
- Use SSL for database connections in production
- Implement connection pooling
- Use environment variables for sensitive data

### 2. Query Security
- Prisma automatically prevents SQL injection
- Use parameterized queries
- Validate all inputs

### 3. Access Control
- Implement role-based access control
- Use database-level permissions
- Audit all database operations

### 4. Data Encryption
- Encrypt sensitive data at rest
- Use HTTPS for all communications
- Hash passwords with bcrypt

## Monitoring & Logging

### Security Logging
```typescript
// Log failed login attempts
async loginUser(email: string, password: string): Promise<LoginResult> {
  try {
    // Login logic...
  } catch (error) {
    // Log failed attempt
    await this.auditLogService.logAction({
      userEmail: email,
      action: 'login_failed',
      collectionName: 'users',
      objectId: 'unknown',
    });
    throw error;
  }
}
```

### Database Monitoring
- Monitor database access patterns
- Log all admin operations
- Track failed authentication attempts
- Monitor for suspicious activities

## Compliance & Standards

### GDPR Compliance
- Data minimization
- Right to be forgotten
- Data portability
- Consent management

### Security Standards
- OWASP Top 10 compliance
- Input validation
- Output encoding
- Secure session management 