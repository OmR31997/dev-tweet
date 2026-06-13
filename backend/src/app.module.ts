import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { MessagesModule } from './messages/messages.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UploadsModule } from './uploads/uploads.module';
import { WsModule } from './ws/ws.module';
import { EmailModule } from './email/email.module';
import { EventsModule } from './events/events.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI', 'mongodb://127.0.0.1:27017/devtweethub'),
      }),
    }),
    EventsModule,
    AuthModule,
    UsersModule,
    PostsModule,
    MessagesModule,
    CommentsModule,
    NotificationsModule,
    UploadsModule,
    WsModule,
    EmailModule,
  ],
})
export class AppModule {}
