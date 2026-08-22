"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganiserModule = void 0;
const common_1 = require("@nestjs/common");
const organiser_controller_1 = require("./organiser.controller");
let OrganiserModule = class OrganiserModule {
};
exports.OrganiserModule = OrganiserModule;
exports.OrganiserModule = OrganiserModule = __decorate([
    (0, common_1.Module)({
        controllers: [organiser_controller_1.OrganiserController],
    })
], OrganiserModule);
//# sourceMappingURL=organiser.module.js.map