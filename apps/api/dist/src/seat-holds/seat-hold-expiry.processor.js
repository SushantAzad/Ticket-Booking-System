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
var SeatHoldExpiryProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeatHoldExpiryProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const common_1 = require("@nestjs/common");
const seat_holds_repository_1 = require("./seat-holds.repository");
const realtime_gateway_1 = require("../realtime/realtime.gateway");
const seat_holds_service_1 = require("./seat-holds.service");
let SeatHoldExpiryProcessor = SeatHoldExpiryProcessor_1 = class SeatHoldExpiryProcessor extends bullmq_1.WorkerHost {
    repository;
    realtimeGateway;
    logger = new common_1.Logger(SeatHoldExpiryProcessor_1.name);
    constructor(repository, realtimeGateway) {
        super();
        this.repository = repository;
        this.realtimeGateway = realtimeGateway;
    }
    async process(job) {
        const { holdId, showId, seatIds } = job.data;
        this.logger.debug(`Processing expiry for hold ${holdId}`);
        const expired = await this.repository.conditionalExpire(holdId);
        if (expired === 0) {
            this.logger.debug(`Hold ${holdId} already processed (booking won the race)`);
            return { skipped: true, holdId };
        }
        await this.repository.releaseSeatsToAvailable(seatIds, holdId);
        for (const seatId of seatIds) {
            this.realtimeGateway.broadcastSeatStatus(showId, seatId, 'AVAILABLE', null);
        }
        this.realtimeGateway.broadcastHoldExpired(showId, holdId, seatIds);
        this.logger.log(`Hold ${holdId} expired — ${seatIds.length} seat(s) released`);
        return { expired: true, holdId, seatsReleased: seatIds.length };
    }
    onFailed(job, error) {
        this.logger.error(`Hold expiry job failed for holdId=${job.data?.holdId}: ${error.message}`, error.stack);
    }
};
exports.SeatHoldExpiryProcessor = SeatHoldExpiryProcessor;
__decorate([
    (0, bullmq_1.OnWorkerEvent)('failed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bullmq_2.Job, Error]),
    __metadata("design:returntype", void 0)
], SeatHoldExpiryProcessor.prototype, "onFailed", null);
exports.SeatHoldExpiryProcessor = SeatHoldExpiryProcessor = SeatHoldExpiryProcessor_1 = __decorate([
    (0, bullmq_1.Processor)(seat_holds_service_1.SEAT_HOLD_QUEUE, { concurrency: 5 }),
    __metadata("design:paramtypes", [seat_holds_repository_1.SeatHoldsRepository,
        realtime_gateway_1.RealtimeGateway])
], SeatHoldExpiryProcessor);
//# sourceMappingURL=seat-hold-expiry.processor.js.map