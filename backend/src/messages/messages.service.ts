import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { SendMessageDto } from './dto/send-message.dto';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RealtimeService } from '../events/realtime.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private readonly messageModel: Model<MessageDocument>,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
    private readonly realtime: RealtimeService,
  ) {}

  /**
   * Persist a message and fan it out over realtime. Single source of truth for
   * both the REST controller and the socket gateway, so ticks stay consistent.
   */
  async send(senderId: string, payload: SendMessageDto) {
    const recipientOnline = this.realtime.isUserOnline(payload.recipientId);
    const message = await this.messageModel.create({
      senderId,
      recipientId: payload.recipientId,
      content: payload.content,
      delivered: recipientOnline,
      read: false,
    });

    const sender = await this.usersService.getById(senderId);
    await this.notificationsService.create(
      payload.recipientId,
      senderId,
      sender?.displayName ?? 'Developer',
      'message',
    );

    const plain = message.toObject();
    // Deliver to both ends — sender gets the saved doc (replaces optimistic one).
    this.realtime.emitToUser(payload.recipientId, 'dm.received', plain);
    this.realtime.emitToUser(senderId, 'dm.received', plain);
    this.realtime.emitToUser(payload.recipientId, 'notification.created');

    return message;
  }

  /** Mark a message delivered (recipient's socket received it) + notify sender. */
  async markDelivered(messageId: string, recipientId: string) {
    const result = await this.messageModel.updateOne(
      { _id: messageId, recipientId, delivered: { $ne: true } },
      { $set: { delivered: true } },
    );
    if (result.modifiedCount) {
      const message = await this.messageModel.findById(messageId).lean();
      if (message) {
        this.realtime.emitToUser(message.senderId, 'message.delivered', {
          messageId,
        });
      }
    }
    return { ok: true };
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
    this.realtime.emitToUser(otherUserId, 'conversation.cleared', { userId });
    return { ok: true, deletedCount: result.deletedCount ?? 0 };
  }

  async deleteMessage(userId: string, messageId: string) {
    const message = await this.messageModel.findById(messageId).lean();
    const result = await this.messageModel.deleteOne({
      _id: messageId,
      $or: [{ senderId: userId }, { recipientId: userId }],
    });
    if (result.deletedCount && message) {
      const otherId =
        message.senderId === userId ? message.recipientId : message.senderId;
      this.realtime.emitToUser(otherId, 'message.deleted', { messageId });
    }
    return { ok: true, deletedCount: result.deletedCount ?? 0 };
  }

  async unreadCount(userId: string) {
    const count = await this.messageModel.countDocuments({
      recipientId: userId,
      read: { $ne: true },
    });
    return { count };
  }

  /** Mark all messages from `otherUserId` → me as read, and notify the sender. */
  async markConversationRead(userId: string, otherUserId: string) {
    const result = await this.messageModel.updateMany(
      {
        senderId: otherUserId,
        recipientId: userId,
        read: { $ne: true },
      },
      { $set: { read: true, delivered: true } },
    );
    if (result.modifiedCount) {
      this.realtime.emitToUser(otherUserId, 'messages.read', { readerId: userId });
    }
    return { ok: true, updatedCount: result.modifiedCount ?? 0 };
  }
}
