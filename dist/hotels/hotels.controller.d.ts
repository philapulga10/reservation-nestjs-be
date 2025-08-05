import { HotelsService } from './hotels.service';
export declare class HotelsController {
    private readonly hotelsService;
    constructor(hotelsService: HotelsService);
    getHotels(location?: string, search?: string, page?: string, limit?: string): Promise<{
        data: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            location: string;
            price: number;
            rating: number;
            image: string;
        }[];
        totalPages: number;
        currentPage: number;
    }>;
    getHotelById(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        location: string;
        price: number;
        rating: number;
        image: string;
    }>;
}
