import { PrismaService } from '../prisma/prisma.service';
import { SeatHoldsRepository } from '../seat-holds/seat-holds.repository';
import { NotificationsService } from '../notifications/notifications.service';
import { WaitlistService } from '../waitlist/waitlist.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { CreateBookingDto } from './dto/booking.dto';
import { User } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
export declare class BookingsService {
    private readonly prisma;
    private readonly holdRepository;
    private readonly notificationsService;
    private readonly waitlistService;
    private readonly realtimeGateway;
    private readonly logger;
    constructor(prisma: PrismaService, holdRepository: SeatHoldsRepository, notificationsService: NotificationsService, waitlistService: WaitlistService, realtimeGateway: RealtimeGateway);
    confirmBooking(dto: CreateBookingDto, user: User): Promise<{
        show: {
            venue: {
                id: string;
                name: string;
                createdAt: Date;
                address: string;
                city: string;
                createdById: string;
            };
            event: {
                id: string;
                createdAt: Date;
                title: string;
                description: string;
                type: import(".prisma/client").$Enums.EventType;
                genre: string;
                posterUrl: string | null;
                organiserId: string;
            };
        } & {
            id: string;
            venueId: string;
            eventId: string;
            startTime: Date;
            endTime: Date;
            status: import(".prisma/client").$Enums.ShowStatus;
        };
        bookingSeats: ({
            showSeat: {
                category: {
                    id: string;
                    name: import(".prisma/client").$Enums.SeatCategoryName;
                    venueId: string;
                    colorCode: string;
                };
                venueSeat: {
                    number: number;
                    id: string;
                    venueId: string;
                    categoryId: string;
                    row: string;
                    label: string;
                };
            } & {
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
            bookingId: string;
            showSeatId: string;
            priceAtBooking: Decimal;
        })[];
    } & {
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.BookingStatus;
        showId: string;
        userId: string;
        bookingReference: string;
        totalAmount: Decimal;
    }>;
    cancelBooking(bookingId: string, user: User): Promise<{
        cancelled: boolean;
        bookingId: string;
    }>;
    getBooking(bookingId: string, user: User): Promise<{
        show: {
            venue: {
                id: string;
                name: string;
                createdAt: Date;
                address: string;
                city: string;
                createdById: string;
            };
            event: {
                id: string;
                createdAt: Date;
                title: string;
                description: string;
                type: import(".prisma/client").$Enums.EventType;
                genre: string;
                posterUrl: string | null;
                organiserId: string;
            };
        } & {
            id: string;
            venueId: string;
            eventId: string;
            startTime: Date;
            endTime: Date;
            status: import(".prisma/client").$Enums.ShowStatus;
        };
        bookingSeats: ({
            ticket: {
                id: string;
                showSeatId: string;
                bookingSeatId: string;
                qrToken: string;
                issuedAt: Date;
            } | null;
            showSeat: {
                category: {
                    id: string;
                    name: import(".prisma/client").$Enums.SeatCategoryName;
                    venueId: string;
                    colorCode: string;
                };
                venueSeat: {
                    number: number;
                    id: string;
                    venueId: string;
                    categoryId: string;
                    row: string;
                    label: string;
                };
            } & {
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
            bookingId: string;
            showSeatId: string;
            priceAtBooking: Decimal;
        })[];
    } & {
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.BookingStatus;
        showId: string;
        userId: string;
        bookingReference: string;
        totalAmount: Decimal;
    }>;
    getMyBookings(user: User, page?: number, limit?: number): Promise<{
        bookings: ({
            show: {
                venue: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    address: string;
                    city: string;
                    createdById: string;
                };
                event: {
                    id: string;
                    createdAt: Date;
                    title: string;
                    description: string;
                    type: import(".prisma/client").$Enums.EventType;
                    genre: string;
                    posterUrl: string | null;
                    organiserId: string;
                };
            } & {
                id: string;
                venueId: string;
                eventId: string;
                startTime: Date;
                endTime: Date;
                status: import(".prisma/client").$Enums.ShowStatus;
            };
            _count: {
                bookingSeats: number;
            };
        } & {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.BookingStatus;
            showId: string;
            userId: string;
            bookingReference: string;
            totalAmount: Decimal;
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
}
