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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../../config");
class WinnerService {
    static createWinner(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { lottery_id } = data, winnerData = __rest(data, ["lottery_id"]);
            const winner = yield config_1.prisma.winner.create({
                data: Object.assign(Object.assign({}, winnerData), { lottery_id: parseInt(lottery_id) })
            });
            return winner;
        });
    }
    static getAllWinners() {
        return __awaiter(this, arguments, void 0, function* (page = 1, limit = 10) {
            const winners = yield config_1.prisma.winner.findMany({
                take: limit,
                skip: (page - 1) * limit,
                select: {
                    id: true,
                    ticket_number: true,
                    name: true,
                    phone: true,
                    email: true,
                    state: true,
                    prize_amount: true,
                    winner_rank: true,
                    lottery_id: true,
                    claimed: true,
                    createdAt: true,
                    lottery: {
                        select: { name: true }
                    }
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
            return winners.map(winner => {
                var _a;
                return (Object.assign(Object.assign({}, winner), { lottery_name: (_a = winner.lottery) === null || _a === void 0 ? void 0 : _a.name // Map to match interface
                 }));
            });
        });
    }
    static getWinnerById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const winner = yield config_1.prisma.winner.findUnique({
                where: {
                    id,
                },
                select: {
                    id: true,
                    ticket_number: true,
                    name: true,
                    phone: true,
                    email: true,
                    state: true,
                    prize_amount: true,
                    winner_rank: true,
                },
            });
            return winner;
        });
    }
    static updateWinnerById(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { lottery_id } = data, updateData = __rest(data, ["lottery_id"]);
            const winner = yield config_1.prisma.winner.update({
                where: {
                    id,
                },
                data: Object.assign(Object.assign({}, updateData), (lottery_id && { lottery_id: parseInt(lottery_id) })),
            });
            return winner;
        });
    }
    static deleteWinnerById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const winner = yield config_1.prisma.winner.delete({
                where: {
                    id,
                },
                select: {
                    id: true,
                },
            });
            return winner;
        });
    }
    static searchWinner(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const winner = yield config_1.prisma.winner.findFirst({
                where: {
                    OR: [
                        {
                            phone: {
                                contains: query,
                            },
                        },
                        {
                            name: {
                                contains: query,
                            },
                        },
                    ],
                },
                select: {
                    id: true,
                    ticket_number: true,
                    name: true,
                    phone: true,
                    email: true,
                    state: true,
                    prize_amount: true,
                    winner_rank: true,
                },
                take: 1, // Limit to return only one result
            });
            return winner;
        });
    }
    static getWinnerByLottery(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const winner = yield config_1.prisma.winner.findMany({
                where: {
                    lottery_id: id,
                },
                select: {
                    id: true,
                    ticket_number: true,
                    name: true,
                    phone: true,
                    email: true,
                    state: true,
                    prize_amount: true,
                },
            });
            return winner;
        });
    }
}
exports.default = WinnerService;
