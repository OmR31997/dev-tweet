import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MessagesService } from './messages.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  send(@CurrentUser() user: { userId: string }, @Body() payload: SendMessageDto) {
    return this.messagesService.send(user.userId, payload);
  }

  @Delete(':otherUserId/clear')
  clearConversation(
    @CurrentUser() user: { userId: string },
    @Param('otherUserId') otherUserId: string,
  ) {
    return this.messagesService.clearConversation(user.userId, otherUserId);
  }

  @Delete('item/:id')
  deleteMessage(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.messagesService.deleteMessage(user.userId, id);
  }

  @Get('unread/count')
  unreadCount(@CurrentUser() user: { userId: string }) {
    return this.messagesService.unreadCount(user.userId);
  }

  @Post(':otherUserId/read')
  markConversationRead(
    @CurrentUser() user: { userId: string },
    @Param('otherUserId') otherUserId: string,
  ) {
    return this.messagesService.markConversationRead(user.userId, otherUserId);
  }

  @Get(':otherUserId')
  conversation(
    @CurrentUser() user: { userId: string },
    @Param('otherUserId') otherUserId: string,
  ) {
    return this.messagesService.conversation(user.userId, otherUserId);
  }
}
