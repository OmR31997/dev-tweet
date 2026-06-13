import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MessagesService } from '../../messages/messages.service';
import { RealtimeService } from '../../events/realtime.service';

function resolveCorsOrigin(): string[] | string {
  const raw = process.env.CLIENT_ORIGIN;
  if (!raw) return ['http://localhost:3000'];
  const list = raw.split(',').map((o) => o.trim()).filter(Boolean);
  return list.length > 0 ? list : ['http://localhost:3000'];
}

@WebSocketGateway({ cors: { origin: resolveCorsOrigin(), credentials: true } })
export class ChatGateway implements OnGatewayConnection, OnGatewayInit {
  @WebSocketServer() server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly messagesService: MessagesService,
    private readonly realtime: RealtimeService,
  ) {}

  afterInit(server: Server) {
    // Expose the socket server to HTTP services for realtime fan-out.
    this.realtime.setServer(server);
  }

  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token as string | undefined;
    if (!token) {
      client.disconnect();
      return;
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET', 'dev-secret'),
      });
      client.data.userId = payload.sub;
      client.join(`user:${payload.sub}`);
    } catch {
      client.disconnect();
    }
  }

  @SubscribeMessage('dm.send')
  async sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { recipientId: string; content: string },
  ) {
    const senderId = client.data.userId as string;
    // send() persists + fans out 'dm.received' to both ends via RealtimeService.
    return this.messagesService.send(senderId, body);
  }

  @SubscribeMessage('dm.delivered')
  async deliveredAck(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { messageId: string },
  ) {
    const recipientId = client.data.userId as string;
    await this.messagesService.markDelivered(body.messageId, recipientId);
  }

  @SubscribeMessage('typing.start')
  typingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { recipientId: string; conversationId?: string },
  ) {
    const senderId = client.data.userId as string;
    this.server.to(`user:${body.recipientId}`).emit('typing.start', {
      senderId,
      conversationId: body.conversationId,
    });
  }

  @SubscribeMessage('typing.stop')
  typingStop(@ConnectedSocket() client: Socket, @MessageBody() body: { recipientId: string }) {
    const senderId = client.data.userId as string;
    this.server.to(`user:${body.recipientId}`).emit('typing.stop', { senderId });
  }
}
