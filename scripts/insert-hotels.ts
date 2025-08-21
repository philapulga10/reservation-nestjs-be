#!/usr/bin/env ts-node

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { DatabaseService } from '../src/database/database.service';

const hotels = [
  {
    name: 'Grand Plaza Hotel & Spa',
    location: 'Ho Chi Minh City, Vietnam',
    price: 120.0,
    rating: 4.8,
    image:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
  },
  {
    name: 'Hanoi Imperial Palace',
    location: 'Hanoi, Vietnam',
    price: 95.0,
    rating: 4.6,
    image:
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop',
  },
  {
    name: 'Da Nang Beach Resort',
    location: 'Da Nang, Vietnam',
    price: 85.0,
    rating: 4.7,
    image:
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop',
  },
  {
    name: 'Hoi An Riverside Hotel',
    location: 'Hoi An, Vietnam',
    price: 75.0,
    rating: 4.5,
    image:
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop',
  },
  {
    name: 'Nha Trang Ocean View',
    location: 'Nha Trang, Vietnam',
    price: 110.0,
    rating: 4.9,
    image:
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop',
  },
  {
    name: 'Phu Quoc Paradise Resort',
    location: 'Phu Quoc, Vietnam',
    price: 140.0,
    rating: 4.8,
    image:
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=600&fit=crop',
  },
  {
    name: 'Sapa Mountain Lodge',
    location: 'Sapa, Vietnam',
    price: 65.0,
    rating: 4.4,
    image:
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop',
  },
  {
    name: 'Hue Royal Heritage',
    location: 'Hue, Vietnam',
    price: 80.0,
    rating: 4.6,
    image:
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop',
  },
  {
    name: 'Can Tho Mekong Delta',
    location: 'Can Tho, Vietnam',
    price: 70.0,
    rating: 4.3,
    image:
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop',
  },
  {
    name: 'Vung Tau Coastal Hotel',
    location: 'Vung Tau, Vietnam',
    price: 90.0,
    rating: 4.5,
    image:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
  },
  {
    name: 'Dalat Highland Resort',
    location: 'Dalat, Vietnam',
    price: 85.0,
    rating: 4.7,
    image:
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop',
  },
  {
    name: 'Mui Ne Desert Lodge',
    location: 'Mui Ne, Vietnam',
    price: 95.0,
    rating: 4.4,
    image:
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop',
  },
  {
    name: 'Ha Long Bay Cruise Hotel',
    location: 'Ha Long, Vietnam',
    price: 130.0,
    rating: 4.8,
    image:
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=600&fit=crop',
  },
  {
    name: 'Buon Ma Thuot Coffee Resort',
    location: 'Buon Ma Thuot, Vietnam',
    price: 75.0,
    rating: 4.3,
    image:
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop',
  },
  {
    name: 'Quy Nhon Beach Hotel',
    location: 'Quy Nhon, Vietnam',
    price: 100.0,
    rating: 4.6,
    image:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
  },
  {
    name: 'Con Dao Island Resort',
    location: 'Con Dao, Vietnam',
    price: 150.0,
    rating: 4.9,
    image:
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop',
  },
  {
    name: 'Bac Lieu Coastal Hotel',
    location: 'Bac Lieu, Vietnam',
    price: 80.0,
    rating: 4.2,
    image:
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop',
  },
  {
    name: 'Kien Giang Island Resort',
    location: 'Kien Giang, Vietnam',
    price: 120.0,
    rating: 4.7,
    image:
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=600&fit=crop',
  },
  {
    name: 'Tay Ninh Mountain View',
    location: 'Tay Ninh, Vietnam',
    price: 70.0,
    rating: 4.4,
    image:
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop',
  },
  {
    name: 'Binh Thuan Desert Hotel',
    location: 'Binh Thuan, Vietnam',
    price: 85.0,
    rating: 4.5,
    image:
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop',
  },
];

async function insertHotels() {
  let app;

  try {
    console.log('=== Insert Sample Hotels ===\n');

    // Initialize NestJS app
    console.log('Initializing application...');
    app = await NestFactory.createApplicationContext(AppModule);

    // Get DatabaseService
    const databaseService = app.get(DatabaseService);

    console.log(`Inserting ${hotels.length} hotels...\n`);

    // Insert each hotel
    for (let i = 0; i < hotels.length; i++) {
      const hotel = hotels[i];
      console.log(`[${i + 1}/${hotels.length}] Creating: ${hotel.name}`);

      try {
        const createdHotel = await databaseService.createHotel(hotel);
        console.log(
          `✅ Created: ${createdHotel.name} (ID: ${createdHotel.id})`
        );
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️  Skipped: ${hotel.name} (already exists)`);
        } else {
          console.error(`❌ Error creating ${hotel.name}:`, error.message);
        }
      }
    }

    console.log('\n🎉 Hotel insertion completed!');

    // Get total count
    const totalHotels = await databaseService.getAllHotels();
    console.log(`Total hotels in database: ${totalHotels.length}`);
  } catch (error) {
    console.error('❌ Error inserting hotels:', error);

    if (error.message.includes('DATABASE_URL')) {
      console.error(
        'Database connection failed. Please check your .env file and database connection.'
      );
    } else {
      console.error('Unexpected error:', error.message);
    }

    process.exit(1);
  } finally {
    if (app) {
      await app.close();
    }
  }
}

insertHotels();
