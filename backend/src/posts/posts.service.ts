import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UploadsService } from '../uploads/uploads.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    private readonly uploadsService: UploadsService,
  ) {}

  async create(user: { userId: string; displayName?: string; photoURL?: string }, payload: CreatePostDto) {
    const tags = this.normalizeTags(payload.tags, payload.content);
    return this.postModel.create({
      authorId: user.userId,
      authorName: user.displayName ?? 'Developer',
      authorPhoto: user.photoURL ?? '',
      content: payload.content,
      imageIds: payload.imageIds ?? [],
      tags,
    });
  }

  async feed() {
    return this.postModel.find().sort({ createdAt: -1 }).limit(100).lean();
  }

  async searchPosts(rawQuery: string, limit = 30) {
    const q = this.normalizeSearchQuery(rawQuery);
    if (!q) return [];
    const safeLimit = Math.max(1, Math.min(limit, 100));
    const regex = new RegExp(this.escapeRegex(q), 'i');
    return this.postModel
      .find({
        $or: [{ content: regex }, { authorName: regex }, { tags: regex }],
      })
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      .lean();
  }

  async toggleLike(postId: string, userId: string) {
    const post = await this.postModel.findById(postId).lean();
    if (!post) return { liked: false };
    const liked = post.likes.includes(userId);
    if (liked) {
      await this.postModel.updateOne({ _id: postId }, { $pull: { likes: userId } });
      return { liked: false };
    }
    await this.postModel.updateOne({ _id: postId }, { $addToSet: { likes: userId } });
    return { liked: true };
  }

  async deletePost(postId: string, userId: string) {
    const post = await this.postModel.findById(postId).lean();
    if (!post) throw new NotFoundException('Post not found');
    if (post.authorId !== userId) throw new ForbiddenException('You can only delete your own posts');

    const imageIds = post.imageIds ?? [];
    if (imageIds.length > 0) {
      await Promise.all(imageIds.map((id) => this.uploadsService.deleteImage(id)));
    }
    await this.postModel.deleteOne({ _id: postId });
    return { ok: true, deletedImages: imageIds.length };
  }

  private normalizeTags(inputTags: string[] | undefined, content: string): string[] {
    const fromPayload = (inputTags ?? []).map((tag) => tag.trim());
    const fromContent = this.extractTagsFromContent(content);
    const merged = [...fromPayload, ...fromContent]
      .map((tag) => tag.replace(/^#+/, '').toLowerCase())
      .filter((tag) => tag.length > 0 && tag.length <= 50);
    return Array.from(new Set(merged));
  }

  private extractTagsFromContent(content: string): string[] {
    const matches = content.match(/#[a-zA-Z0-9_]+/g) ?? [];
    return matches.map((match) => match.slice(1));
  }

  private normalizeSearchQuery(raw: string) {
    return raw.trim().replace(/\s+/g, ' ').slice(0, 80);
  }

  private escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
