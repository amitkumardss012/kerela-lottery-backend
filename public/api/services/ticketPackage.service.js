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
class TicketPackageService {
    static create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const ticketPackage = yield config_1.prisma.ticketpackage.create({
                data: Object.assign(Object.assign({}, data), { updatedAt: new Date() }),
                include: {
                    lottery: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });
            return ticketPackage;
        });
    }
    static getAllActive() {
        return __awaiter(this, void 0, void 0, function* () {
            const ticketPackages = yield config_1.prisma.ticketpackage.findMany({
                where: {
                    is_active: true,
                },
                include: {
                    lottery: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
            return ticketPackages;
        });
    }
    static getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const ticketPackages = yield config_1.prisma.ticketpackage.findMany({
                include: {
                    lottery: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
            return ticketPackages;
        });
    }
    static getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const ticketPackage = yield config_1.prisma.ticketpackage.findUnique({
                where: {
                    id,
                },
                include: {
                    lottery: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });
            return ticketPackage;
        });
    }
    static update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const ticketPackage = yield config_1.prisma.ticketpackage.update({
                where: {
                    id,
                },
                data,
                include: {
                    lottery: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });
            return ticketPackage;
        });
    }
    static deleteById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const ticketPackage = yield config_1.prisma.ticketpackage.delete({
                where: {
                    id,
                },
                select: {
                    id: true,
                    image: true,
                },
            });
            return ticketPackage;
        });
    }
}
exports.default = TicketPackageService;
