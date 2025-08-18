import { Controller, Get, Param, Query } from '@nestjs/common';
import { HotelsService } from './hotels.service';

@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Get()
  async getHotels(
    @Query('location') location?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    return this.hotelsService.getHotels(
      location,
      search,
      parseInt(page) || 1,
      parseInt(limit) || 10
    );
  }

  @Get(':id')
  async getHotelById(@Param('id') id: string) {
    return this.hotelsService.getHotelById(id);
  }
}
