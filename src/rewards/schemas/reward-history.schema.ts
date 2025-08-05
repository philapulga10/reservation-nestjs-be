import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RewardHistoryDocument = RewardHistory & Document;

@Schema({ timestamps: true })
export class RewardHistory {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ default: Date.now })
  date: Date;

  @Prop({ required: true })
  points: number;

  @Prop({ required: true })
  reason: string;
}

export const RewardHistorySchema = SchemaFactory.createForClass(RewardHistory); 