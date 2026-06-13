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

  /** Users who have reposted this post (for toggle + count). */
  @Prop({ type: [String], default: [] })
  reposts: string[];

  /** When set, this doc is a repost of another post (shown in the feed). */
  @Prop({ default: null, index: true })
  repostOf?: string;

  @Prop({ default: null })
  repostedById?: string;

  @Prop({ default: null })
  repostedByName?: string;
}

export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.index({ createdAt: -1 });
