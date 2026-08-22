import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SeatScore {
  id: string;
  row: string;
  number: number;
  label: string;
  category: string;
  status: string;
  price: number;
  score: number;
  explanation: string;
}

@Injectable()
export class SeatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSeatMap(showId: string) {
    const show = await this.prisma.show.findUnique({
      where: { id: showId },
      include: {
        showSeatCategoryPrices: { include: { category: true } },
        venue: { include: { seatCategories: true } },
      },
    });

    if (!show) throw new NotFoundException('Show not found');

    const showSeats = await this.prisma.showSeat.findMany({
      where: { showId },
      include: {
        venueSeat: true,
        category: true,
      },
      orderBy: [{ venueSeat: { row: 'asc' } }, { venueSeat: { number: 'asc' } }],
    });

    const priceMap = new Map(
      show.showSeatCategoryPrices.map((p) => [p.categoryId, Number(p.price)]),
    );

    // Group by row for the seat map grid
    const rows: Record<string, typeof showSeats> = {};
    for (const seat of showSeats) {
      const row = seat.venueSeat.row;
      if (!rows[row]) rows[row] = [];
      rows[row].push(seat);
    }

    return {
      showId,
      venue: show.venue,
      categories: show.showSeatCategoryPrices.map((p) => ({
        id: p.categoryId,
        name: p.category.name,
        colorCode: p.category.colorCode,
        price: Number(p.price),
      })),
      rows: Object.entries(rows).map(([row, seats]) => ({
        row,
        seats: seats.map((s) => ({
          id: s.id,
          venueSeatId: s.venueSeatId,
          row: s.venueSeat.row,
          number: s.venueSeat.number,
          label: s.venueSeat.label,
          category: s.category.name,
          categoryId: s.categoryId,
          colorCode: s.category.colorCode,
          status: s.status,
          price: priceMap.get(s.categoryId) ?? 0,
        })),
      })),
      stats: {
        total: showSeats.length,
        available: showSeats.filter((s) => s.status === 'AVAILABLE').length,
        held: showSeats.filter((s) => s.status === 'HELD').length,
        booked: showSeats.filter((s) => s.status === 'BOOKED').length,
      },
    };
  }

  /**
   * Deterministic seat recommendation engine.
   *
   * No LLM involved here. Scores are computed across:
   *   - Centrality: how close to the center column the seat is (0-40 pts)
   *   - Row position: optimal viewing distance from stage/screen (0-30 pts)
   *   - Category match: does the seat match the user's preferred category (0-20 pts)
   *   - Budget fit: is the seat within the user's stated budget (0-10 pts)
   *
   * Group adjacency for multi-seat requests: all seats in the recommendation
   * are from the same row and are contiguous.
   */
  async recommendSeats(
    showId: string,
    preferences: {
      count: number;
      categoryPreference?: string;
      maxBudgetPerSeat?: number;
    },
  ): Promise<SeatScore[]> {
    const seatMap = await this.getSeatMap(showId);
    const available = seatMap.rows
      .flatMap((r) => r.seats)
      .filter((s) => s.status === 'AVAILABLE');

    if (available.length === 0) return [];

    const totalRows = seatMap.rows.length;
    const maxSeatsPerRow = Math.max(...seatMap.rows.map((r) => r.seats.length));

    const scored = available.map((seat) => {
      const rowIndex = seatMap.rows.findIndex((r) => r.row === seat.row);
      const rowRatio = rowIndex / Math.max(totalRows - 1, 1);
      const colRatio = (seat.number - 1) / Math.max(maxSeatsPerRow - 1, 1);

      // Centrality: 0 at edges, 40 at center column
      const centralityScore = 40 * (1 - Math.abs(colRatio - 0.5) * 2);

      // Row position: sweet spot at 40% from front (rows D-F in a 10-row cinema)
      const optimalRowRatio = 0.4;
      const rowScore = 30 * (1 - Math.abs(rowRatio - optimalRowRatio) * 2);

      // Category match
      const categoryScore =
        preferences.categoryPreference &&
        seat.category === preferences.categoryPreference
          ? 20
          : 0;

      // Budget fit
      const budgetScore =
        preferences.maxBudgetPerSeat && seat.price <= preferences.maxBudgetPerSeat ? 10 : 0;

      const total = centralityScore + Math.max(rowScore, 0) + categoryScore + budgetScore;

      return {
        ...seat,
        score: Math.round(total * 10) / 10,
        explanation: `Row ${seat.row}, seat ${seat.number} — ${seat.category} (₹${seat.price}). Centrality: ${centralityScore.toFixed(0)}/40, Row position: ${Math.max(rowScore, 0).toFixed(0)}/30.`,
      };
    });

    // Sort by score, then find contiguous groups if count > 1
    scored.sort((a, b) => b.score - a.score);

    if (preferences.count === 1) {
      return scored.slice(0, 5);
    }

    // Find best contiguous group of N seats in the same row
    return this.findBestContiguousGroup(scored, seatMap.rows, preferences.count);
  }

  private findBestContiguousGroup(
    scored: SeatScore[],
    rows: Array<{ row: string; seats: any[] }>,
    count: number,
  ): SeatScore[] {
    let bestGroup: SeatScore[] = [];
    let bestGroupScore = -1;

    for (const rowData of rows) {
      const availableInRow = rowData.seats.filter((s) => s.status === 'AVAILABLE');
      if (availableInRow.length < count) continue;

      // Sliding window of size `count`
      for (let i = 0; i <= availableInRow.length - count; i++) {
        const window = availableInRow.slice(i, i + count);

        // Check contiguous
        const isContiguous = window.every(
          (s, idx) => idx === 0 || s.number === window[idx - 1].number + 1,
        );

        if (!isContiguous) continue;

        const windowScored = window.map((s) => scored.find((sc) => sc.id === s.id)!).filter(Boolean);
        const groupScore = windowScored.reduce((sum, s) => sum + s.score, 0);

        if (groupScore > bestGroupScore) {
          bestGroupScore = groupScore;
          bestGroup = windowScored;
        }
      }
    }

    return bestGroup;
  }
}
