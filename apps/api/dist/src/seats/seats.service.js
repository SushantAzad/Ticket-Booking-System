"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeatsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SeatsService = class SeatsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSeatMap(showId) {
        const show = await this.prisma.show.findUnique({
            where: { id: showId },
            include: {
                showSeatCategoryPrices: { include: { category: true } },
                venue: { include: { seatCategories: true } },
            },
        });
        if (!show)
            throw new common_1.NotFoundException('Show not found');
        const showSeats = await this.prisma.showSeat.findMany({
            where: { showId },
            include: {
                venueSeat: true,
                category: true,
            },
            orderBy: [{ venueSeat: { row: 'asc' } }, { venueSeat: { number: 'asc' } }],
        });
        const priceMap = new Map(show.showSeatCategoryPrices.map((p) => [p.categoryId, Number(p.price)]));
        const rows = {};
        for (const seat of showSeats) {
            const row = seat.venueSeat.row;
            if (!rows[row])
                rows[row] = [];
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
    async recommendSeats(showId, preferences) {
        const seatMap = await this.getSeatMap(showId);
        const available = seatMap.rows
            .flatMap((r) => r.seats)
            .filter((s) => s.status === 'AVAILABLE');
        if (available.length === 0)
            return [];
        const totalRows = seatMap.rows.length;
        const maxSeatsPerRow = Math.max(...seatMap.rows.map((r) => r.seats.length));
        const scored = available.map((seat) => {
            const rowIndex = seatMap.rows.findIndex((r) => r.row === seat.row);
            const rowRatio = rowIndex / Math.max(totalRows - 1, 1);
            const colRatio = (seat.number - 1) / Math.max(maxSeatsPerRow - 1, 1);
            const centralityScore = 40 * (1 - Math.abs(colRatio - 0.5) * 2);
            const optimalRowRatio = 0.4;
            const rowScore = 30 * (1 - Math.abs(rowRatio - optimalRowRatio) * 2);
            const categoryScore = preferences.categoryPreference &&
                seat.category === preferences.categoryPreference
                ? 20
                : 0;
            const budgetScore = preferences.maxBudgetPerSeat && seat.price <= preferences.maxBudgetPerSeat ? 10 : 0;
            const total = centralityScore + Math.max(rowScore, 0) + categoryScore + budgetScore;
            return {
                ...seat,
                score: Math.round(total * 10) / 10,
                explanation: `Row ${seat.row}, seat ${seat.number} — ${seat.category} (₹${seat.price}). Centrality: ${centralityScore.toFixed(0)}/40, Row position: ${Math.max(rowScore, 0).toFixed(0)}/30.`,
            };
        });
        scored.sort((a, b) => b.score - a.score);
        if (preferences.count === 1) {
            return scored.slice(0, 5);
        }
        return this.findBestContiguousGroup(scored, seatMap.rows, preferences.count);
    }
    findBestContiguousGroup(scored, rows, count) {
        let bestGroup = [];
        let bestGroupScore = -1;
        for (const rowData of rows) {
            const availableInRow = rowData.seats.filter((s) => s.status === 'AVAILABLE');
            if (availableInRow.length < count)
                continue;
            for (let i = 0; i <= availableInRow.length - count; i++) {
                const window = availableInRow.slice(i, i + count);
                const isContiguous = window.every((s, idx) => idx === 0 || s.number === window[idx - 1].number + 1);
                if (!isContiguous)
                    continue;
                const windowScored = window.map((s) => scored.find((sc) => sc.id === s.id)).filter(Boolean);
                const groupScore = windowScored.reduce((sum, s) => sum + s.score, 0);
                if (groupScore > bestGroupScore) {
                    bestGroupScore = groupScore;
                    bestGroup = windowScored;
                }
            }
        }
        return bestGroup;
    }
};
exports.SeatsService = SeatsService;
exports.SeatsService = SeatsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SeatsService);
//# sourceMappingURL=seats.service.js.map