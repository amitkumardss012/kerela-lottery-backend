"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuyerController = exports.EnquiryController = exports.WinnerController = exports.TicketPackageController = exports.LotteryController = exports.AdminController = void 0;
const AdminController = __importStar(require("./admin.controller"));
exports.AdminController = AdminController;
const LotteryController = __importStar(require("./lottery.controller"));
exports.LotteryController = LotteryController;
const TicketPackageController = __importStar(require("./ticketPackage.controller"));
exports.TicketPackageController = TicketPackageController;
const WinnerController = __importStar(require("./winner.controller"));
exports.WinnerController = WinnerController;
const EnquiryController = __importStar(require("./enquiry.controller"));
exports.EnquiryController = EnquiryController;
const BuyerController = __importStar(require("./buyer.controller"));
exports.BuyerController = BuyerController;
