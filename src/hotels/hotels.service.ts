import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Hotel } from '@prisma/client';

@Injectable()
export class HotelsService {
  constructor(private prisma: PrismaService) {}

  async getHotels(
    location?: string,
    search?: string,
    page: number = 1,
    limit: number = 10
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
        skip,
        take: limit,
      }),
      this.prisma.hotel.count({ where }),
    ]);

    return {
      data,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async getHotelById(id: string): Promise<Hotel | null> {
    return this.prisma.hotel.findUnique({
      where: { id },
    });
  }
}
