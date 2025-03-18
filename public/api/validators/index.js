"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuyerValidator = exports.EnquiryValidator = exports.WinnerValdator = exports.TicketPackageValidator = exports.LotteryValidator = exports.AdminValidator = exports.zodError = void 0;
const lottery_validator_1 = __importDefault(require("./lottery.validator"));
exports.LotteryValidator = lottery_validator_1.default;
const admin_validator_1 = __importDefault(require("./admin.validator"));
exports.AdminValidator = admin_validator_1.default;
const ticketPackage_validator_1 = __importDefault(require("./ticketPackage.validator"));
exports.TicketPackageValidator = ticketPackage_validator_1.default;
const winner_validator_1 = __importDefault(require("./winner.validator"));
exports.WinnerValdator = winner_validator_1.default;
const enquiry_validator_1 = __importDefault(require("./enquiry.validator"));
exports.EnquiryValidator = enquiry_validator_1.default;
const buyer_validator_1 = __importDefault(require("./buyer.validator"));
exports.BuyerValidator = buyer_validator_1.default;
const zodError = (error) => {
    let errors = {};
    error.errors.map((issue) => {
        var _a;
        const path = (_a = issue.path) === null || _a === void 0 ? void 0 : _a[0];
        if (path)
            errors[path] = issue.message;
    });
    return errors;
};
exports.zodError = zodError;
