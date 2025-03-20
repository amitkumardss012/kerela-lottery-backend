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
exports.getWinnerByLotteryId = exports.markAsClaimed = exports.searchWinner = exports.getWinnerById = exports.getAllWinners = exports.deleteWinner = exports.updateWinner = exports.createWinner = void 0;
const middlewares_1 = require("../middlewares");
const services_1 = require("../services");
const types_1 = require("../types/types");
const response_util_1 = require("../utils/response.util");
const validators_1 = require("../validators");
const config_1 = require("../../config");
exports.createWinner = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const validatedData = validators_1.WinnerValdator.parse(req.body);
    const lottery = yield services_1.LotteryService.getById(Number(validatedData.lottery_id));
    if (!lottery)
        return next(new response_util_1.ErrorResponse("Lottery not found", types_1.statusCode.Not_Found));
    const existingWinner = yield config_1.prisma.winner.findFirst({
        where: {
            OR: [
                {
                    phone: {
                        equals: validatedData.phone,
                    },
                },
                {
                    email: {
                        equals: validatedData.email,
                    },
                },
            ],
        },
    });
    if (existingWinner)
        return next(new response_util_1.ErrorResponse("Winner with the same email and phone already exists", types_1.statusCode.Conflict));
    const winner = yield services_1.WinnerService.createWinner(validatedData);
    return (0, response_util_1.SuccessResponse)(res, "Winner created successfully", winner, types_1.statusCode.Created);
}));
exports.updateWinner = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (!id || isNaN(id))
        return next(new response_util_1.ErrorResponse("Invalid id", types_1.statusCode.Bad_Request));
    const validatedData = validators_1.WinnerValdator.partial().parse(req.body);
    const winner = yield services_1.WinnerService.updateWinnerById(id, validatedData);
    if (!winner)
        return next(new response_util_1.ErrorResponse("Winner not found", types_1.statusCode.Not_Found));
    return (0, response_util_1.SuccessResponse)(res, "Winner updated successfully", winner, types_1.statusCode.OK);
}));
exports.deleteWinner = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (!id || isNaN(id))
        return next(new response_util_1.ErrorResponse("Invalid or missing ID", types_1.statusCode.Bad_Request));
    const winner = yield services_1.WinnerService.deleteWinnerById(id);
    if (!winner)
        return next(new response_util_1.ErrorResponse("Winner not found", types_1.statusCode.Not_Found));
    return (0, response_util_1.SuccessResponse)(res, "Winner deleted successfully", winner, types_1.statusCode.OK);
}));
exports.getAllWinners = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const [winners, total] = yield Promise.all([
        services_1.WinnerService.getAllWinners(page, limit),
        config_1.prisma.winner.count(),
    ]);
    if (page > Math.ceil(total / limit) && total > 0)
        return next(new response_util_1.ErrorResponse("Page not found", types_1.statusCode.Not_Found));
    if (!winners)
        return next(new response_util_1.ErrorResponse("No winners found", types_1.statusCode.Not_Found));
    return (0, response_util_1.SuccessResponse)(res, "Winners fetched successfully", {
        winners,
        currentPage: page,
        totalPage: Math.ceil(total / limit),
        totalWinners: total,
        count: winners.length,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
    });
}));
exports.getWinnerById = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (!id || isNaN(id))
        return next(new response_util_1.ErrorResponse("Invalid id", types_1.statusCode.Bad_Request));
    const winner = yield services_1.WinnerService.getWinnerById(id);
    if (!winner)
        return next(new response_util_1.ErrorResponse("Winner not found", types_1.statusCode.Not_Found));
    return (0, response_util_1.SuccessResponse)(res, "Winner fetched successfully", winner, types_1.statusCode.OK);
}));
exports.searchWinner = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query.query;
    if (!query)
        return next(new response_util_1.ErrorResponse("Query is required", types_1.statusCode.Bad_Request));
    const winner = yield services_1.WinnerService.searchWinner(query);
    if (!winner)
        return next(new response_util_1.ErrorResponse("Winner not found", types_1.statusCode.Not_Found));
    return (0, response_util_1.SuccessResponse)(res, "Winner fetched successfully", winner);
}));
exports.markAsClaimed = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (!id || isNaN(id))
        return next(new response_util_1.ErrorResponse("Invalid id", types_1.statusCode.Bad_Request));
    const winner = yield config_1.prisma.winner.findUnique({ where: { id } });
    if (!winner)
        return next(new response_util_1.ErrorResponse("Winner not found", types_1.statusCode.Not_Found));
    const newClaimStatus = !winner.claimed;
    const updatedWinner = yield config_1.prisma.winner.update({ where: { id }, data: { claimed: newClaimStatus } });
    return (0, response_util_1.SuccessResponse)(res, `Winner ${updatedWinner.name} marked as ${newClaimStatus ? 'claimed' : 'pending'}`, updatedWinner, types_1.statusCode.OK);
}));
exports.getWinnerByLotteryId = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (!id || isNaN(id))
        return next(new response_util_1.ErrorResponse("Invalid id", types_1.statusCode.Bad_Request));
    const winner = yield services_1.WinnerService.getWinnerByLottery(id);
    if (!winner)
        return next(new response_util_1.ErrorResponse("Winner not found", types_1.statusCode.Not_Found));
    return (0, response_util_1.SuccessResponse)(res, "Winner fetched successfully", winner, types_1.statusCode.OK);
}));
