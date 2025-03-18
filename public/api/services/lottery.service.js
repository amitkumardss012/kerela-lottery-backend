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
const config_1 = require("../../config");
class LotteryService {
    static create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const lottery = yield config_1.prisma.lottery.create({
                data: Object.assign(Object.assign({}, data), { updatedAt: new Date() })
            });
            return lottery;
        });
    }
    static getAllActive() {
        return __awaiter(this, void 0, void 0, function* () {
            const lotteries = yield config_1.prisma.lottery.findMany({
                where: {
                    is_active: true
                },
                select: {
                    id: true,
                    name: true,
                    result_time: true,
                    result_date: true,
                    is_active: true,
                    createdAt: true,
                },
                orderBy: { createdAt: "desc" }
            });
            return lotteries;
        });
    }
    static getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const lotteries = yield config_1.prisma.lottery.findMany({
                select: {
                    id: true,
                    name: true,
                    result_time: true,
                    result_date: true,
                    is_active: true,
                },
                orderBy: { createdAt: "desc" }
            });
            return lotteries;
        });
    }
    static getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const lottery = yield config_1.prisma.lottery.findUnique({
                where: {
                    id
                },
                select: {
                    id: true,
                    name: true,
                    result_time: true,
                    result_date: true,
                    is_active: true
                }
            });
            return lottery;
        });
    }
    static update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const lottery = yield config_1.prisma.lottery.update({
                where: {
                    id
                },
                data
            });
            return lottery;
        });
    }
    static delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const lottery = yield config_1.prisma.lottery.delete({
                where: {
                    id
                },
                select: {
                    id: true,
                }
            });
            return lottery;
        });
    }
}
exports.default = LotteryService;
