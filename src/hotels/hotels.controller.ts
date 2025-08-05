import { Controller, Get, Param, Query } from '@nestjs/common';
import { HotelsService } from './hotels.service';

@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Get()
  async getHotels(
    @Query('location') location?: string,
    @Query('search') search?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    return this.hotelsService.getHotels(
      location,
      search,
      parseInt(page),
      parseInt(limit)
    );
  }

  @Get(':id')
  async getHotelById(@Param('id') id: string) {
    return this.hotelsService.getHotelById(id);
  }
}
