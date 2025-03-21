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
exports.toggleBuyerStatus = exports.updateBuyerStatus = exports.searchBuyer = exports.deleteBuyer = exports.getBuyerById = exports.getAllBuyers = exports.BuyLottery = void 0;
const config_1 = require("../../config");
const middlewares_1 = require("../middlewares");
const services_1 = require("../services");
const types_1 = require("../types/types");
const utils_1 = require("../utils");
const response_util_1 = require("../utils/response.util");
const validators_1 = require("../validators");
exports.BuyLottery = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { name, phone, email, state, lottery_id, ticket_package_id, transaction_id, } = validators_1.BuyerValidator.parse(req.body);
    // Check if ticket package exists
    const ticket_package = yield services_1.TicketPackageService.getById(ticket_package_id);
    if (!ticket_package) {
        return next(new utils_1.ErrorResponse("Ticket package not found", types_1.statusCode.Not_Found));
    }
    // Check if a buyer with the same email and phone has already bought this lottery
    const existingBuyerSameLottery = yield config_1.prisma.buyer.findFirst({
        where: {
            email,
            phone,
            lottery_id,
        },
    });
    if (existingBuyerSameLottery) {
        return next(new utils_1.ErrorResponse("You have already bought this lottery with this email and phone", types_1.statusCode.Bad_Request));
    }
    // Check if the transaction_id is already used for any lottery
    if (transaction_id) {
        const existingBuyerWithTransaction = yield config_1.prisma.buyer.findFirst({
            where: {
                transaction_id,
            },
        });
        if (existingBuyerWithTransaction) {
            return next(new utils_1.ErrorResponse("This transaction ID has already been used to buy a lottery", types_1.statusCode.Bad_Request));
        }
    }
    // Calculate total tickets
    const totalTickets = ticket_package.number_of_tickets ||
        ((_a = ticket_package.paid_tickets) !== null && _a !== void 0 ? _a : 0) + ((_b = ticket_package.free_tickets) !== null && _b !== void 0 ? _b : 0) ||
        0;
    // Create the buyer
    const buyer = yield config_1.prisma.buyer.create({
        data: {
            name,
            phone,
            email,
            state,
            lottery_id,
            ticket_package_id,
            transaction_id,
            updatedAt: new Date(),
        },
    });
    // Generate and create tickets
    const tickets = [];
    for (let i = 0; i < totalTickets; i++) {
        const ticketNumber = yield (0, utils_1.GenerateUniqueTicketNumber)(lottery_id);
        tickets.push({
            buyer_id: buyer.id,
            lottery_id,
            ticket_package_id,
            ticket_number: ticketNumber || "",
            transaction_id: transaction_id || "",
            updatedAt: new Date(),
        });
    }
    yield config_1.prisma.ticket.createMany({
        data: tickets,
    });
    return (0, response_util_1.SuccessResponse)(res, "Lottery bought successfully", {
        buyer,
        tickets,
        ticket_package: ticket_package.name,
    }, types_1.statusCode.Created);
}));
exports.getAllBuyers = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const [buyers, totalBuyers] = yield Promise.all([
        config_1.prisma.buyer.findMany({
            skip: (page - 1) * limit,
            take: limit,
            include: {
                lottery: true,
                ticketpackage: true,
            },
        }),
        config_1.prisma.buyer.count(),
    ]);
    if (page > Math.ceil(totalBuyers / limit) && totalBuyers > 0) {
        return next(new utils_1.ErrorResponse("Page not found", types_1.statusCode.Not_Found));
    }
    return (0, response_util_1.SuccessResponse)(res, "Buyers fetched successfully", {
        buyers,
        currentPage: page,
        totalPages: Math.ceil(totalBuyers / limit),
        totalBuyers,
        count: buyers.length,
        hasNextPage: page * limit < totalBuyers,
        hasPrevPage: page > 1,
    });
}));
exports.getBuyerById = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (!id || isNaN(id)) {
        return next(new utils_1.ErrorResponse("Invalid id", types_1.statusCode.Bad_Request));
    }
    const buyer = yield config_1.prisma.buyer.findUnique({
        where: { id },
        include: {
            lottery: true,
            ticketpackage: true,
            ticket: {
                where: {
                    buyer_id: id,
                }
            }
        },
    });
    if (!buyer) {
        return next(new utils_1.ErrorResponse("Buyer not found", types_1.statusCode.Not_Found));
    }
    // Fetch only tickets purchased by this buyer using transaction_id
    // const tickets = await prisma.ticket.findMany({
    //   where: {
    //     transaction_id: buyer.transaction_id ? { equals: buyer.transaction_id } : undefined,
    //   },
    // });
    return (0, response_util_1.SuccessResponse)(res, "Buyer fetched successfully", {
        buyer
    });
}));
exports.deleteBuyer = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (!id || isNaN(id)) {
        return next(new utils_1.ErrorResponse("Invalid id", types_1.statusCode.Bad_Request));
    }
    // Check if buyer exists
    const buyer = yield config_1.prisma.buyer.findUnique({ where: { id } });
    if (!buyer) {
        return next(new utils_1.ErrorResponse("Buyer not found", types_1.statusCode.Not_Found));
    }
    // Fetch tickets associated with this buyer's ticket package
    const tickets = yield config_1.prisma.ticket.findMany({
        where: {
            ticket_package_id: buyer.ticket_package_id || undefined,
        },
    });
    // Delete associated tickets first (due to foreign key constraints)
    yield config_1.prisma.ticket.deleteMany({
        where: {
            ticket_package_id: buyer.ticket_package_id || undefined,
        },
    });
    // Delete the buyer
    const deletedBuyer = yield config_1.prisma.buyer.delete({
        where: { id },
    });
    return (0, response_util_1.SuccessResponse)(res, "Buyer deleted successfully", deletedBuyer);
}));
exports.searchBuyer = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query.query;
    if (!query) {
        return next(new utils_1.ErrorResponse("Query is required", types_1.statusCode.Bad_Request));
    }
    const buyers = yield config_1.prisma.buyer.findMany({
        where: {
            OR: [
                { name: { contains: query } },
                { email: { contains: query } },
                { phone: { contains: query } },
                { state: { contains: query } },
                { transaction_id: { contains: query } },
            ],
        },
        include: {
            lottery: true,
            ticketpackage: true,
        },
    });
    if (!buyers || buyers.length === 0) {
        return next(new utils_1.ErrorResponse("Buyer not found", types_1.statusCode.Not_Found));
    }
    return (0, response_util_1.SuccessResponse)(res, "Buyer fetched successfully", buyers);
}));
// New endpoint to update transaction_status
exports.updateBuyerStatus = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    const { transaction_status } = req.body;
    if (!id || isNaN(id)) {
        return next(new utils_1.ErrorResponse("Invalid id", types_1.statusCode.Bad_Request));
    }
    if (!['not_verified', 'verified', 'failed', 'success', 'refunded', 'rejected'].includes(transaction_status)) {
        return next(new utils_1.ErrorResponse("Invalid transaction status", types_1.statusCode.Bad_Request));
    }
    const buyer = yield config_1.prisma.buyer.update({
        where: { id },
        data: { transaction_status },
        include: {
            lottery: true,
            ticketpackage: true,
            ticket: true,
        },
    });
    if (!buyer) {
        return next(new utils_1.ErrorResponse("Buyer not found", types_1.statusCode.Not_Found));
    }
    return (0, response_util_1.SuccessResponse)(res, "Buyer status updated successfully", buyer, types_1.statusCode.OK);
}));
exports.toggleBuyerStatus = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (!id || isNaN(id)) {
        return next(new utils_1.ErrorResponse("Invalid id", types_1.statusCode.Bad_Request));
    }
    const buyer = yield config_1.prisma.buyer.findUnique({
        where: { id },
    });
    if (!buyer) {
        return next(new utils_1.ErrorResponse("Buyer not found", types_1.statusCode.Not_Found));
    }
    const updatedStatus = buyer.transaction_status === 'verified' ? 'not_verified' : 'verified';
    const updatedBuyer = yield config_1.prisma.buyer.update({
        where: { id },
        data: { transaction_status: updatedStatus },
    });
    return (0, response_util_1.SuccessResponse)(res, "Buyer status updated successfully", updatedBuyer, types_1.statusCode.OK);
}));
