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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SeatHoldsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeatHoldsService = exports.SEAT_HOLD_QUEUE = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const seat_holds_repository_1 = require("./seat-holds.repository");
const realtime_gateway_1 = require("../realtime/realtime.gateway");
const uuid_1 = require("uuid");
exports.SEAT_HOLD_QUEUE = 'seat-hold-expiry';
let SeatHoldsService = SeatHoldsService_1 = class SeatHoldsService {
    prisma;
    repository;
    configService;
    holdQueue;
    realtimeGateway;
    logger = new common_1.Logger(SeatHoldsService_1.name);
    holdTtlMinutes;
    constructor(prisma, repository, configService, holdQueue, realtimeGateway) {
        this.prisma = prisma;
        this.repository = repository;
        this.configService = configService;
        this.holdQueue = holdQueue;
        this.realtimeGateway = realtimeGateway;
        this.holdTtlMinutes = this.configService.get('SEAT_HOLD_TTL_MINUTES', 10);
    }
    async createHold(showId, dto, user) {
        const show = await this.prisma.show.findUnique({ where: { id: showId } });
        if (!show)
            throw new common_1.NotFoundException('Show not found');
        if (show.status !== 'SCHEDULED') {
            throw new common_1.BadRequestException('Show is not available for booking');
        }
        if (show.startTime < new Date()) {
            throw new common_1.BadRequestException('Show has already started');
        }
        const showSeats = await this.prisma.showSeat.findMany({
            where: { id: { in: dto.seatIds }, showId },
        });
        if (showSeats.length !== dto.seatIds.length) {
            throw new common_1.BadRequestException('One or more seats do not belong to this show');
        }
        const holdId = (0, uuid_1.v4)();
        const expiresAt = new Date(Date.now() + this.holdTtlMinutes * 60 * 1000);
        await this.repository.createHoldTransaction(showId, user.id, dto.seatIds, holdId, expiresAt);
        const delay = expiresAt.getTime() - Date.now();
        await this.holdQueue.add('expire-hold', { holdId, showId, seatIds: dto.seatIds }, {
            delay,
            jobId: `hold-expiry:${holdId}`,
            removeOnComplete: true,
            removeOnFail: 10,
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
        });
        for (const seatId of dto.seatIds) {
            this.realtimeGateway.broadcastSeatStatus(showId, seatId, 'HELD', holdId);
        }
        return this.repository.findActiveHold(holdId);
    }
    async releaseHold(holdId, showId, user) {
        const hold = await this.repository.findActiveHold(holdId);
        if (!hold)
            throw new common_1.NotFoundException('Hold not found');
        if (hold.showId !== showId)
            throw new common_1.BadRequestException('Hold does not belong to this show');
        if (hold.userId !== user.id)
            throw new common_1.ForbiddenException('Not your hold');
        const released = await this.repository.conditionalRelease(holdId);
        if (released === 0) {
            throw new common_1.BadRequestException('Hold is not active (may have expired or been confirmed)');
        }
        const seatIds = hold.items.map((item) => item.showSeatId);
        await this.repository.releaseSeatsToAvailable(seatIds, holdId);
        const job = await this.holdQueue.getJob(`hold-expiry:${holdId}`);
        if (job)
            await job.remove();
        for (const seatId of seatIds) {
            this.realtimeGateway.broadcastSeatStatus(showId, seatId, 'AVAILABLE', null);
        }
        return { released: true, holdId };
    }
    async getHold(holdId, user) {
        const hold = await this.repository.findActiveHold(holdId);
        if (!hold)
            throw new common_1.NotFoundException('Hold not found');
        if (hold.userId !== user.id)
            throw new common_1.ForbiddenException('Not your hold');
        return hold;
    }
};
exports.SeatHoldsService = SeatHoldsService;
exports.SeatHoldsService = SeatHoldsService = SeatHoldsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, bullmq_1.InjectQueue)(exports.SEAT_HOLD_QUEUE)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        seat_holds_repository_1.SeatHoldsRepository,
        config_1.ConfigService,
        bullmq_2.Queue,
        realtime_gateway_1.RealtimeGateway])
], SeatHoldsService);
//# sourceMappingURL=seat-holds.service.js.map