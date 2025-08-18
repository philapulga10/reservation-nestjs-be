import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { db } from './connection';
import * as schema from './schema';
import { eq, ilike, or, and, gte, lte, desc, sql } from 'drizzle-orm';

// ✅ Custom types to handle decimal fields
export interface CreateBookingData {
  userId: string;
  userEmail: string;
  hotelId: string;
  hotelName: string;
  numDays: number;
  numRooms: number;
  totalPrice: number; // ✅ number for decimal field
}

export interface UpdateBookingData {
  numDays?: number;
  numRooms?: number;
  totalPrice?: number; // ✅ number for decimal field
  isCancelled?: boolean;
  updatedAt?: Date;
}

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  get db() {
    return db;
  }

  // User operations
  async findUserById(id: string) {
    const result = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id));
    return result[0] || null;
  }

  async findUserByEmail(email: string) {
    const result = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email));
    return result[0] || null;
  }

  async createUser(data: schema.NewUser) {
    const result = await db.insert(schema.users).values(data).returning();
    return result[0];
  }

  async updateUser(id: string, data: Partial<schema.NewUser>) {
    const result = await db
      .update(schema.users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.users.id, id))
      .returning();
    return result[0];
  }

  // Hotel operations
  async findHotels(params: {
    location?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { location, search, page = 1, limit = 10 } = params;
    const offset = (page - 1) * limit;

    let whereClause = '';
    const queryParams: any[] = [];

    if (location && location !== 'all') {
      whereClause += ' WHERE location = $1';
      queryParams.push(location);
    }

    if (search) {
      const searchParam = location && location !== 'all' ? 2 : 1;
      whereClause += whereClause
        ? ` AND name ILIKE $${searchParam}`
        : ` WHERE name ILIKE $${searchParam}`;
      queryParams.push(`%${search}%`);
    }

    const [data, total] = await Promise.all([
      db.execute(
        sql`SELECT * FROM hotels${whereClause ? sql.raw(whereClause) : sql``} LIMIT ${limit} OFFSET ${offset}`
      ),
      db.execute(
        sql`SELECT count(*) FROM hotels${whereClause ? sql.raw(whereClause) : sql``}`
      ),
    ]);

    return {
      data: data.rows,
      total: Number(total.rows[0]?.count || 0),
      page,
      limit,
      totalPages: Math.ceil(Number(total.rows[0]?.count || 0) / limit),
      currentPage: page,
    };
  }

  async findHotelById(id: string) {
    const result = await db
      .select()
      .from(schema.hotels)
      .where(eq(schema.hotels.id, id));
    return result[0] || null;
  }

  // ✅ Updated Booking operations with custom types
  async createBooking(data: CreateBookingData) {
    // ✅ Cast to match Drizzle's expected types
    const bookingData = {
      ...data,
      totalPrice: data.totalPrice.toString(), // Convert number to string for Drizzle
    } as any;
    const result = await db
      .insert(schema.bookings)
      .values(bookingData)
      .returning();
    return result[0];
  }

  async findBookingsForUser(params: {
    userEmail: string;
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) {
    const { userEmail, page = 1, limit = 10, search, status } = params;
    const offset = (page - 1) * limit;

    let whereConditions = [eq(schema.bookings.userEmail, userEmail)];

    if (status) {
      whereConditions.push(
        eq(schema.bookings.isCancelled, status === 'cancelled')
      );
    }

    if (search) {
      whereConditions.push(
        or(
          ilike(schema.bookings.hotelName, `%${search}%`),
          ilike(schema.bookings.userEmail, `%${search}%`)
        )
      );
    }

    const [data, total] = await Promise.all([
      db
        .select()
        .from(schema.bookings)
        .where(and(...whereConditions))
        .orderBy(desc(schema.bookings.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql`count(*)` })
        .from(schema.bookings)
        .where(eq(schema.bookings.userEmail, userEmail)),
    ]);

    return {
      data,
      total: Number(total[0]?.count || 0),
      page,
      limit,
      totalPages: Math.ceil(Number(total[0]?.count || 0) / limit),
      currentPage: page,
    };
  }

  async findBookingById(id: string) {
    const result = await db
      .select()
      .from(schema.bookings)
      .where(eq(schema.bookings.id, id));
    return result[0] || null;
  }

  async updateBooking(id: string, data: UpdateBookingData) {
    // ✅ Cast to match Drizzle's expected types
    const updateData = {
      ...data,
      ...(data.totalPrice !== undefined && {
        totalPrice: data.totalPrice.toString(),
      }),
      updatedAt: new Date(),
    } as any;
    const result = await db
      .update(schema.bookings)
      .set(updateData)
      .where(eq(schema.bookings.id, id))
      .returning();
    return result[0];
  }

  async getAllBookings(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) {
    const { page = 1, limit = 10, search, status } = params;
    const offset = (page - 1) * limit;

    let whereConditions = [];

    if (status) {
      whereConditions.push(
        eq(schema.bookings.isCancelled, status === 'cancelled')
      );
    }

    if (search) {
      whereConditions.push(
        or(
          ilike(schema.bookings.userEmail, `%${search}%`),
          ilike(schema.bookings.hotelName, `%${search}%`)
        )
      );
    }

    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const [data, total] = await Promise.all([
      db
        .select()
        .from(schema.bookings)
        .where(whereClause)
        .orderBy(desc(schema.bookings.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: sql`count(*)` }).from(schema.bookings),
    ]);

    return {
      data,
      total: Number(total[0]?.count || 0),
      page,
      limit,
      totalPages: Math.ceil(Number(total[0]?.count || 0) / limit),
      currentPage: page,
    };
  }

  async getBookingStats() {
    const [totalBookings, activeBookings, cancelledBookings, totalRevenue] =
      await Promise.all([
        db.select({ count: sql`count(*)` }).from(schema.bookings),
        db
          .select({ count: sql`count(*)` })
          .from(schema.bookings)
          .where(eq(schema.bookings.isCancelled, false)),
        db
          .select({ count: sql`count(*)` })
          .from(schema.bookings)
          .where(eq(schema.bookings.isCancelled, true)),
        db
          .select({ sum: sql`sum(total_price)` })
          .from(schema.bookings)
          .where(eq(schema.bookings.isCancelled, false)),
      ]);

    return {
      totalBookings: Number(totalBookings[0]?.count || 0),
      activeBookings: Number(activeBookings[0]?.count || 0),
      cancelledBookings: Number(cancelledBookings[0]?.count || 0),
      totalRevenue: Number(totalRevenue[0]?.sum || 0),
    };
  }

  // Reward operations
  async createRewardHistory(data: schema.NewRewardHistory) {
    const result = await db
      .insert(schema.rewardHistory)
      .values(data)
      .returning();
    return result[0];
  }

  async findRewardHistoryByUserId(params: {
    userId: string;
    page?: number;
    limit?: number;
  }) {
    const { userId, page = 1, limit = 10 } = params;
    const offset = (page - 1) * limit;

    const [data, total] = await Promise.all([
      db
        .select()
        .from(schema.rewardHistory)
        .where(eq(schema.rewardHistory.userId, userId))
        .orderBy(desc(schema.rewardHistory.date))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql`count(*)` })
        .from(schema.rewardHistory)
        .where(eq(schema.rewardHistory.userId, userId)),
    ]);

    return {
      data,
      total: Number(total[0]?.count || 0),
      page,
      limit,
      totalPages: Math.ceil(Number(total[0]?.count || 0) / limit),
      currentPage: page,
    };
  }

  async getAllRewardHistory(params: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const { page = 1, limit = 10, search } = params;
    const offset = (page - 1) * limit;

    let whereClause = undefined;
    if (search) {
      whereClause = or(ilike(schema.rewardHistory.reason, `%${search}%`));
    }

    const [data, total] = await Promise.all([
      db
        .select()
        .from(schema.rewardHistory)
        .where(whereClause)
        .orderBy(desc(schema.rewardHistory.date))
        .limit(limit)
        .offset(offset),
      db.select({ count: sql`count(*)` }).from(schema.rewardHistory),
    ]);

    return {
      data,
      total: Number(total[0]?.count || 0),
      page,
      limit,
      totalPages: Math.ceil(Number(total[0]?.count || 0) / limit),
      currentPage: page,
    };
  }

  // Audit log operations
  async createAuditLog(data: schema.NewAuditLog) {
    const result = await db.insert(schema.auditLogs).values(data).returning();
    return result[0];
  }

  async getAuditLogs(params: {
    page?: number;
    limit?: number;
    action?: string;
    userEmail?: string;
    collectionName?: string;
    fromDate?: string;
    toDate?: string;
  }) {
    const {
      page = 1,
      limit = 10,
      action,
      userEmail,
      collectionName,
      fromDate,
      toDate,
    } = params;
    const offset = (page - 1) * limit;

    let whereConditions = [];

    if (action) {
      whereConditions.push(eq(schema.auditLogs.action, action));
    }

    if (userEmail) {
      whereConditions.push(ilike(schema.auditLogs.userEmail, `%${userEmail}%`));
    }

    if (collectionName) {
      whereConditions.push(eq(schema.auditLogs.collectionName, collectionName));
    }

    if (fromDate || toDate) {
      const conditions = [];
      if (fromDate) {
        conditions.push(gte(schema.auditLogs.createdAt, new Date(fromDate)));
      }
      if (toDate) {
        conditions.push(lte(schema.auditLogs.createdAt, new Date(toDate)));
      }
      whereConditions.push(and(...conditions));
    }

    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const [data, total] = await Promise.all([
      db
        .select()
        .from(schema.auditLogs)
        .where(whereClause)
        .orderBy(desc(schema.auditLogs.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: sql`count(*)` }).from(schema.auditLogs),
    ]);

    return {
      data,
      total: Number(total[0]?.count || 0),
      page,
      limit,
      totalPages: Math.ceil(Number(total[0]?.count || 0) / limit),
      currentPage: page,
    };
  }

  // Admin log operations
  async createAdminLog(data: schema.NewAdminLog) {
    const result = await db.insert(schema.adminLogs).values(data).returning();
    return result[0];
  }

  async getAdminLogs(params: {
    page?: number;
    limit?: number;
    action?: string;
    adminEmail?: string;
    fromDate?: string;
    toDate?: string;
  }) {
    const {
      page = 1,
      limit = 10,
      action,
      adminEmail,
      fromDate,
      toDate,
    } = params;
    const offset = (page - 1) * limit;

    let whereConditions = [];

    if (action) {
      whereConditions.push(eq(schema.adminLogs.action, action));
    }

    if (adminEmail) {
      whereConditions.push(ilike(schema.users.email, `%${adminEmail}%`));
    }

    if (fromDate || toDate) {
      const conditions = [];
      if (fromDate) {
        conditions.push(gte(schema.adminLogs.createdAt, new Date(fromDate)));
      }
      if (toDate) {
        conditions.push(lte(schema.adminLogs.createdAt, new Date(toDate)));
      }
      whereConditions.push(and(...conditions));
    }

    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const [data, total] = await Promise.all([
      db
        .select()
        .from(schema.adminLogs)
        .where(whereClause)
        .orderBy(desc(schema.adminLogs.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: sql`count(*)` }).from(schema.adminLogs),
    ]);

    return {
      data,
      total: Number(total[0]?.count || 0),
      page,
      limit,
      totalPages: Math.ceil(Number(total[0]?.count || 0) / limit),
      currentPage: page,
    };
  }

  async onModuleDestroy() {
    // Pool will be closed automatically
  }
}
