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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePackageTicket = exports.getAvailablePackageTickets = exports.getPackageTickets = exports.generatePackageTickets = void 0;
const middlewares_1 = require("../middlewares");
const utils_1 = require("../utils");
const types_1 = require("../types/types");
const response_util_1 = require("../utils/response.util");
const services_1 = require("../services");
exports.generatePackageTickets = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const packageId = Number(req.params.id);
    if (!packageId || isNaN(packageId)) {
        return next(new utils_1.ErrorResponse("Invalid package identifier", types_1.statusCode.Bad_Request));
    }
    const existingPackage = yield services_1.TicketPackageService.getById(packageId);
    if (!existingPackage) {
        return next(new utils_1.ErrorResponse("Ticket package not found", types_1.statusCode.Not_Found));
    }
    const { mode, count, ticket_numbers } = req.body;
    if (mode === "random") {
        const ticketCount = Number(count);
        if (isNaN(ticketCount) || ticketCount < 1 || ticketCount > 100) {
            return next(new utils_1.ErrorResponse("Ticket generation count must be a number between 1 and 100", types_1.statusCode.Bad_Request));
        }
        try {
            const generated = yield services_1.PackageTicketService.generateRandomTickets(packageId, ticketCount);
            return (0, response_util_1.SuccessResponse)(res, `Successfully generated ${generated.length} random tickets`, generated, types_1.statusCode.Created);
        }
        catch (err) {
            return next(new utils_1.ErrorResponse(err.message || "Failed to generate tickets", types_1.statusCode.Bad_Request));
        }
    }
    else if (mode === "manual") {
        if (!Array.isArray(ticket_numbers) || ticket_numbers.length === 0) {
            return next(new utils_1.ErrorResponse("ticket_numbers must be a non-empty array of ticket numbers", types_1.statusCode.Bad_Request));
        }
        try {
            const generated = yield services_1.PackageTicketService.generateManualTickets(packageId, ticket_numbers);
            return (0, response_util_1.SuccessResponse)(res, `Successfully added ${generated.length} manual ticket(s)`, generated, types_1.statusCode.Created);
        }
        catch (err) {
            return next(new utils_1.ErrorResponse(err.message || "Failed to add manual tickets", types_1.statusCode.Bad_Request));
        }
    }
    else {
        return next(new utils_1.ErrorResponse("Invalid generation mode. Supported modes are 'random' and 'manual'", types_1.statusCode.Bad_Request));
    }
}));
exports.getPackageTickets = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const packageId = Number(req.params.id);
    if (!packageId || isNaN(packageId)) {
        return next(new utils_1.ErrorResponse("Invalid package identifier", types_1.statusCode.Bad_Request));
    }
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 100;
    let is_sold = undefined;
    if (req.query.is_sold === "true")
        is_sold = true;
    if (req.query.is_sold === "false")
        is_sold = false;
    const result = yield services_1.PackageTicketService.getByPackageId(packageId, is_sold, page, limit);
    return (0, response_util_1.SuccessResponse)(res, "Package tickets fetched successfully", result);
}));
exports.getAvailablePackageTickets = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const packageId = Number(req.params.id);
    if (!packageId || isNaN(packageId)) {
        return next(new utils_1.ErrorResponse("Invalid package identifier", types_1.statusCode.Bad_Request));
    }
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 100;
    const status = req.query.status || "all";
    const result = yield services_1.PackageTicketService.getPublicTickets(packageId, page, limit, status);
    return (0, response_util_1.SuccessResponse)(res, "Package tickets fetched successfully", result);
}));
exports.deletePackageTicket = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const ticketId = Number(req.params.ticketId);
    if (!ticketId || isNaN(ticketId)) {
        return next(new utils_1.ErrorResponse("Invalid ticket identifier", types_1.statusCode.Bad_Request));
    }
    try {
        const deleted = yield services_1.PackageTicketService.deleteById(ticketId);
        return (0, response_util_1.SuccessResponse)(res, "Pre-generated ticket deleted successfully", deleted);
    }
    catch (err) {
        return next(new utils_1.ErrorResponse(err.message || "Failed to delete ticket", types_1.statusCode.Bad_Request));
    }
}));
