import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/booking.dto';
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    confirm(dto: CreateBookingDto, user: any): Promise<{
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
            priceAtBooking: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.BookingStatus;
        showId: string;
        userId: string;
        bookingReference: string;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
    }>;
    getMyBookings(user: any, page?: number, limit?: number): Promise<{
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
            totalAmount: import("@prisma/client/runtime/library").Decimal;
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    getBooking(id: string, user: any): Promise<{
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
            priceAtBooking: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.BookingStatus;
        showId: string;
        userId: string;
        bookingReference: string;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
    }>;
    cancelBooking(id: string, user: any): Promise<{
        cancelled: boolean;
        bookingId: string;
    }>;
}
