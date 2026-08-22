import { ConfigService } from '@nestjs/config';
import { Booking, User } from '@prisma/client';
export declare class NotificationsService {
    private readonly configService;
    private readonly logger;
    private resend;
    private readonly enabled;
    constructor(configService: ConfigService);
    sendBookingConfirmation(booking: Booking, user: User): Promise<{
        success: boolean;
        mocked: boolean;
    } | {
        success: boolean;
        mocked?: undefined;
    }>;
    sendWaitlistOffer(email: string, name: string, showName: string, expiresAt: Date): Promise<{
        success: boolean;
        mocked: boolean;
    } | {
        success: boolean;
        mocked?: undefined;
    }>;
}
