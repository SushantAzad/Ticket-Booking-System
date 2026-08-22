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
var JobsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const seat_holds_repository_1 = require("../seat-holds/seat-holds.repository");
const realtime_gateway_1 = require("../realtime/realtime.gateway");
const waitlist_service_1 = require("../waitlist/waitlist.service");
let JobsService = JobsService_1 = class JobsService {
    prisma;
    holdsRepo;
    realtimeGateway;
    waitlistService;
    logger = new common_1.Logger(JobsService_1.name);
    constructor(prisma, holdsRepo, realtimeGateway, waitlistService) {
        this.prisma = prisma;
        this.holdsRepo = holdsRepo;
        this.realtimeGateway = realtimeGateway;
        this.waitlistService = waitlistService;
    }
    async sweepExpiredHolds() {
        const expiredHolds = await this.holdsRepo.findExpiredActiveHolds();
        if (expiredHolds.length === 0)
            return;
        this.logger.log(`Found ${expiredHolds.length} expired holds to sweep`);
        for (const hold of expiredHolds) {
            const expired = await this.holdsRepo.conditionalExpire(hold.id);
            if (expired > 0) {
                const seatIds = hold.items.map((i) => i.showSeatId);
                await this.holdsRepo.releaseSeatsToAvailable(seatIds, hold.id);
                for (const seatId of seatIds) {
                    this.realtimeGateway.broadcastSeatStatus(hold.showId, seatId, 'AVAILABLE', null);
                }
                this.realtimeGateway.broadcastHoldExpired(hold.showId, hold.id, seatIds);
                this.logger.log(`Swept hold ${hold.id}`);
            }
        }
    }
    async sweepExpiredOffers() {
        const expiredOffers = await this.prisma.waitlistOffer.findMany({
            where: {
                status: 'ACTIVE',
                expiresAt: { lte: new Date() },
            },
            select: { id: true },
        });
        if (expiredOffers.length === 0)
            return;
        this.logger.log(`Found ${expiredOffers.length} expired waitlist offers to sweep`);
        for (const offer of expiredOffers) {
            await this.waitlistService.expireOfferAndReassign(offer.id);
            this.logger.log(`Swept and reassigned offer ${offer.id}`);
        }
    }
};
exports.JobsService = JobsService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_30_SECONDS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], JobsService.prototype, "sweepExpiredHolds", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], JobsService.prototype, "sweepExpiredOffers", null);
exports.JobsService = JobsService = JobsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        seat_holds_repository_1.SeatHoldsRepository,
        realtime_gateway_1.RealtimeGateway,
        waitlist_service_1.WaitlistService])
], JobsService);
//# sourceMappingURL=jobs.service.js.map