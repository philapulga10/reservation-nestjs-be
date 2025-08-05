import { PrismaService } from '../prisma/prisma.service';
import { Hotel } from '@prisma/client';
export declare class HotelsService {
    private prisma;
    constructor(prisma: PrismaService);
    getHotels(location?: string, search?: string, page?: number, limit?: number): Promise<{
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
    getHotelById(id: string): Promise<Hotel | null>;
}
