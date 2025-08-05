# Hệ Thống Đặt Phòng

## Tổng Quan
Hệ thống đặt phòng sử dụng Prisma ORM để quản lý bookings trong PostgreSQL với relationships với User và Hotel.

## Database Schema

### Booking Model (Prisma)
```prisma
model Booking {
  id         String @id @default(cuid())
  userId     String
  userEmail  String
  hotelId    String
  hotelName  String
  numDays    Int
  numRooms   Int
  totalPrice Float
  isCancelled Boolean @default(false)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  user  User  @relation(fields: [userId], references: [id])
  hotel Hotel @relation(fields: [hotelId], references: [id])
}
```

## API Endpoints

### 1. Create Booking
```typescript
@Post()
@HttpCode(HttpStatus.CREATED)
async createBooking(@Body() createBookingDto: CreateBookingDto) {
  return this.bookingsService.createBooking(createBookingDto);
}
```

### 2. Get User Bookings
```typescript
@Get()
async getBookings(
  @Request() req,
  @Query("page") page: string = "1",
  @Query("limit") limit: string = "6",
  @Query("isCancelled") isCancelled?: string
) {
  const filter: Record<string, any> = {};
  if (isCancelled !== undefined) {
    filter.isCancelled = isCancelled === "true";
  }

  return this.bookingsService.getBookingsForUser(
    req.user.email,
    parseInt(page),
    parseInt(limit),
    filter
  );
}
```

### 3. Update Booking
```typescript
@Put(":id")
async updateBooking(
  @Param("id") id: string,
  @Body() updateBookingDto: UpdateBookingDto,
  @Request() req
) {
  return this.bookingsService.updateBooking(
    id,
    updateBookingDto,
    req.user.email
  );
}
```

### 4. Cancel Booking
```typescript
@Delete(":id")
async cancelBooking(@Param("id") id: string, @Request() req) {
  return this.bookingsService.cancelBooking(id, req.user.email);
}
```

## Service Implementation

### BookingsService
```typescript
@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
  ) {}

  async createBooking(data: CreateBookingDto): Promise<Booking> {
    const booking = await this.prisma.booking.create({
      data,
    });

    // Audit log
    await this.auditLogService.logAction({
      userEmail: data.userEmail,
      action: 'create',
      collectionName: 'bookings',
      objectId: booking.id,
      after: booking,
    });

    return booking;
  }

  async getBookingsForUser(
    email: string,
    page: number = 1,
    limit: number = 10,
    filter: Record<string, any> = {},
  ) {
    const skip = (page - 1) * limit;
    const where = { userEmail: email, ...filter };

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      bookings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateBooking(
    id: string,
    data: UpdateBookingDto,
    userEmail: string,
  ): Promise<Booking | null> {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const before = booking;
    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data,
    });

    // Audit log
    await this.auditLogService.logAction({
      userEmail,
      action: 'update',
      collectionName: 'bookings',
      objectId: id,
      before,
      after: updatedBooking,
    });

    return updatedBooking;
  }

  async cancelBooking(id: string, userEmail: string): Promise<Booking | null> {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const before = booking;
    const cancelledBooking = await this.prisma.booking.update({
      where: { id },
      data: { isCancelled: true },
    });

    // Audit log
    await this.auditLogService.logAction({
      userEmail,
      action: 'cancel',
      collectionName: 'bookings',
      objectId: id,
      before,
      after: cancelledBooking,
    });

    return cancelledBooking;
  }

  async getBookingStats() {
    const [total, cancelled, active] = await Promise.all([
      this.prisma.booking.count(),
      this.prisma.booking.count({ where: { isCancelled: true } }),
      this.prisma.booking.count({ where: { isCancelled: false } }),
    ]);

    return {
      total,
      cancelled,
      active,
    };
  }
}
```

## Database Queries

### Create Booking
```typescript
const booking = await this.prisma.booking.create({
  data: {
    userId: 'user_id',
    userEmail: 'user@example.com',
    hotelId: 'hotel_id',
    hotelName: 'Hotel Name',
    numDays: 3,
    numRooms: 2,
    totalPrice: 300.0
  }
});
```

### Find User Bookings
```typescript
const bookings = await this.prisma.booking.findMany({
  where: { 
    userEmail: 'user@example.com',
    isCancelled: false 
  },
  orderBy: { createdAt: 'desc' },
  skip: (page - 1) * limit,
  take: limit
});
```

### Update Booking
```typescript
const updatedBooking = await this.prisma.booking.update({
  where: { id: 'booking_id' },
  data: { 
    numDays: 5,
    totalPrice: 500.0 
  }
});
```

### Count Bookings
```typescript
const total = await this.prisma.booking.count({
  where: { isCancelled: false }
});
```

## Features

### 1. User Management
- Users chỉ có thể xem/sửa bookings của mình
- Admin có thể xem tất cả bookings

### 2. Booking Status
- **Active**: isCancelled = false
- **Cancelled**: isCancelled = true

### 3. Audit Logging
- Tất cả thay đổi được log lại
- Track before/after states

### 4. Pagination
- Support pagination cho large datasets
- Configurable page size

### 5. Search & Filter
- Filter by cancellation status
- Search by hotel name or user email (admin)

## Relationships
- **User** ↔ **Booking** (1:N)
- **Hotel** ↔ **Booking** (1:N)

## Error Handling
- Booking not found: NotFoundException
- Invalid data: Validation errors
- Database errors: Prisma error handling 