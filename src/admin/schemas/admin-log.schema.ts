import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AdminLogDocument = AdminLog & Document;

@Schema({ timestamps: true })
export class AdminLog {
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  adminId?: Types.ObjectId;

  @Prop({ required: true })
  action: string;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const AdminLogSchema = SchemaFactory.createForClass(AdminLog); 