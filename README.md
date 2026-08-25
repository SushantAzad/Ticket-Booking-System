# Ticket Booking System

A full-stack ticketing platform for movies and live events, built with NestJS, Next.js, PostgreSQL, and Redis. Customers browse events, pick seats from a live visual map, hold them for a limited window, confirm bookings, get a QR ticket by email, and join a category-specific waitlist when a show sells out.

**Live app:** https://ticket-booking-system-web-nu.vercel.app/

![TicketFlow home page with the AI concierge search panel](images/1.png)

## Table of Contents

- [Objective](#objective)
- [Screenshots](#screenshots)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Requirements](#requirements)
- [Run Locally](#run-locally)
- [Environment Variables](#environment-variables)
- [Production Hosting](#production-hosting)
- [Database Schema](#database-schema)
- [Main API Areas](#main-api-areas)
- [QR Ticket and Email Service](#qr-ticket-and-email-service)
- [Manual QR and Email Test](#manual-qr-and-email-test)
- [Testing](#testing)
- [System Design Write-up](#system-design-write-up)

## Objective

High-demand events sell out in seconds, and last-minute cancellations usually go to waste because there is no automated way to reassign them. This project solves both problems: customers book seats from a real seat map, seats that are held but never checked out release themselves automatically, sold-out events run a waitlist that reassigns seats the moment someone cancels, and every confirmed booking triggers an email with a scannable QR ticket.

## Screenshots

**Event discovery, with live pricing and city filters**

![Home page hero section](images/2.png)


**Live seat map, color-coded by category and status**

![Events listing page](images/3.png)



## Features

- Role-based auth for customers, organisers, and admins
- Admin creates venues with seat layouts and named seat categories (Premium, Standard, and so on)
- Organisers register, log in, and create movie or event listings with venue, date, time, and per-category pricing
- Customers browse and filter events, and view a real-time seat map (available / held / booked)
- Configurable seat-hold TTL (default 10 minutes); held seats are locked from other customers and release automatically on abandonment
- Concurrency-safe holds and bookings, two customers can never claim the same seat
- Confirmed bookings trigger an email with a QR code ticket that encodes the booking reference
- Waitlist per seat category on sold-out shows, with automatic, time-limited offers on cancellation
- Booking history and self-service cancellation for customers
- Organiser dashboard for booking summary and revenue per event
- An AI concierge (Gemini-grounded search) for natural-language event discovery

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React |
| Backend | NestJS |
| Database | PostgreSQL (Prisma ORM) |
| Cache / Queue | Redis, BullMQ |
| Realtime | Socket.IO |
| Email | Resend |
| QR Codes | `qrcode` package, HMAC-SHA256 signed tokens |
| AI Search | Gemini grounded search |
| API Docs | Swagger / OpenAPI |

## Architecture

```
Vercel (apps/web, Next.js)
        |
        v
public NestJS API (apps/api)
        |-> managed PostgreSQL
        |-> managed Redis (BullMQ workers, hold + waitlist cleanup)
        |-> Resend (transactional email)
        |-> Socket.IO (live seat status)
```

The repository is a monorepo with `apps/web` (Next.js frontend), `apps/api` (NestJS backend), and `packages/types` (shared TypeScript types). The frontend is stateless and deploys to Vercel. The API is a persistent service, it keeps a live Socket.IO connection, runs scheduled cleanup jobs, and processes delayed BullMQ jobs, so it needs a long-running Node host rather than serverless functions.

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

## Environment Variables

Copy `apps/api/.env.example` to `apps/api/.env` and fill in the values below.

```env
# Server
PORT=3000
FRONTEND_URL=http://localhost:3001

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ticket_booking

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Auth
JWT_SECRET=replace-with-a-long-random-secret
JWT_REFRESH_SECRET=replace-with-a-different-long-random-secret

# Seat holds
SEAT_HOLD_TTL_MINUTES=10

# QR tickets
QR_SECRET=replace-with-a-long-random-secret

# Email (Resend)
RESEND_API_KEY=mock-key
RESEND_FROM_EMAIL="Ticket Booking System <noreply@your-verified-domain.com>"

# AI concierge
GEMINI_API_KEY=
GEMINI_MODEL=
```

`RESEND_API_KEY=mock-key` disables external delivery and logs simulated email sends, which is what the seeded demo uses. For real email, create a Resend account, verify a sender domain or address, and set `RESEND_API_KEY` plus `RESEND_FROM_EMAIL` to matching values. Never commit real API keys or production secrets.

The frontend (`apps/web`) reads:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
API_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000/realtime
```

## Production Hosting

Vercel hosts the Next.js frontend only. The API is a persistent NestJS service, it uses Socket.IO for live seat updates, BullMQ workers for hold expiry, and scheduled jobs for hold and waitlist cleanup. Those processes need a persistent container or Node host such as Railway, Render, Fly.io, or an equivalent service. Do not deploy the API, PostgreSQL, or Redis as Vercel serverless functions.

### Deploy the API

1. Provision managed PostgreSQL and Redis. Neon, Supabase, Railway, Render, and Upstash are common options. Use a Redis provider that supports BullMQ and TLS if required.
2. Create a persistent Node service from this repository, using the repository root as its working directory.
3. Set the build command to `npm install && npm run build --workspace=apps/api` and the start command to `npm run start:prod --workspace=apps/api`.
4. Set `PORT` from the host's injected port, `DATABASE_URL` to the managed PostgreSQL connection string, and `REDIS_HOST`, `REDIS_PORT`, and `REDIS_PASSWORD` to the managed Redis values. If the provider only gives a full Redis URL, adapt the BullMQ connection configuration before deploying.
5. Run `npm run db:push --workspace=apps/api` once against the production database, or use a reviewed Prisma migration workflow. Run the seed command only when you intentionally want demo data.
6. Add `JWT_SECRET`, `JWT_REFRESH_SECRET`, `QR_SECRET`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `GEMINI_API_KEY`, `GEMINI_MODEL`, and `FRONTEND_URL=https://<your-vercel-domain>` as secrets.
7. Verify `https://<api-domain>/api/v1/events` and `https://<api-domain>/api/docs` before connecting the frontend.

### Deploy the frontend to Vercel

1. Import the repository into Vercel and select the `apps/web` application. Set the root directory to `apps/web`, or if Vercel installs from the repository root, keep the build command as `npm run build --workspace=apps/web`.
2. Add these environment variables for Production, Preview, and Development:

```env
NEXT_PUBLIC_API_URL=https://<api-domain>/api/v1
API_URL=https://<api-domain>
NEXT_PUBLIC_SOCKET_URL=https://<api-domain>/realtime
```

3. Redeploy after setting variables. `API_URL` controls the Next.js rewrite, `NEXT_PUBLIC_SOCKET_URL` controls the browser's Socket.IO connection. The API must allow the Vercel domain in `FRONTEND_URL` and CORS.

### What happens to Docker?

`docker-compose.yml` is a local development setup for PostgreSQL and Redis. Vercel does not run that file, and its containers disappear after a deployment. In production, replace those two containers with managed PostgreSQL and Redis, or run the Compose services on a VM or container host. The NestJS API can also ship as a Docker image on a host that supports persistent containers, but it should never run as a Vercel serverless function, since the workers, cron jobs, and WebSocket connection all need a continuously running process.

## Database Schema

The schema lives in `apps/api/prisma/schema.prisma` and is managed with Prisma. At a high level:

| Model | Purpose |
|---|---|
| `User` | Customers, organisers, and admins, distinguished by role |
| `Venue` | Physical location, owned by an organiser, holds a seat layout |
| `SeatCategory` | Named pricing tier per venue (Premium, Standard, and so on) |
| `Event` | Movie or live event listing, owned by an organiser |
| `Show` | A specific date/time instance of an event at a venue |
| `ShowSeat` | One row per physical seat per show, tracks status, category, hold ID, booking ID, and an optimistic-lock version |
| `SeatHold` | A temporary claim on one or more `ShowSeat` rows, with an `expiresAt` timestamp |
| `SeatHoldItem` | Join row linking a hold to its seats, unique per `showSeatId` so a seat can never belong to two holds |
| `Booking` | A confirmed purchase, created when an active hold is completed |
| `BookingSeat` | Join row linking a booking to its seats |
| `Ticket` | One row per booked seat, stores the signed QR token |
| `WaitlistEntry` | FIFO queue entry per show and seat category |
| `WaitlistOffer` | Time-limited offer of a released seat to the next waitlist entry |

Seat status flows through `AVAILABLE -> HELD -> BOOKED`, with `HELD` seats reverting to `AVAILABLE` on hold expiry or release, and `BOOKED` seats reverting to `AVAILABLE` (or `OFFERED`, if someone is waiting) on cancellation.

## Main API Areas

Full interactive documentation is at `/api/docs` (Swagger) once the API is running.

- `auth`: registration, login, refresh, and current user
- `events` and `shows`: discovery and organiser management
- `shows/{showId}/seats`: visual seat-map data
- `shows/{showId}/holds`: create, inspect, and release holds
- `bookings`: confirm, list, inspect, and cancel bookings
- `waitlist`: join, leave, and inspect waitlist entries
- `tickets/{ticketId}/verify`: QR ticket verification
- `ai/event-search`: grounded natural-language event and seat discovery

## QR Ticket and Email Service

When `POST /api/v1/bookings` confirms an active hold, the API performs these steps:

1. Atomically changes the hold from `ACTIVE` to `COMPLETED`, only if its expiry has not passed.
2. Creates the booking, booking-seat rows, and one `Ticket` row per seat, in a database transaction.
3. Builds a signed QR token from the booking and seat data using `QR_SECRET` and HMAC-SHA256, and stores it on the `Ticket` row.
4. Generates a 300px PNG with the `qrcode` package.
5. Sends a confirmation email through Resend with the PNG attached. Email failure is logged and never undoes a confirmed booking.

`GET /api/v1/tickets/{ticketId}/verify` returns the ticket's validity, booking reference, seat label, category, and issue time. A valid ticket must belong to a confirmed booking.

## Manual QR and Email Test

1. Start the database, Redis, API, and web app.
2. Sign in with a seeded customer account, then select seats.
3. Click **Hold seats** and confirm an active hold appears on the dashboard.
4. Click **Confirm booking**. The API response includes booking seats and their ticket records.
5. With `RESEND_API_KEY=mock-key`, check the API log for `Mock Email` and the booking reference.
6. For real delivery, set a valid Resend key and verified sender, restart the API, confirm another booking, and check the inbox for `ticket-{bookingReference}.png`.
7. Copy a returned `ticket.id` and request `/api/v1/tickets/{ticketId}/verify` in Swagger or an authenticated API client. The response should show `valid: true`.

To test waitlist email delivery service, fill every seat in one category, join the waitlist, cancel a confirmed booking, and check the mock log or recipient inbox. The email contains a category offer and a time-limited `waitlistOfferId` checkout link. The scheduled worker reassigns an offer once it passes its 30-minute expiry.

## Testing

```bash
npm test               # API unit and integration tests
npm run test:concurrency   # Race-condition checks for simultaneous seat holds/bookings
```

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
