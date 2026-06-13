import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get()
  feed(@Query('q') q?: string, @Query('limit') limitRaw?: string) {
    if (typeof q === 'string' && q.trim().length > 0) {
      const limit = Number.parseInt(limitRaw ?? '30', 10);
      return this.postsService.searchPosts(q, Number.isNaN(limit) ? 30 : limit);
    }
    return this.postsService.feed();
  }

  @Post()
  async create(@CurrentUser() user: { userId: string }, @Body() payload: CreatePostDto) {
    const profile = await this.usersService.getById(user.userId);
    const post = await this.postsService.create(
      { userId: user.userId, displayName: profile?.displayName, photoURL: profile?.photoURL },
      payload,
    );
    const followerIds = (profile?.followers ?? []).filter((id) => id !== user.userId);
    if (followerIds.length > 0) {
      await Promise.all(
        followerIds.map((recipientId) =>
          this.notificationsService.create(
            recipientId,
            user.userId,
            profile?.displayName ?? 'Developer',
            'post',
            post._id?.toString?.() ?? post.id,
          ),
        ),
      );
    }
    return post;
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
    @Body() payload: UpdatePostDto,
  ) {
    return this.postsService.update(id, user.userId, payload);
  }

  @Post(':id/like')
  toggleLike(@Param('id') id: string, @CurrentUser() user: { userId: string }) {
    return this.postsService.toggleLike(id, user.userId);
  }

  @Post(':id/repost')
  async toggleRepost(@Param('id') id: string, @CurrentUser() user: { userId: string }) {
    const profile = await this.usersService.getById(user.userId);
    const result = await this.postsService.toggleRepost(id, {
      userId: user.userId,
      displayName: profile?.displayName,
    });
    if (result.reposted && result.authorId && result.authorId !== user.userId) {
      await this.notificationsService.create(
        result.authorId,
        user.userId,
        profile?.displayName ?? 'Developer',
        'repost',
        id,
      );
    }
    return { reposted: result.reposted };
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: { userId: string }) {
    return this.postsService.deletePost(id, user.userId);
  }
}
