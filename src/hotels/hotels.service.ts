import { Injectable, NotFoundException } from '@nestjs/common';

import { DatabaseService } from '@/database/database.service';
import { Hotel } from '@/database/schema';

@Injectable()
export class HotelsService {
  constructor(private databaseService: DatabaseService) {}

  async getHotels(
    location?: string,
    search?: string,
    page: number = 1,
    limit: number = 10
  ) {
    return this.databaseService.findHotels({
      location,
      search,
      page,
      limit,
    });
  }

  async getHotelById(id: string): Promise<Hotel> {
    const hotel = await this.databaseService.findHotelById(id);
    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }
    return hotel;
  }
}
