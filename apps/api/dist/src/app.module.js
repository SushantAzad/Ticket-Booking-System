"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const bullmq_1 = require("@nestjs/bullmq");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const venues_module_1 = require("./venues/venues.module");
const events_module_1 = require("./events/events.module");
const shows_module_1 = require("./shows/shows.module");
const seats_module_1 = require("./seats/seats.module");
const seat_holds_module_1 = require("./seat-holds/seat-holds.module");
const bookings_module_1 = require("./bookings/bookings.module");
const waitlist_module_1 = require("./waitlist/waitlist.module");
const tickets_module_1 = require("./tickets/tickets.module");
const notifications_module_1 = require("./notifications/notifications.module");
const realtime_module_1 = require("./realtime/realtime.module");
const organiser_module_1 = require("./organiser/organiser.module");
const admin_module_1 = require("./admin/admin.module");
const ai_module_1 = require("./ai/ai.module");
const jobs_module_1 = require("./jobs/jobs.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
            throttler_1.ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
            bullmq_1.BullModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    connection: {
                        host: configService.get('REDIS_HOST', 'localhost'),
                        port: configService.get('REDIS_PORT', 6379),
                        password: configService.get('REDIS_PASSWORD'),
                    },
                }),
                inject: [config_1.ConfigService],
            }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            venues_module_1.VenuesModule,
            events_module_1.EventsModule,
            shows_module_1.ShowsModule,
            seats_module_1.SeatsModule,
            seat_holds_module_1.SeatHoldsModule,
            bookings_module_1.BookingsModule,
            waitlist_module_1.WaitlistModule,
            tickets_module_1.TicketsModule,
            notifications_module_1.NotificationsModule,
            realtime_module_1.RealtimeModule,
            organiser_module_1.OrganiserModule,
            admin_module_1.AdminModule,
            ai_module_1.AiModule,
            jobs_module_1.JobsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map