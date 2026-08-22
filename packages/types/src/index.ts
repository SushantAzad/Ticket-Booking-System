// Enums
export enum Role {
  CUSTOMER = 'CUSTOMER',
  ORGANISER = 'ORGANISER',
  ADMIN = 'ADMIN',
}

export enum EventType {
  MOVIE = 'MOVIE',
  CONCERT = 'CONCERT',
  LIVE_EVENT = 'LIVE_EVENT',
}

export enum SeatCategoryName {
  STANDARD = 'STANDARD',
  PREMIUM = 'PREMIUM',
  VIP = 'VIP',
}

export enum ShowStatus {
  SCHEDULED = 'SCHEDULED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum ShowSeatStatus {
  AVAILABLE = 'AVAILABLE',
  HELD = 'HELD',
  BOOKED = 'BOOKED',
  OFFERED = 'OFFERED',
}

export enum HoldStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
  RELEASED = 'RELEASED',
}

export enum BookingStatus {
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export enum WaitlistStatus {
  WAITING = 'WAITING',
  OFFERED = 'OFFERED',
  ACCEPTED = 'ACCEPTED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export enum WaitlistOfferStatus {
  ACTIVE = 'ACTIVE',
  ACCEPTED = 'ACCEPTED',
  EXPIRED = 'EXPIRED',
}

// Socket.IO event names
export const SOCKET_EVENTS = {
  SEAT_STATUS_CHANGED: 'seat.status.changed',
  HOLD_EXPIRED: 'hold.expired',
  OFFER_CREATED: 'offer.created',
  JOIN_SHOW: 'join_show',
  LEAVE_SHOW: 'leave_show',
} as const;

// Shared interfaces
export interface SeatStatusPayload {
  showId: string;
  seatId: string;
  status: ShowSeatStatus;
  holdId?: string | null;
}

export interface HoldExpiredPayload {
  showId: string;
  holdId: string;
  seatIds: string[];
}

export interface OfferCreatedPayload {
  showId: string;
  userId: string;
  offerId: string;
  expiresAt: string;
}
