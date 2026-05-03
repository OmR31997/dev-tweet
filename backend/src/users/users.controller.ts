import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: { userId: string }) {
    return this.usersService.getProfile(user.userId);
  }

  @Get()
  list(
    @CurrentUser() user: { userId: string },
    @Query('q') q?: string,
    @Query('limit') limitRaw?: string,
  ) {
    if (typeof q === 'string' && q.trim().length > 0) {
      const limit = Number.parseInt(limitRaw ?? '10', 10);
      return this.usersService.searchUsers(user.userId, q, Number.isNaN(limit) ? 10 : limit);
    }
    return this.usersService.listUsers(user.userId);
  }

  @Get(':id')
  byId(@Param('id') id: string) {
    return this.usersService.getById(id);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: { userId: string }, @Body() payload: UpdateProfileDto) {
    return this.usersService.updateProfile(user.userId, payload);
  }

  @Post(':id/follow')
  followToggle(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.usersService.toggleFollow(user.userId, id);
  }
}
