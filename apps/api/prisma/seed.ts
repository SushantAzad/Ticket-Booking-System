import {
  PrismaClient,
  Role,
  EventType,
  SeatCategoryName,
  ShowStatus,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ── Users ──────────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const organiserPassword = await bcrypt.hash('Organiser@123', 12);
  const customerPassword = await bcrypt.hash('Customer@123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@tbs.com' },
    update: {},
    create: {
      email: 'admin@tbs.com',
      passwordHash: adminPassword,
      name: 'System Admin',
      role: Role.ADMIN,
    },
  });

  const organiser = await prisma.user.upsert({
    where: { email: 'organiser@tbs.com' },
    update: {},
    create: {
      email: 'organiser@tbs.com',
      passwordHash: organiserPassword,
      name: 'Event Organiser',
      role: Role.ORGANISER,
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@tbs.com' },
    update: {},
    create: {
      email: 'customer@tbs.com',
      passwordHash: customerPassword,
      name: 'Jane Customer',
      role: Role.CUSTOMER,
    },
  });

  console.log('✅ Users created');

  // ── Venue 1: Cinema ────────────────────────────────────────────────────────
  const cinemaVenue = await prisma.venue.upsert({
    where: { id: 'venue-cinema-01' },
    update: {},
    create: {
      id: 'venue-cinema-01',
      name: 'Cineplex Grand',
      address: '12 Film Street',
      city: 'Mumbai',
      createdById: admin.id,
    },
  });

  const cinemaStandard = await prisma.seatCategory.upsert({
    where: { venueId_name: { venueId: cinemaVenue.id, name: SeatCategoryName.STANDARD } },
    update: {},
    create: { venueId: cinemaVenue.id, name: SeatCategoryName.STANDARD, colorCode: '#4ade80' },
  });

  const cinemaPremium = await prisma.seatCategory.upsert({
    where: { venueId_name: { venueId: cinemaVenue.id, name: SeatCategoryName.PREMIUM } },
    update: {},
    create: { venueId: cinemaVenue.id, name: SeatCategoryName.PREMIUM, colorCode: '#facc15' },
  });

  const cinemaVip = await prisma.seatCategory.upsert({
    where: { venueId_name: { venueId: cinemaVenue.id, name: SeatCategoryName.VIP } },
    update: {},
    create: { venueId: cinemaVenue.id, name: SeatCategoryName.VIP, colorCode: '#a78bfa' },
  });

  // Generate cinema seats: rows A-J, 12 seats per row
  const cinemaRows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const seatsPerRow = 12;
  const venueSeatData: { venueId: string; categoryId: string; row: string; number: number; label: string }[] = [];

  for (const row of cinemaRows) {
    const rowIndex = cinemaRows.indexOf(row);
    const categoryId =
      rowIndex <= 1 ? cinemaVip.id : rowIndex <= 4 ? cinemaPremium.id : cinemaStandard.id;

    for (let num = 1; num <= seatsPerRow; num++) {
      venueSeatData.push({
        venueId: cinemaVenue.id,
        categoryId,
        row,
        number: num,
        label: `${row}${num}`,
      });
    }
  }

  // Upsert venue seats
  for (const seatData of venueSeatData) {
    await prisma.venueSeat.upsert({
      where: { venueId_row_number: { venueId: seatData.venueId, row: seatData.row, number: seatData.number } },
      update: {},
      create: seatData,
    });
  }

  console.log(`✅ Cinema venue created with ${venueSeatData.length} seats`);

  // ── Venue 2: Concert Hall ──────────────────────────────────────────────────
  const concertVenue = await prisma.venue.upsert({
    where: { id: 'venue-concert-01' },
    update: {},
    create: {
      id: 'venue-concert-01',
      name: 'Harmony Arena',
      address: '88 Music Boulevard',
      city: 'Bangalore',
      createdById: admin.id,
    },
  });

  const concertStandard = await prisma.seatCategory.upsert({
    where: { venueId_name: { venueId: concertVenue.id, name: SeatCategoryName.STANDARD } },
    update: {},
    create: { venueId: concertVenue.id, name: SeatCategoryName.STANDARD, colorCode: '#4ade80' },
  });

  const concertPremium = await prisma.seatCategory.upsert({
    where: { venueId_name: { venueId: concertVenue.id, name: SeatCategoryName.PREMIUM } },
    update: {},
    create: { venueId: concertVenue.id, name: SeatCategoryName.PREMIUM, colorCode: '#facc15' },
  });

  const concertVip = await prisma.seatCategory.upsert({
    where: { venueId_name: { venueId: concertVenue.id, name: SeatCategoryName.VIP } },
    update: {},
    create: { venueId: concertVenue.id, name: SeatCategoryName.VIP, colorCode: '#a78bfa' },
  });

  const concertRows = ['P1', 'P2', 'P3', 'P4', 'P5', 'M1', 'M2', 'M3', 'M4', 'B1', 'B2', 'B3'];
  const concertSeatsPerRow = 20;

  for (const row of concertRows) {
    const sectionPrefix = row.startsWith('P') ? 'pit' : row.startsWith('M') ? 'mid' : 'back';
    const categoryId =
      sectionPrefix === 'pit' ? concertVip.id : sectionPrefix === 'mid' ? concertPremium.id : concertStandard.id;

    for (let num = 1; num <= concertSeatsPerRow; num++) {
      await prisma.venueSeat.upsert({
        where: { venueId_row_number: { venueId: concertVenue.id, row, number: num } },
        update: {},
        create: { venueId: concertVenue.id, categoryId, row, number: num, label: `${row}-${num}` },
      });
    }
  }

  console.log('✅ Concert venue created');

  // ── Events ─────────────────────────────────────────────────────────────────
  const movieEvent = await prisma.event.upsert({
    where: { id: 'event-movie-01' },
    update: {},
    create: {
      id: 'event-movie-01',
      title: 'Stellar Horizons',
      description: 'An epic sci-fi adventure across galaxies, starring a cast of Oscar winners.',
      type: EventType.MOVIE,
      genre: 'Sci-Fi',
      posterUrl: null,
      organiserId: organiser.id,
    },
  });

  const concertEvent = await prisma.event.upsert({
    where: { id: 'event-concert-01' },
    update: {},
    create: {
      id: 'event-concert-01',
      title: 'Echoes of Tomorrow',
      description: 'A night of progressive rock and electronic fusion. Sold out three cities.',
      type: EventType.CONCERT,
      genre: 'Rock',
      posterUrl: null,
      organiserId: organiser.id,
    },
  });

  const liveEvent = await prisma.event.upsert({
    where: { id: 'event-live-01' },
    update: {},
    create: {
      id: 'event-live-01',
      title: 'Stand-Up: The Roast of Reality',
      description: 'An evening of sharp comedy with India\'s top five stand-up comedians.',
      type: EventType.LIVE_EVENT,
      genre: 'Comedy',
      posterUrl: null,
      organiserId: organiser.id,
    },
  });

  console.log('✅ Events created');

  // ── Shows ──────────────────────────────────────────────────────────────────
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  const movieShow1 = await prisma.show.upsert({
    where: { id: 'show-movie-01' },
    update: {},
    create: {
      id: 'show-movie-01',
      eventId: movieEvent.id,
      venueId: cinemaVenue.id,
      startTime: new Date(tomorrow.setHours(14, 0, 0, 0)),
      endTime: new Date(tomorrow.setHours(16, 30, 0, 0)),
      status: ShowStatus.SCHEDULED,
    },
  });

  const movieShow2 = await prisma.show.upsert({
    where: { id: 'show-movie-02' },
    update: {},
    create: {
      id: 'show-movie-02',
      eventId: movieEvent.id,
      venueId: cinemaVenue.id,
      startTime: new Date(dayAfter.setHours(20, 0, 0, 0)),
      endTime: new Date(dayAfter.setHours(22, 30, 0, 0)),
      status: ShowStatus.SCHEDULED,
    },
  });

  const concertShow = await prisma.show.upsert({
    where: { id: 'show-concert-01' },
    update: {},
    create: {
      id: 'show-concert-01',
      eventId: concertEvent.id,
      venueId: concertVenue.id,
      startTime: new Date(dayAfter.setHours(19, 0, 0, 0)),
      endTime: new Date(dayAfter.setHours(23, 0, 0, 0)),
      status: ShowStatus.SCHEDULED,
    },
  });

  const liveShow = await prisma.show.upsert({
    where: { id: 'show-live-01' },
    update: {},
    create: {
      id: 'show-live-01',
      eventId: liveEvent.id,
      venueId: cinemaVenue.id,
      startTime: new Date(tomorrow.setHours(19, 30, 0, 0)),
      endTime: new Date(tomorrow.setHours(21, 30, 0, 0)),
      status: ShowStatus.SCHEDULED,
    },
  });

  console.log('✅ Shows created');

  // ── ShowSeatCategoryPrices ─────────────────────────────────────────────────
  // Movie show 1 (matinee - cheaper)
  await prisma.showSeatCategoryPrice.upsert({
    where: { showId_categoryId: { showId: movieShow1.id, categoryId: cinemaStandard.id } },
    update: {},
    create: { showId: movieShow1.id, categoryId: cinemaStandard.id, price: new Decimal('200') },
  });
  await prisma.showSeatCategoryPrice.upsert({
    where: { showId_categoryId: { showId: movieShow1.id, categoryId: cinemaPremium.id } },
    update: {},
    create: { showId: movieShow1.id, categoryId: cinemaPremium.id, price: new Decimal('350') },
  });
  await prisma.showSeatCategoryPrice.upsert({
    where: { showId_categoryId: { showId: movieShow1.id, categoryId: cinemaVip.id } },
    update: {},
    create: { showId: movieShow1.id, categoryId: cinemaVip.id, price: new Decimal('600') },
  });

  // Movie show 2 (evening premiere - pricier)
  await prisma.showSeatCategoryPrice.upsert({
    where: { showId_categoryId: { showId: movieShow2.id, categoryId: cinemaStandard.id } },
    update: {},
    create: { showId: movieShow2.id, categoryId: cinemaStandard.id, price: new Decimal('300') },
  });
  await prisma.showSeatCategoryPrice.upsert({
    where: { showId_categoryId: { showId: movieShow2.id, categoryId: cinemaPremium.id } },
    update: {},
    create: { showId: movieShow2.id, categoryId: cinemaPremium.id, price: new Decimal('500') },
  });
  await prisma.showSeatCategoryPrice.upsert({
    where: { showId_categoryId: { showId: movieShow2.id, categoryId: cinemaVip.id } },
    update: {},
    create: { showId: movieShow2.id, categoryId: cinemaVip.id, price: new Decimal('900') },
  });

  // Concert
  await prisma.showSeatCategoryPrice.upsert({
    where: { showId_categoryId: { showId: concertShow.id, categoryId: concertStandard.id } },
    update: {},
    create: { showId: concertShow.id, categoryId: concertStandard.id, price: new Decimal('800') },
  });
  await prisma.showSeatCategoryPrice.upsert({
    where: { showId_categoryId: { showId: concertShow.id, categoryId: concertPremium.id } },
    update: {},
    create: { showId: concertShow.id, categoryId: concertPremium.id, price: new Decimal('1500') },
  });
  await prisma.showSeatCategoryPrice.upsert({
    where: { showId_categoryId: { showId: concertShow.id, categoryId: concertVip.id } },
    update: {},
    create: { showId: concertShow.id, categoryId: concertVip.id, price: new Decimal('3000') },
  });

  // Live event
  await prisma.showSeatCategoryPrice.upsert({
    where: { showId_categoryId: { showId: liveShow.id, categoryId: cinemaStandard.id } },
    update: {},
    create: { showId: liveShow.id, categoryId: cinemaStandard.id, price: new Decimal('400') },
  });
  await prisma.showSeatCategoryPrice.upsert({
    where: { showId_categoryId: { showId: liveShow.id, categoryId: cinemaPremium.id } },
    update: {},
    create: { showId: liveShow.id, categoryId: cinemaPremium.id, price: new Decimal('700') },
  });
  await prisma.showSeatCategoryPrice.upsert({
    where: { showId_categoryId: { showId: liveShow.id, categoryId: cinemaVip.id } },
    update: {},
    create: { showId: liveShow.id, categoryId: cinemaVip.id, price: new Decimal('1200') },
  });

  console.log('✅ Show prices set');

  // ── ShowSeats — generate from VenueSeats ───────────────────────────────────
  const allShows = [
    { show: movieShow1, venueId: cinemaVenue.id },
    { show: movieShow2, venueId: cinemaVenue.id },
    { show: liveShow, venueId: cinemaVenue.id },
    { show: concertShow, venueId: concertVenue.id },
  ];

  for (const { show, venueId } of allShows) {
    const venueSeats = await prisma.venueSeat.findMany({ where: { venueId } });

    for (const venueSeat of venueSeats) {
      await prisma.showSeat.upsert({
        where: { showId_venueSeatId: { showId: show.id, venueSeatId: venueSeat.id } },
        update: {},
        create: {
          showId: show.id,
          venueSeatId: venueSeat.id,
          categoryId: venueSeat.categoryId,
          status: 'AVAILABLE',
          version: 0,
        },
      });
    }
    console.log(`  ✅ ShowSeats generated for show: ${show.id}`);
  }

  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('Test credentials:');
  console.log('  Admin:     admin@tbs.com     / Admin@123');
  console.log('  Organiser: organiser@tbs.com / Organiser@123');
  console.log('  Customer:  customer@tbs.com  / Customer@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
