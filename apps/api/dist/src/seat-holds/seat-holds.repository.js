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
var SeatHoldsRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeatHoldsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const common_2 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let SeatHoldsRepository = SeatHoldsRepository_1 = class SeatHoldsRepository {
    prisma;
    logger = new common_1.Logger(SeatHoldsRepository_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createHoldTransaction(showId, userId, seatIds, holdId, expiresAt) {
        await this.prisma.$transaction(async (tx) => {
            await tx.seatHold.create({
                data: {
                    id: holdId,
                    showId,
                    userId,
                    expiresAt,
                    status: 'ACTIVE',
                },
            });
            for (const seatId of seatIds) {
                const locked = await tx.$queryRaw `
            SELECT id, status, version
            FROM show_seats
            WHERE id = ${seatId}
            FOR UPDATE
          `;
                if (!locked || locked.length === 0) {
                    throw new common_2.NotFoundException(`Seat ${seatId} not found`);
                }
                const seat = locked[0];
                if (seat.status !== 'AVAILABLE') {
                    throw new common_2.ConflictException(`Seat ${seatId} is not available (current status: ${seat.status})`);
                }
                const updateResult = await tx.$executeRaw `
            UPDATE show_seats
            SET status = 'HELD',
                hold_id = ${holdId},
                version = version + 1
            WHERE id = ${seatId}
              AND status = 'AVAILABLE'
              AND version = ${seat.version}
          `;
                if (updateResult === 0) {
                    throw new common_2.ConflictException(`Seat ${seatId} was taken by a concurrent request (version mismatch)`);
                }
                await tx.seatHoldItem.create({
                    data: { holdId, showSeatId: seatId },
                });
            }
        }, {
            isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable,
            timeout: 10000,
        });
    }
    async conditionalExpire(holdId) {
        return this.prisma.$executeRaw `
      UPDATE seat_holds
      SET status = 'EXPIRED', released_at = now()
      WHERE id = ${holdId}
        AND status = 'ACTIVE'
    `;
    }
    async conditionalComplete(holdId) {
        return this.prisma.$executeRaw `
      UPDATE seat_holds
      SET status = 'COMPLETED', booked_at = now()
      WHERE id = ${holdId}
        AND status = 'ACTIVE'
        AND expires_at > now()
    `;
    }
    async conditionalRelease(holdId) {
        return this.prisma.$executeRaw `
      UPDATE seat_holds
      SET status = 'RELEASED', released_at = now()
      WHERE id = ${holdId}
        AND status = 'ACTIVE'
    `;
    }
    async findActiveHold(holdId) {
        return this.prisma.seatHold.findUnique({
            where: { id: holdId },
            include: { items: { include: { showSeat: true } } },
        });
    }
    async findExpiredActiveHolds() {
        return this.prisma.seatHold.findMany({
            where: {
                status: 'ACTIVE',
                expiresAt: { lte: new Date() },
            },
            include: { items: { select: { showSeatId: true } } },
        });
    }
    async releaseSeatsToAvailable(seatIds, holdId) {
        await this.prisma.$executeRaw `
      UPDATE show_seats
      SET status = 'AVAILABLE',
          hold_id = NULL,
          version = version + 1
      WHERE id = ANY(${seatIds}::text[])
        AND status = 'HELD'
        AND hold_id = ${holdId}
    `;
    }
};
exports.SeatHoldsRepository = SeatHoldsRepository;
exports.SeatHoldsRepository = SeatHoldsRepository = SeatHoldsRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SeatHoldsRepository);
//# sourceMappingURL=seat-holds.repository.js.map