import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createHash, randomBytes } from 'crypto';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Notification, NotificationDocument } from '../notifications/schemas/notification.schema';
import {
  dailyDigestTemplate,
  forgotPasswordTemplate,
  newFollowerTemplate,
  passwordChangedTemplate,
  welcomeTemplate,
} from './templates/messages';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly brandName = 'DevTweetHub';

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Notification.name) private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  private getAppUrl(): string {
    const clientOrigin = this.configService.get<string>('CLIENT_ORIGIN', 'http://localhost:3000');
    return clientOrigin.split(',')[0]?.trim() || 'http://localhost:3000';
  }

  async sendWelcomeEmail(email: string, displayName: string) {
    return this.sendEmail(
      email,
      `Welcome to ${this.brandName}`,
      welcomeTemplate(displayName, this.getAppUrl()),
    );
  }

  async sendForgotPasswordEmail(email: string, displayName: string, rawToken: string) {
    const resetBaseUrl = this.configService.get<string>('PASSWORD_RESET_URL', 'http://localhost:3000/reset-password');
    const resetUrl = `${resetBaseUrl}?token=${encodeURIComponent(rawToken)}`;
    return this.sendEmail(
      email,
      'Reset your DevTweetHub password',
      forgotPasswordTemplate(displayName, resetUrl),
    );
  }

  async sendPasswordChangedEmail(email: string, displayName: string) {
    return this.sendEmail(
      email,
      'Your DevTweetHub password was changed',
      passwordChangedTemplate(displayName, this.getAppUrl()),
    );
  }

  async sendNewFollowerEmail(
    email: string,
    displayName: string,
    followerName: string,
    followerId?: string,
  ) {
    const profileUrl = followerId
      ? `${this.getAppUrl().replace(/\/$/, '')}/profile/${followerId}`
      : `${this.getAppUrl().replace(/\/$/, '')}/notifications`;

    return this.sendEmail(
      email,
      `${followerName} started following you`,
      newFollowerTemplate(displayName, followerName, profileUrl),
    );
  }

  createPasswordResetToken() {
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    return { rawToken, tokenHash };
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendDailyDigests() {
    const users = await this.userModel
      .find({ dailyDigestEnabled: true, emailNotificationsEnabled: true })
      .select('email displayName')
      .lean();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    for (const user of users) {
      const [newFollowers, newLikes, unread] = await Promise.all([
        this.notificationModel.countDocuments({
          recipientId: user._id.toString(),
          type: 'follow',
          createdAt: { $gte: since },
        }),
        this.notificationModel.countDocuments({
          recipientId: user._id.toString(),
          type: 'like',
          createdAt: { $gte: since },
        }),
        this.notificationModel.countDocuments({
          recipientId: user._id.toString(),
          read: false,
        }),
      ]);
      const summary = {
        newFollowers,
        newLikes,
        unread,
      };
      await this.sendEmail(
        user.email,
        `Your daily ${this.brandName} digest`,
        dailyDigestTemplate(user.displayName, summary, this.getAppUrl()),
      );
    }
  }

  private async sendEmail(to: string, subject: string, html: string) {
    const apiKey = this.configService.get<string>('BRAVO_MCP_API_KEY');
    const apiUrl = this.configService.get<string>('BRAVO_MCP_API_URL', 'https://api.brevo.com/v3/smtp/email');
    const from = this.configService.get<string>('EMAIL_FROM', 'no-reply@devtweethub.com');
    const senderName = this.configService.get<string>('EMAIL_FROM_NAME', this.brandName);

    if (!apiKey) {
      this.logger.warn(`BRAVO_MCP_API_KEY missing. Skipping email "${subject}" to ${to}`);
      return { ok: false, reason: 'missing_api_key' };
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify({
          sender: { email: from, name: senderName },
          to: [{ email: to }],
          subject,
          htmlContent: html,
        }),
      });
      if (!response.ok) {
        const text = await response.text();
        this.logger.error(`Email send failed (${response.status}) to ${to}: ${text}`);
        return { ok: false, status: response.status, body: text };
      }
      this.logger.log(`Email sent: "${subject}" → ${to}`);
      return { ok: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Email provider unreachable. Skipping email "${subject}" to ${to}: ${message}`);
      return { ok: false, reason: 'provider_unreachable' };
    }
  }
}
