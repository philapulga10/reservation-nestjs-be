# Hệ Thống Quản Lý Khách Sạn

## Tổng Quan

Hệ thống quản lý khách sạn sử dụng Prisma ORM để tương tác với PostgreSQL database.

## Database Schema

### Hotel Model (Prisma)

```prisma
model Hotel {
  id       String @id @default(cuid())
  name     String
  location String
  price    Float
  rating   Float
  image    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  bookings Booking[]
}
```

## API Endpoints

### 1. Get Hotels

```typescript
@Get()
async getHotels(
  @Query('location') location?: string,
  @Query('search') search?: string,
  @Query('page') page: string = '1',
  @Query('limit') limit: string = '10',
) {
  return this.hotelsService.getHotels(
    location,
    search,
    parseInt(page),
    parseInt(limit)
  );
}
```

### 2. Get Hotel by ID

```typescript
@Get(':id')
async getHotelById(@Param('id') id: string) {
  return this.hotelsService.getHotelById(id);
}
```

## Service Implementation

### HotelsService

```typescript
@Injectable()
export class HotelsService {
  constructor(private prisma: PrismaService) {}

  async getHotels(
    location?: string,
    search?: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (location && location !== 'all') {
      where.location = location;
    }
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.hotel.findMany({
        where,
```
