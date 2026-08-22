import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ShowSeatStatus } from '@prisma/client';
export declare class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private server;
    private readonly logger;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinShow(client: Socket, data: {
        showId: string;
    }): {
        joined: string;
    };
    handleLeaveShow(client: Socket, data: {
        showId: string;
    }): {
        left: string;
    };
    broadcastSeatStatus(showId: string, seatId: string, status: ShowSeatStatus | string, holdId: string | null): void;
    broadcastHoldExpired(showId: string, holdId: string, seatIds: string[]): void;
    broadcastOfferCreated(showId: string, userId: string, offerId: string, expiresAt: Date): void;
}
