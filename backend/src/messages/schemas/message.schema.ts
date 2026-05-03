import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MessageDocument = HydratedDocument<Message>;

@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true, index: true })
  senderId: string;

  @Prop({ required: true, index: true })
  recipientId: string;

  @Prop({ required: true, trim: true })
  content: string;

  @Prop({ default: false, index: true })
  read: boolean;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
MessageSchema.index({ senderId: 1, recipientId: 1, createdAt: 1 });
