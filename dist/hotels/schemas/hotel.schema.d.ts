import { Document } from 'mongoose';
export type HotelDocument = Hotel & Document;
export declare class Hotel {
    name: string;
    location: string;
    price: number;
    rating: number;
    image: string;
}
export declare const HotelSchema: import("mongoose").Schema<Hotel, import("mongoose").Model<Hotel, any, any, any, Document<unknown, any, Hotel, any, {}> & Hotel & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Hotel, Document<unknown, {}, import("mongoose").FlatRecord<Hotel>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Hotel> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
