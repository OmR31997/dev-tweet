import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly emailService: EmailService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getProfile(userId: string) {
    return this.userModel.findById(userId).select('-password -refreshTokenHash').lean();
  }

  async getById(userId: string) {
    return this.userModel.findById(userId).select('-password -refreshTokenHash').lean();
  }

  async listUsers(excludeId?: string) {
    const query = excludeId ? { _id: { $ne: excludeId } } : {};
    return this.userModel.find(query).select('-password -refreshTokenHash').limit(50).lean();
  }

  async searchUsers(excludeId: string | undefined, rawQuery: string, limit = 10) {
    const q = this.normalizeSearchQuery(rawQuery);
    if (!q) return [];
    const safeLimit = Math.max(1, Math.min(limit, 25));
    const regex = new RegExp(this.escapeRegex(q), 'i');
    const baseFilter: Record<string, unknown> = {
      $or: [{ displayName: regex }, { email: regex }, { branch: regex }, { college: regex }],
    };
    if (excludeId) baseFilter._id = { $ne: excludeId };
    return this.userModel
      .find(baseFilter)
      .select('-password -refreshTokenHash')
      .limit(safeLimit)
      .lean();
  }

  async updateProfile(userId: string, payload: UpdateProfileDto) {
    await this.userModel.updateOne({ _id: userId }, { $set: payload });
    return this.getById(userId);
  }

  async toggleFollow(currentUserId: string, targetUserId: string) {
    const me = await this.userModel.findById(currentUserId).lean();
    if (!me) return { following: false };
    const targetUser = await this.userModel.findById(targetUserId).lean();
    if (!targetUser) return { following: false };
    const already = me.following?.includes(targetUserId);
    if (already) {
      await this.userModel.updateOne(
        { _id: currentUserId },
        { $pull: { following: targetUserId } },
      );
      await this.userModel.updateOne(
        { _id: targetUserId },
        { $pull: { followers: currentUserId } },
      );
      await this.notificationsService.create(
        targetUserId,
        currentUserId,
        me.displayName,
        'unfollow',
      );
      return { following: false };
    }
    const isFollowBack = targetUser.following?.includes(currentUserId);
    await this.userModel.updateOne({ _id: currentUserId }, { $addToSet: { following: targetUserId } });
    await this.userModel.updateOne({ _id: targetUserId }, { $addToSet: { followers: currentUserId } });
    await this.notificationsService.create(
      targetUserId,
      currentUserId,
      me.displayName,
      isFollowBack ? 'follow_accept' : 'follow',
    );
    if (targetUser.emailNotificationsEnabled) {
      await this.emailService.sendNewFollowerEmail(
        targetUser.email,
        targetUser.displayName,
        me.displayName,
      );
    }
    return { following: true };
  }

  private normalizeSearchQuery(raw: string) {
    return raw.trim().replace(/\s+/g, ' ').slice(0, 80);
  }

  private escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
