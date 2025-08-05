import { PrismaClient } from '@prisma/client';
import { MongoClient } from 'mongodb';

const prisma = new PrismaClient();
const mongoClient = new MongoClient(process.env.MONGO_URL || 'mongodb://localhost:27017/reservation');

async function migrateData() {
  try {
    await mongoClient.connect();
    const db = mongoClient.db();

    // Migrate Users
    const users = await db.collection('users').find({}).toArray();
    for (const user of users) {
      await prisma.user.create({
        data: {
          id: user._id.toString(),
          email: user.email,
          password: user.password,
          role: user.role === 'admin' ? 'ADMIN' : 'USER',
          points: user.points || 0,
          createdAt: user.createdAt || new Date(),
          updatedAt: user.updatedAt || new Date(),
        },
      });
    }

    // Migrate Hotels
    const hotels = await db.collection('hotels').find({}).toArray();
    for (const hotel of hotels) {
      await prisma.hotel.create({
        data: {
          id: hotel._id.toString(),
          name: hotel.name,
          location: hotel.location,
          price: hotel.price,
          rating: hotel.rating,
          image: hotel.image,
          createdAt: hotel.createdAt || new Date(),
          updatedAt: hotel.updatedAt || new Date(),
        },
      });
    }

    // Migrate Bookings
    const bookings = await db.collection('bookings').find({}).toArray();
    for (const booking of bookings) {
      await prisma.booking.create({
        data: {
          id: booking._id.toString(),
          userId: booking.userId,
          userEmail: booking.userEmail,
          hotelId: booking.hotelId,
          hotelName: booking.hotelName,
          numDays: booking.numDays,
          numRooms: booking.numRooms,
          totalPrice: booking.totalPrice,
          isCancelled: booking.isCancelled || false,
          createdAt: booking.createdAt || new Date(),
          updatedAt: booking.updatedAt || new Date(),
        },
      });
    }

    // Migrate Audit Logs
    const auditLogs = await db.collection('audit_logs').find({}).toArray();
    for (const log of auditLogs) {
      await prisma.auditLog.create({
        data: {
          id: log._id.toString(),
          userEmail: log.userEmail,
          action: log.action,
          collectionName: log.collectionName,
          objectId: log.objectId,
          before: log.before,
          after: log.after,
          createdAt: log.createdAt || new Date(),
          updatedAt: log.updatedAt || new Date(),
        },
      });
    }

    // Migrate Admin Logs
    const adminLogs = await db.collection('admin_logs').find({}).toArray();
    for (const log of adminLogs) {
      await prisma.adminLog.create({
        data: {
          id: log._id.toString(),
          adminId: log.adminId?.toString(),
          action: log.action,
          metadata: log.metadata || {},
          createdAt: log.createdAt || new Date(),
          updatedAt: log.updatedAt || new Date(),
        },
      });
    }

    // Migrate Reward History
    const rewardHistory = await db.collection('reward_history').find({}).toArray();
    for (const reward of rewardHistory) {
      await prisma.rewardHistory.create({
        data: {
          id: reward._id.toString(),
          userId: reward.userId.toString(),
          date: reward.date || new Date(),
          points: reward.points,
          reason: reward.reason,
          createdAt: reward.createdAt || new Date(),
          updatedAt: reward.updatedAt || new Date(),
        },
      });
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
    await mongoClient.close();
  }
}

migrateData(); 