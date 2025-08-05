import { Model } from 'mongoose';
import { Hotel, HotelDocument } from './schemas/hotel.schema';
export declare class HotelsService {
    private hotelModel;
    constructor(hotelModel: Model<HotelDocument>);
    getHotels(location?: string, search?: string, page?: number, limit?: number): Promise<{
        data: (import("mongoose").Document<unknown, {}, HotelDocument, {}, {}> & Hotel & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        })[];
        totalPages: number;
        currentPage: number;
    }>;
    getHotelById(id: string): Promise<Hotel | null>;
}
