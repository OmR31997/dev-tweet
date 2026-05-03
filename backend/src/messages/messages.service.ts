import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { SendMessageDto } from './dto/send-message.dto';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private readonly messageModel: Model<MessageDocument>,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async send(senderId: string, payload: SendMessageDto) {
    const message = await this.messageModel.create({
      senderId,
      recipientId: payload.recipientId,
      content: payload.content,
      read: false,
    });
    const sender = await this.usersService.getById(senderId);
    await this.notificationsService.create(
      payload.recipientId,
      senderId,
      sender?.displayName ?? 'Developer',
      'message',
    );
    return message;
  }

  async conversation(userId: string, otherUserId: string) {
    return this.messageModel
      .find({
        $or: [
          { senderId: userId, recipientId: otherUserId },
          { senderId: otherUserId, recipientId: userId },
        ],
      })
      .sort({ createdAt: 1 })
      .lean();
  }

  async clearConversation(userId: string, otherUserId: string) {
    const result = await this.messageModel.deleteMany({
      $or: [
        { senderId: userId, recipientId: otherUserId },
        { senderId: otherUserId, recipientId: userId },
      ],
    });
    return { ok: true, deletedCount: result.deletedCount ?? 0 };
  }

  async deleteMessage(userId: string, messageId: string) {
    const result = await this.messageModel.deleteOne({
      _id: messageId,
      $or: [{ senderId: userId }, { recipientId: userId }],
    });
    return { ok: true, deletedCount: result.deletedCount ?? 0 };
  }

  async unreadCount(userId: string) {
    const count = await this.messageModel.countDocuments({
      recipientId: userId,
      read: { $ne: true },
    });
    return { count };
  }

  async markConversationRead(userId: string, otherUserId: string) {
    const result = await this.messageModel.updateMany(
      {
        senderId: otherUserId,
        recipientId: userId,
        read: { $ne: true },
      },
      { $set: { read: true } },
    );
    return { ok: true, updatedCount: result.modifiedCount ?? 0 };
  }
}
