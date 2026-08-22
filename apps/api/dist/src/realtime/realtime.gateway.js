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
var RealtimeGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
let RealtimeGateway = RealtimeGateway_1 = class RealtimeGateway {
    server;
    logger = new common_1.Logger(RealtimeGateway_1.name);
    handleConnection(client) {
        this.logger.debug(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.debug(`Client disconnected: ${client.id}`);
    }
    handleJoinShow(client, data) {
        client.join(`show:${data.showId}`);
        this.logger.debug(`Client ${client.id} joined show:${data.showId}`);
        return { joined: `show:${data.showId}` };
    }
    handleLeaveShow(client, data) {
        client.leave(`show:${data.showId}`);
        return { left: `show:${data.showId}` };
    }
    broadcastSeatStatus(showId, seatId, status, holdId) {
        this.server.to(`show:${showId}`).emit('seat.status.changed', {
            showId,
            seatId,
            status,
            holdId,
            timestamp: new Date().toISOString(),
        });
    }
    broadcastHoldExpired(showId, holdId, seatIds) {
        this.server.to(`show:${showId}`).emit('hold.expired', {
            showId,
            holdId,
            seatIds,
            timestamp: new Date().toISOString(),
        });
    }
    broadcastOfferCreated(showId, userId, offerId, expiresAt) {
        this.server.to(`show:${showId}`).emit('offer.created', {
            showId,
            userId,
            offerId,
            expiresAt: expiresAt.toISOString(),
            timestamp: new Date().toISOString(),
        });
    }
};
exports.RealtimeGateway = RealtimeGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], RealtimeGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_show'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], RealtimeGateway.prototype, "handleJoinShow", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave_show'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], RealtimeGateway.prototype, "handleLeaveShow", null);
exports.RealtimeGateway = RealtimeGateway = RealtimeGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
            credentials: true,
        },
        namespace: '/realtime',
    })
], RealtimeGateway);
//# sourceMappingURL=realtime.gateway.js.map