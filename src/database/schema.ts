import { relations } from 'drizzle-orm';

import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  json,
  pgEnum,
  numeric,
} from 'drizzle-orm/pg-core';

// Enums
export const roleEnum = pgEnum('role', ['USER', 'ADMIN']);

// Users table
export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: roleEnum('role').notNull().default('USER'),
  points: integer('points').notNull().default(0),
  lastLogoutAt: timestamp('last_logout_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Hotels table
export const hotels = pgTable('hotels', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  location: text('location').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  rating: numeric('rating', { precision: 3, scale: 1 }).notNull(),
  image: text('image').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Bookings table
export const bookings = pgTable('bookings', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  userEmail: text('user_email').notNull(),
  hotelId: text('hotel_id')
    .notNull()
    .references(() => hotels.id),
  hotelName: text('hotel_name').notNull(),
  numDays: integer('num_days').notNull(),
  numRooms: integer('num_rooms').notNull(),
  totalPrice: numeric('total_price', { precision: 10, scale: 2 }).notNull(),
  isCancelled: boolean('is_cancelled').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Audit logs table
export const auditLogs = pgTable('audit_logs', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userEmail: text('user_email'),
  action: text('action').notNull(),
  collectionName: text('collection_name').notNull(),
  objectId: text('object_id').notNull(),
  before: json('before'),
  after: json('after'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Admin logs table
export const adminLogs = pgTable('admin_logs', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  adminId: text('admin_id').references(() => users.id),
  action: text('action').notNull(),
  metadata: json('metadata').notNull().default('{}'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Reward history table
export const rewardHistory = pgTable('reward_history', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  date: timestamp('date').notNull().defaultNow(),
  points: integer('points').notNull(),
  reason: text('reason').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  rewardHistories: many(rewardHistory),
  adminLogs: many(adminLogs),
}));

export const hotelsRelations = relations(hotels, ({ many }) => ({
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  hotel: one(hotels, {
    fields: [bookings.hotelId],
    references: [hotels.id],
  }),
}));

export const rewardHistoryRelations = relations(rewardHistory, ({ one }) => ({
  user: one(users, {
    fields: [rewardHistory.userId],
    references: [users.id],
  }),
}));

export const adminLogsRelations = relations(adminLogs, ({ one }) => ({
  admin: one(users, {
    fields: [adminLogs.adminId],
    references: [users.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Hotel = typeof hotels.$inferSelect;
export type NewHotel = typeof hotels.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
export type AdminLog = typeof adminLogs.$inferSelect;
export type NewAdminLog = typeof adminLogs.$inferInsert;
export type RewardHistory = typeof rewardHistory.$inferSelect;
export type NewRewardHistory = typeof rewardHistory.$inferInsert;
