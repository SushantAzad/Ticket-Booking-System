import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ShowSeatStatus } from '@prisma/client';

/**
 * RealtimeGateway
 *
 * Socket.IO gateway with room-based broadcasting scoped to show:{showId}.
 *
 * Clients join a room on connect, and receive events:
 *   - seat.status.changed  — when any seat's status changes (hold, release, book)
 *   - hold.expired         — when a hold's TTL fires
 *   - offer.created        — when a waitlist offer is created for a user
 */
@WebSocketGateway({
  cors: {
    origin: '*', // tightened via ConfigService in production
    credentials: true,
  },
  namespace: '/realtime',
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_show')
  handleJoinShow(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { showId: string },
  ) {
    client.join(`show:${data.showId}`);
    this.logger.debug(`Client ${client.id} joined show:${data.showId}`);
    return { joined: `show:${data.showId}` };
  }

  @SubscribeMessage('leave_show')
  handleLeaveShow(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { showId: string },
  ) {
    client.leave(`show:${data.showId}`);
    return { left: `show:${data.showId}` };
  }

  // ── Broadcast helpers (called by services) ──────────────────────────────

  broadcastSeatStatus(
    showId: string,
    seatId: string,
    status: ShowSeatStatus | string,
    holdId: string | null,
  ) {
    this.server.to(`show:${showId}`).emit('seat.status.changed', {
      showId,
      seatId,
      status,
      holdId,
      timestamp: new Date().toISOString(),
    });
  }

  broadcastHoldExpired(showId: string, holdId: string, seatIds: string[]) {
    this.server.to(`show:${showId}`).emit('hold.expired', {
      showId,
      holdId,
      seatIds,
      timestamp: new Date().toISOString(),
    });
  }

  broadcastOfferCreated(
    showId: string,
    userId: string,
    offerId: string,
    expiresAt: Date,
  ) {
    // Targeted: emitted to the show room but includes userId so clients can
    // filter for their own user
    this.server.to(`show:${showId}`).emit('offer.created', {
      showId,
      userId,
      offerId,
      expiresAt: expiresAt.toISOString(),
      timestamp: new Date().toISOString(),
    });
  }
}
