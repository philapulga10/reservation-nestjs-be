import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true })
export class AuditLog {
  @Prop()
  userEmail: string;

  @Prop({ required: true })
  action: string;

  @Prop({ required: true })
  collectionName: string;

  @Prop({ required: true })
  objectId: string;

  @Prop({ type: Object })
  before: Record<string, any>;

  @Prop({ type: Object })
  after: Record<string, any>;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog); 