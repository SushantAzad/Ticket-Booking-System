import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Booking, User } from '@prisma/client';
import { Resend } from 'resend';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private resend: Resend;
  private readonly enabled: boolean;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.enabled = !!apiKey && apiKey !== 'mock-key';
    if (this.enabled) {
      this.resend = new Resend(apiKey);
    }
  }

  async sendBookingConfirmation(booking: Booking, user: User) {
    try {
      // Generate QR Token (signed)
      const qrSecret = this.configService.get<string>('QR_SECRET', 'secret');
      const payload = `${booking.id}:${booking.userId}:${booking.bookingReference}`;
      const signature = crypto
        .createHmac('sha256', qrSecret)
        .update(payload)
        .digest('hex');
      const qrToken = `${payload}:${signature}`;

      // Generate QR Image Buffer
      const qrBuffer = await QRCode.toBuffer(qrToken, {
        type: 'png',
        width: 300,
      });

      if (!this.enabled) {
        this.logger.debug(
          `[Mock Email] Booking confirmation sent to ${user.email} for ${booking.bookingReference}`,
        );
        return { success: true, mocked: true };
      }

      await this.resend.emails.send({
        from: 'Ticket Booking System <noreply@tbs.example.com>',
        to: user.email,
        subject: `Booking Confirmed: ${booking.bookingReference}`,
        html: `
          <h1>Your booking is confirmed!</h1>
          <p>Hi ${user.name},</p>
          <p>Your booking reference is <strong>${booking.bookingReference}</strong>.</p>
          <p>Total Amount: ₹${booking.totalAmount}</p>
          <p>Please find your ticket QR code attached.</p>
        `,
        attachments: [
          {
            filename: `ticket-${booking.bookingReference}.png`,
            content: qrBuffer.toString('base64'),
          },
        ],
      });

      this.logger.log(`Booking confirmation email sent to ${user.email}`);
      return { success: true };
    } catch (error) {
      this.logger.error(
        `Failed to send booking confirmation to ${user.email}: ${error.message}`,
      );
      // Don't throw, we don't want to crash the booking flow if email fails
      return { success: false };
    }
  }

  async sendWaitlistOffer(
    email: string,
    name: string,
    showName: string,
    expiresAt: Date,
  ) {
    if (!this.enabled) {
      this.logger.debug(
        `[Mock Email] Waitlist offer sent to ${email} for ${showName}`,
      );
      return { success: true, mocked: true };
    }

    try {
      await this.resend.emails.send({
        from: 'Ticket Booking System <noreply@tbs.example.com>',
        to: email,
        subject: `Waitlist Offer: Seats available for ${showName}`,
        html: `
          <h1>Great news!</h1>
          <p>Hi ${name},</p>
          <p>Seats just became available for your waitlist request for ${showName}.</p>
          <p>This offer expires at <strong>${expiresAt.toLocaleString()}</strong>.</p>
          <p><a href="http://localhost:3001/checkout">Click here to claim your seats</a></p>
        `,
      });
      return { success: true };
    } catch (error) {
      this.logger.error(
        `Failed to send waitlist offer to ${email}: ${error.message}`,
      );
      return { success: false };
    }
  }
}
