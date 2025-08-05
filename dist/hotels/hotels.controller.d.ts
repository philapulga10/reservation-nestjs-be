import { HotelsService } from './hotels.service';
export declare class HotelsController {
    private readonly hotelsService;
    constructor(hotelsService: HotelsService);
    getHotels(location?: string, search?: string, page?: string, limit?: string): Promise<{
        data: (import("mongoose").Document<unknown, {}, import("./schemas/hotel.schema").HotelDocument, {}, {}> & import("./schemas/hotel.schema").Hotel & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        })[];
        totalPages: number;
        currentPage: number;
    }>;
    getHotelById(id: string): Promise<import("./schemas/hotel.schema").Hotel>;
}
