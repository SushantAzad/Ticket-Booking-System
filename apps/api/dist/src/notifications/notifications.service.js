"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const resend_1 = require("resend");
const QRCode = __importStar(require("qrcode"));
const crypto = __importStar(require("crypto"));
let NotificationsService = NotificationsService_1 = class NotificationsService {
    configService;
    logger = new common_1.Logger(NotificationsService_1.name);
    resend;
    enabled;
    constructor(configService) {
        this.configService = configService;
        const apiKey = this.configService.get('RESEND_API_KEY');
        this.enabled = !!apiKey && apiKey !== 'mock-key';
        if (this.enabled) {
            this.resend = new resend_1.Resend(apiKey);
        }
    }
    async sendBookingConfirmation(booking, user) {
        try {
            const qrSecret = this.configService.get('QR_SECRET', 'secret');
            const payload = `${booking.id}:${booking.userId}:${booking.bookingReference}`;
            const signature = crypto.createHmac('sha256', qrSecret).update(payload).digest('hex');
            const qrToken = `${payload}:${signature}`;
            const qrBuffer = await QRCode.toBuffer(qrToken, { type: 'png', width: 300 });
            if (!this.enabled) {
                this.logger.debug(`[Mock Email] Booking confirmation sent to ${user.email} for ${booking.bookingReference}`);
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
        }
        catch (error) {
            this.logger.error(`Failed to send booking confirmation to ${user.email}: ${error.message}`);
            return { success: false };
        }
    }
    async sendWaitlistOffer(email, name, showName, expiresAt) {
        if (!this.enabled) {
            this.logger.debug(`[Mock Email] Waitlist offer sent to ${email} for ${showName}`);
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
        }
        catch (error) {
            this.logger.error(`Failed to send waitlist offer to ${email}: ${error.message}`);
            return { success: false };
        }
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map