import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PostDocument = HydratedDocument<Post>;

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true, index: true })
  authorId: string;

  @Prop({ required: true })
  authorName: string;

  @Prop({ default: '' })
  authorPhoto: string;

  @Prop({ required: true, trim: true })
  content: string;

  @Prop({ type: [String], default: [] })
  imageIds: string[];

  @Prop({ type: [String], default: [] })
  likes: string[];

  @Prop({ default: 0 })
  commentCount: number;

  @Prop({ type: [String], default: [] })
  tags: string[];
}

export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.index({ createdAt: -1 });
