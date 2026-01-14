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
class AdminService {
    static createAdmin(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const admin = yield config_1.prisma.admin.create({
                data: {
                    name: data.name,
                    email: data.email,
                    password: data.password,
                    role: 'sub_admin',
                    updatedAt: new Date(),
                },
            });
            return admin;
        });
    }
    static findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const admin = yield config_1.prisma.admin.findUnique({
                where: {
                    email
                }, select: {
                    id: true,
                    email: true,
                    role: true,
                    password: true,
                }
            });
            return admin;
        });
    }
    static getAllAdmin() {
        return __awaiter(this, void 0, void 0, function* () {
            const admin = yield config_1.prisma.admin.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                },
                orderBy: [
                    { createdAt: "desc" }
                ]
            });
            return admin;
        });
    }
    static findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const admin = yield config_1.prisma.admin.findUnique({
                where: {
                    id
                }, select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                }
            });
            return admin;
        });
    }
    static deleteById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const admin = yield config_1.prisma.admin.delete({
                where: {
                    id
                },
                select: {
                    id: true,
                }
            });
            return admin;
        });
    }
}
exports.default = AdminService;
