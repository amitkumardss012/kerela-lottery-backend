"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTicketPackage = exports.updateTicketPackage = exports.getTicketPackageById = exports.getAllTicketPackages = exports.getAllActiveTicketPackages = exports.createTicketPackage = void 0;
const middlewares_1 = require("../middlewares");
const validators_1 = require("../validators");
const utils_1 = require("../utils");
const types_1 = require("../types/types");
const response_util_1 = require("../utils/response.util");
const ticketPackage_service_1 = __importDefault(require("../services/ticketPackage.service"));
exports.createTicketPackage = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const validatedData = validators_1.TicketPackageValidator.parse(req.body);
    if (validatedData.number_of_tickets > 25)
        return next(new utils_1.ErrorResponse("Only 25 tickets are allowed", types_1.statusCode.Bad_Request));
    if (validatedData.number_of_tickets < ((_a = validatedData.paid_tickets) !== null && _a !== void 0 ? _a : 0) + ((_b = validatedData.free_tickets) !== null && _b !== void 0 ? _b : 0))
        return next(new utils_1.ErrorResponse("Invalid number of tickets", types_1.statusCode.Bad_Request));
    if (validatedData.number_of_tickets != ((_c = validatedData.paid_tickets) !== null && _c !== void 0 ? _c : 0) + ((_d = validatedData.free_tickets) !== null && _d !== void 0 ? _d : 0))
        return next(new utils_1.ErrorResponse("Total tickets must be equal to paid + free tickets.", types_1.statusCode.Bad_Request));
    const ticketPackage = yield ticketPackage_service_1.default.create(validatedData);
    return (0, response_util_1.SuccessResponse)(res, "Ticket package created successfully", ticketPackage, types_1.statusCode.Created);
}));
exports.getAllActiveTicketPackages = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const ticketPackages = yield ticketPackage_service_1.default.getAllActive();
    return (0, response_util_1.SuccessResponse)(res, "Ticket packages fetched successfully", ticketPackages);
}));
exports.getAllTicketPackages = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const ticketPackages = yield ticketPackage_service_1.default.getAll();
    return (0, response_util_1.SuccessResponse)(res, "Ticket packages fetched successfully", ticketPackages);
}));
exports.getTicketPackageById = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (!id || isNaN(id))
        return next(new utils_1.ErrorResponse("Invalid Id", types_1.statusCode.Bad_Request));
    const ticketPackage = yield ticketPackage_service_1.default.getById(id);
    if (!ticketPackage)
        return next(new utils_1.ErrorResponse("Ticket package not found", types_1.statusCode.Not_Found));
    return (0, response_util_1.SuccessResponse)(res, "Ticket package fetched successfully", ticketPackage);
}));
exports.updateTicketPackage = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const id = Number(req.params.id);
    if (!id || isNaN(id))
        return next(new utils_1.ErrorResponse("Invalid Id", types_1.statusCode.Bad_Request));
    const validatedData = validators_1.TicketPackageValidator.partial().parse(req.body);
    if (((_a = validatedData.number_of_tickets) !== null && _a !== void 0 ? _a : 0) < ((_b = validatedData.paid_tickets) !== null && _b !== void 0 ? _b : 0) + ((_c = validatedData.free_tickets) !== null && _c !== void 0 ? _c : 0))
        return next(new utils_1.ErrorResponse("Invalid number of tickets", types_1.statusCode.Bad_Request));
    const updateTicketPackage = yield ticketPackage_service_1.default.update(id, validatedData);
    if (!updateTicketPackage)
        return next(new utils_1.ErrorResponse("Ticket package not found", types_1.statusCode.Not_Found));
    return (0, response_util_1.SuccessResponse)(res, "Ticket package updated successfully", updateTicketPackage);
}));
exports.deleteTicketPackage = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (!id || isNaN(id))
        return next(new utils_1.ErrorResponse("Invalid Id", types_1.statusCode.Bad_Request));
    const ticketPackage = yield ticketPackage_service_1.default.getById(id);
    if (!ticketPackage)
        return next(new utils_1.ErrorResponse("Ticket package not found", types_1.statusCode.Not_Found));
    const deletedPackage = yield ticketPackage_service_1.default.deleteById(id);
    if (!deletedPackage)
        return next(new utils_1.ErrorResponse("Ticket package not found", types_1.statusCode.Not_Found));
    return (0, response_util_1.SuccessResponse)(res, "Ticket package deleted successfully");
}));
