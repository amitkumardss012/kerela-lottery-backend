"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WinnerService = exports.TicketPackageService = exports.LotteryService = exports.AdminService = void 0;
const admin_service_1 = __importDefault(require("./admin.service"));
exports.AdminService = admin_service_1.default;
const lottery_service_1 = __importDefault(require("./lottery.service"));
exports.LotteryService = lottery_service_1.default;
const ticketPackage_service_1 = __importDefault(require("./ticketPackage.service"));
exports.TicketPackageService = ticketPackage_service_1.default;
const winner_service_1 = __importDefault(require("./winner.service"));
exports.WinnerService = winner_service_1.default;
