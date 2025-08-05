import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type BookingDocument = Booking & Document;

@Schema({ timestamps: true })
export class Booking {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userEmail: string;

  @Prop({ required: true })
  hotelId: string;

  @Prop({ required: true })
  hotelName: string;

  @Prop({ required: true })
  numDays: number;

  @Prop({ required: true })
  numRooms: number;

  @Prop({ required: true })
  totalPrice: number;

  @Prop({ default: false })
  isCancelled: boolean;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
