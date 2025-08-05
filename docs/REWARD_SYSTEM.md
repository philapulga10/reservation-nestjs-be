# Hệ Thống Điểm Thưởng

## Tổng Quan
Hệ thống điểm thưởng sử dụng Prisma ORM để quản lý reward history và user points trong PostgreSQL database.

## Database Schema

### RewardHistory Model (Prisma)
```prisma
model RewardHistory {
  id     String @id @default(cuid())
  userId String
  date   DateTime @default(now())
  points Int
  reason String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])
}
```

### User Model (Updated)
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  role      Role     @default(USER)
  points    Int      @default(0)  // Current points balance
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  rewardHistories RewardHistory[]
}
```

## Service Implementation

### RewardsService
```typescript
@Injectable()
export class RewardsService {
  constructor(private prisma: PrismaService) {}

  async addPoints(data: CreateRewardDto): Promise<RewardHistory> {
    // Create reward history record
    const rewardHistory = await this.prisma.rewardHistory.create({
      data,
    });

    // Update user points
    await this.prisma.user.update({
      where: { id: data.userId },
      data: {
        points: {
          increment: data.points,
        },
      },
    });

    return rewardHistory;
  }

  async getUserRewards(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    const [rewards, total] = await Promise.all([
      this.prisma.rewardHistory.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.rewardHistory.count({ where: { userId } }),
    ]);

    return {
      rewards,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAllRewards(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { reason: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [rewards, total] = await Promise.all([
      this.prisma.rewardHistory.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.rewardHistory.count({ where }),
    ]);

    return {
      rewards,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
```

## API Endpoints

### 1. Add Points
```typescript
@Post()
async addPoints(@Body() createRewardDto: CreateRewardDto) {
  return this.rewardsService.addPoints(createRewardDto);
}
```

### 2. Get User Rewards
```typescript
@Get('user/:userId')
async getUserRewards(
  @Param('userId') userId: string,
  @Query('page') page: string = '1',
  @Query('limit') limit: string = '10',
) {
  return this.rewardsService.getUserRewards(
    userId,
    parseInt(page),
    parseInt(limit)
  );
}
```

### 3. Get All Rewards (Admin)
```typescript
@Get('admin/all')
async getAllRewards(
  @Query('page') page: string = '1',
  @Query('limit') limit: string = '10',
  @Query('search') search?: string,
) {
  return this.rewardsService.getAllRewards(
    parseInt(page),
    parseInt(limit),
    search
  );
}
```

## Database Queries

### Add Points (Transaction)
```typescript
// Create reward history
const rewardHistory = await this.prisma.rewardHistory.create({
  data: {
    userId: 'user_id',
    points: 100,
    reason: 'Booking completed'
  }
});

// Update user points
await this.prisma.user.update({
  where: { id: 'user_id' },
  data: {
    points: {
      increment: 100
    }
  }
});
```

### Get User Rewards with Pagination
```typescript
const rewards = await this.prisma.rewardHistory.findMany({
  where: { userId: 'user_id' },
  orderBy: { date: 'desc' },
  skip: (page - 1) * limit,
  take: limit
});
```

### Get All Rewards with User Info
```typescript
const rewards = await this.prisma.rewardHistory.findMany({
  include: {
    user: {
      select: {
        id: true,
        email: true
      }
    }
  },
  orderBy: { date: 'desc' }
});
```

### Search Rewards
```typescript
const rewards = await this.prisma.rewardHistory.findMany({
  where: {
    OR: [
      { reason: { contains: 'search_term', mode: 'insensitive' } },
      { user: { email: { contains: 'search_term', mode: 'insensitive' } } }
    ]
  }
});
```

## Features

### 1. Point Management
- **Add Points**: Tăng điểm cho user
- **Point Balance**: Theo dõi số điểm hiện tại
- **Point History**: Lịch sử thay đổi điểm

### 2. Reward Reasons
- Booking completed
- Special promotion
- Referral bonus
- Admin adjustment

### 3. User Interface
- Users có thể xem reward history của mình
- Admin có thể xem tất cả rewards
- Search và filter functionality

### 4. Data Integrity
- Atomic operations cho point updates
- Audit trail cho tất cả thay đổi
- Relationship với User model

## Usage Examples

### 1. Award Points for Booking
```typescript
await this.rewardsService.addPoints({
  userId: booking.userId,
  points: 50,
  reason: 'Booking completed - Hotel ABC'
});
```

### 2. Award Points for Promotion
```typescript
await this.rewardsService.addPoints({
  userId: 'user_id',
  points: 100,
  reason: 'Summer promotion bonus'
});
```

### 3. Get User Point Balance
```typescript
const user = await this.prisma.user.findUnique({
  where: { id: 'user_id' },
  select: { points: true }
});
```

## Relationships
- **User** ↔ **RewardHistory** (1:N)
- User có một điểm balance hiện tại
- Mỗi reward history record track một thay đổi điểm

## Performance Considerations
- Index trên userId và date
- Pagination cho large datasets
- Efficient queries với includes
- Atomic operations cho point updates 