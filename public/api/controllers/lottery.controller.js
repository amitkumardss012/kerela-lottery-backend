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
exports.deleteLottery = exports.getLotteryById = exports.getAllLotteries = exports.getActiveLottery = exports.updateLottery = exports.createLottery = void 0;
const middlewares_1 = require("../middlewares");
const services_1 = require("../services");
const types_1 = require("../types/types");
const response_util_1 = require("../utils/response.util");
const validators_1 = require("../validators");
exports.createLottery = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, result_time, result_date } = validators_1.LotteryValidator.parse(req.body);
    const lottery = yield services_1.LotteryService.create({ name, result_time, result_date });
    return (0, response_util_1.SuccessResponse)(res, "Lottery created successfully", lottery, types_1.statusCode.Created);
}));
exports.updateLottery = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (!id || isNaN(id))
        return next(new response_util_1.ErrorResponse("Invalid id", types_1.statusCode.Bad_Request));
    const validatedData = validators_1.LotteryValidator.partial().parse(req.body);
    const lottery = yield services_1.LotteryService.update(id, validatedData);
    if (!lottery)
        return next(new response_util_1.ErrorResponse("Lottery not found", types_1.statusCode.Not_Found));
    return (0, response_util_1.SuccessResponse)(res, "Lottery updated successfully", lottery);
}));
exports.getActiveLottery = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const lottery = yield services_1.LotteryService.getAllActive();
    return (0, response_util_1.SuccessResponse)(res, "Lottery fetched successfully", lottery);
}));
exports.getAllLotteries = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const lotteries = yield services_1.LotteryService.getAll();
    return (0, response_util_1.SuccessResponse)(res, "Lotteries fetched successfully", lotteries);
}));
exports.getLotteryById = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (!id || isNaN(id))
        return next(new response_util_1.ErrorResponse("Invalid id", types_1.statusCode.Bad_Request));
    const lottery = yield services_1.LotteryService.getById(id);
    return (0, response_util_1.SuccessResponse)(res, "Lottery fetched successfully", lottery);
}));
exports.deleteLottery = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Logic to delete a lottery
}));
