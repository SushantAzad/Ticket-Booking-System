import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SeatHoldsRepository } from './seat-holds.repository';
import { CreateHoldDto } from './dto/seat-hold.dto';
import { User } from '@prisma/client';
import { RealtimeGateway } from '../realtime/realtime.gateway';
export declare const SEAT_HOLD_QUEUE = "seat-hold-expiry";
export declare class SeatHoldsService {
    private readonly prisma;
    private readonly repository;
    private readonly configService;
    private readonly holdQueue;
    private readonly realtimeGateway;
    private readonly logger;
    private readonly holdTtlMinutes;
    constructor(prisma: PrismaService, repository: SeatHoldsRepository, configService: ConfigService, holdQueue: Queue, realtimeGateway: RealtimeGateway);
    createHold(showId: string, dto: CreateHoldDto, user: User): Promise<({
        items: ({
            showSeat: {
                id: string;
                categoryId: string;
                status: import(".prisma/client").$Enums.ShowSeatStatus;
                showId: string;
                venueSeatId: string;
                holdId: string | null;
                bookingId: string | null;
                version: number;
            };
        } & {
            id: string;
            holdId: string;
            showSeatId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.HoldStatus;
        showId: string;
        userId: string;
        expiresAt: Date;
        releasedAt: Date | null;
        bookedAt: Date | null;
    }) | null>;
    releaseHold(holdId: string, showId: string, user: User): Promise<{
        released: boolean;
        holdId: string;
    }>;
    getHold(holdId: string, user: User): Promise<{
        items: ({
            showSeat: {
                id: string;
                categoryId: string;
                status: import(".prisma/client").$Enums.ShowSeatStatus;
                showId: string;
                venueSeatId: string;
                holdId: string | null;
                bookingId: string | null;
                version: number;
            };
        } & {
            id: string;
            holdId: string;
            showSeatId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.HoldStatus;
        showId: string;
        userId: string;
        expiresAt: Date;
        releasedAt: Date | null;
        bookedAt: Date | null;
    }>;
}
