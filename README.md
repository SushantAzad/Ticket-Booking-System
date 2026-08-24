# Ticket Booking System

A NestJS, Next.js, PostgreSQL, and Redis ticketing platform for movies and live events. Customers can browse events, select seats visually, hold seats temporarily, confirm bookings, receive QR tickets by email, and join category-specific waitlists.

## Requirements

- Node.js 20+
- Docker Desktop
- npm

## Run Locally

```bash
npm install
docker compose up -d
npm run db:push
npm run db:seed
npm run dev
```

The web app runs at `http://localhost:3001`. The API runs at `http://localhost:3000`, with Swagger documentation at `http://localhost:3000/api/docs`.

To stop infrastructure:

```bash
docker compose down
```

Run API tests with `npm test`. Run the concurrency checks with `npm run test:concurrency`.

## Configuration

Copy `apps/api/.env.example` to `apps/api/.env`. The important settings are:

```env
SEAT_HOLD_TTL_MINUTES=10
RESEND_API_KEY=mock-key
RESEND_FROM_EMAIL="Ticket Booking System <noreply@your-verified-domain.com>"
QR_SECRET=replace-with-a-long-random-secret
FRONTEND_URL=http://localhost:3001
```

`mock-key` disables external delivery and logs simulated email sends. For real email, create a Resend account, verify a sender domain or address, and set `RESEND_API_KEY` plus `RESEND_FROM_EMAIL` to matching values. Never commit real API keys or production secrets.

## QR Ticket and Email Service

When `POST /api/v1/bookings` confirms an active hold, the API performs these steps:

1. Atomically changes the hold from `ACTIVE` to `COMPLETED` if its expiry has not passed.
2. Creates the booking, booking-seat rows, and one `Ticket` row per seat in a database transaction.
3. Builds a signed QR token from booking and seat data using `QR_SECRET` and HMAC-SHA256. The token is stored in the `Ticket` row.
4. Generates a 300px PNG using the `qrcode` package.
5. Sends a confirmation email through Resend with the PNG attached. Email failure is logged and does not undo a confirmed booking.

The verification endpoint is `GET /api/v1/tickets/{ticketId}/verify`. It returns the ticket validity, booking reference, seat label, category, and issue time. A valid ticket must belong to a confirmed booking.

### Manual QR and email test

1. Start the database, Redis, API, and web app.
2. Sign in using a seeded customer account, then select seats.
3. Click **Hold seats** and confirm that an active hold appears on the dashboard.
4. Click **Confirm booking**. The API response includes booking seats and their ticket records.
5. With `RESEND_API_KEY=mock-key`, inspect the API log for `Mock Email` and the booking reference.
6. For real delivery, set a valid Resend key and verified sender, restart the API, confirm another booking, and inspect the inbox for `ticket-{bookingReference}.png`.
7. Copy a returned `ticket.id` and request `/api/v1/tickets/{ticketId}/verify` in Swagger or an authenticated API client. The response should contain `valid: true`.

To test waitlist email delivery, fill all seats in one category, join the waitlist, cancel a confirmed booking, and inspect the mock log or recipient inbox. The email contains a category offer and a time-limited `waitlistOfferId` checkout link. The scheduled worker reassigns an offer after its 30-minute expiry.

## System Design Write-up

### Seat holds and TTL

Each show has its own `ShowSeat` rows, copied from the venue layout. A row stores the category, price relationship, current status, hold ID, booking ID, and optimistic-lock version. A customer requests one or more show-seat IDs. The hold repository creates the `SeatHold` and locks each requested seat inside a PostgreSQL transaction. Only `AVAILABLE` seats can transition to `HELD`. The hold stores `expiresAt`, normally ten minutes in the future, and each seat receives a `SeatHoldItem` row. A unique constraint on `showSeatId` prevents a seat from belonging to two holds.

Expiry is enforced twice. A delayed BullMQ job is scheduled for every hold, and a Nest scheduler sweeps expired active holds every 30 seconds as a recovery mechanism. Expiry first conditionally changes the hold to `EXPIRED`, then releases only seats still marked `HELD` with that hold ID, and broadcasts availability through Socket.IO. The conditional update makes expiry idempotent.

### Concurrency prevention

The hold transaction uses `SELECT ... FOR UPDATE` row locks and serializable isolation. Concurrent requests for the same seat serialize at the database row. The repository checks status, conditionally updates the seat with its expected version, and inserts the hold-item row. A conflict rolls back the complete multi-seat request, so partial holds cannot remain.

Confirmation uses the same race-safe principle. It conditionally changes the hold from `ACTIVE` to `COMPLETED` only when `expiresAt > now()`. The expiry worker performs a competing conditional update. Exactly one operation can win. The booking transaction then creates the booking, booking seats, ticket rows, and changes all held seats to `BOOKED`. If any step fails, the transaction rolls back.

### Waitlist auto-assignment

Waitlist entries are scoped to a show and seat category and receive FIFO positions. When a booking is cancelled, each released seat is checked against the earliest `WAITING` entry for that category. If one exists, the seat changes to `OFFERED`, the entry changes to `OFFERED`, and a `WaitlistOffer` is created. The recipient receives an email and a real-time offer event. If nobody is waiting, the seat immediately becomes `AVAILABLE` and the change is broadcast.

### Time-limited offers

An offer is active for 30 minutes and stores its own expiry timestamp. A scheduled job runs every minute and finds active offers whose expiry has passed. The service marks the offer and entry as expired transactionally, then offers the same seat to the next waiting entry or returns it to `AVAILABLE`. Reassignment is therefore FIFO and recoverable after process interruptions. The offer ID is included in the email link so the frontend can identify the exact seat opportunity; authentication and final booking confirmation remain required before the seat becomes booked.

## Main API Areas

- `auth`: registration, login, refresh, and current user
- `events` and `shows`: discovery and organiser management
- `shows/{showId}/seats`: visual seat-map data
- `shows/{showId}/holds`: create, inspect, and release holds
- `bookings`: confirm, list, inspect, and cancel bookings
- `waitlist`: join, leave, and inspect waitlist entries
- `tickets/{ticketId}/verify`: QR ticket verification
- `ai/event-search`: grounded natural-language event and seat discovery

