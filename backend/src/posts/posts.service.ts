import { ForbiddenException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
    const imageIds = payload.imageIds ?? [];
    const attachments = payload.attachments ?? [];
    const content = payload.content?.trim() ?? '';
    if (!content && imageIds.length === 0 && attachments.length === 0) {
      throw new BadRequestException('Post must include text or media');
    }
    const tags = this.normalizeTags(payload.tags, content);
    return this.postModel.create({
      authorId: user.userId,
      authorName: user.displayName ?? 'Developer',
      authorPhoto: user.photoURL ?? '',
      content,
      imageIds,
      attachments,
      tags,
    });
  }

  async feed() {
    return this.postModel.find().sort({ createdAt: -1 }).limit(100).lean();
  }

  findById(postId: string) {
    return this.postModel.findById(postId).lean();
  }

  async adjustCommentCount(postId: string, delta: number) {
    await this.postModel.updateOne({ _id: postId }, { $inc: { commentCount: delta } });
  }

  async update(
    postId: string,
    userId: string,
    payload: { content?: string; tags?: string[]; imageIds?: string[]; attachments?: CreatePostDto['attachments'] },
  ) {
    const post = await this.postModel.findById(postId).lean();
    if (!post) throw new NotFoundException('Post not found');
    if (post.authorId !== userId) throw new ForbiddenException('You can only edit your own posts');

    const update: Record<string, unknown> = {};
    if (typeof payload.content === 'string') {
      update.content = payload.content;
      update.tags = this.normalizeTags(payload.tags, payload.content);
    } else if (payload.tags) {
      update.tags = this.normalizeTags(payload.tags, post.content);
    }
    if (Array.isArray(payload.imageIds)) {
      update.imageIds = payload.imageIds;
    }
    if (Array.isArray(payload.attachments)) {
      update.attachments = payload.attachments;
    }

    await this.postModel.updateOne({ _id: postId }, { $set: update });
    return this.postModel.findById(postId).lean();
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

  /** Toggle a repost of `postId` by the user. Creates/removes a feed entry. */
  async toggleRepost(
    postId: string,
    reposter: { userId: string; displayName?: string; photoURL?: string },
    caption?: string,
  ) {
    const source = await this.postModel.findById(postId).lean();
    if (!source) throw new NotFoundException('Post not found');

    // Repost the underlying original if the user reposts a repost.
    const targetId = source.repostOf ?? postId;
    const target = source.repostOf
      ? await this.postModel.findById(targetId).lean()
      : source;
    if (!target) throw new NotFoundException('Post not found');

    const existing = await this.postModel
      .findOne({ repostOf: targetId, repostedById: reposter.userId })
      .lean();

    if (existing) {
      await this.postModel.deleteOne({ _id: existing._id });
      await this.postModel.updateOne({ _id: targetId }, { $pull: { reposts: reposter.userId } });
      return { reposted: false, authorId: target.authorId };
    }

    await this.postModel.create({
      authorId: target.authorId,
      authorName: target.authorName,
      authorPhoto: target.authorPhoto,
      content: target.content,
      imageIds: target.imageIds ?? [],
      tags: target.tags ?? [],
      repostOf: targetId,
      repostedById: reposter.userId,
      repostedByName: reposter.displayName ?? 'Developer',
      repostedByPhoto: reposter.photoURL ?? '',
      repostCaption: caption?.trim() ?? '',
    });
    await this.postModel.updateOne({ _id: targetId }, { $addToSet: { reposts: reposter.userId } });
    return { reposted: true, authorId: target.authorId };
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
