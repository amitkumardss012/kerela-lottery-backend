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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../../config");
class EnquiryService {
    static getAllEnquiries() {
        return __awaiter(this, arguments, void 0, function* (page = 1, limit = 10) {
            const enquiries = yield config_1.prisma.enquiry.findMany({
                take: limit,
                skip: (page - 1) * limit,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    subject: true,
                    message: true,
                    isRead: true,
                    createdAt: true,
                },
                orderBy: [
                    { isRead: "asc" }, // First sort by isRead (ascending)
                    { createdAt: "desc" } // Then sort by createdAt (descending)
                ]
            });
            return enquiries;
        });
    }
    static getEnquiryById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const enquiry = yield config_1.prisma.enquiry.findUnique({
                where: {
                    id
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    subject: true,
                    message: true,
                    isRead: true,
                    createdAt: true,
                }
            });
            return enquiry;
        });
    }
    static getUnreadEnquiries() {
        return __awaiter(this, void 0, void 0, function* () {
            const enquiries = yield config_1.prisma.enquiry.findMany({
                where: {
                    isRead: false
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    subject: true,
                    message: true,
                    isRead: true,
                    createdAt: true,
                }
            });
            return enquiries;
        });
    }
    static markEnquiryAsRead(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const enquiry = yield config_1.prisma.enquiry.update({
                where: {
                    id
                },
                data: {
                    isRead: true
                }
            });
            return enquiry;
        });
    }
    static deleteEnquiry(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const enquiry = yield config_1.prisma.enquiry.delete({
                where: {
                    id
                },
                select: {
                    id: true,
                }
            });
            return enquiry;
        });
    }
}
_a = EnquiryService;
EnquiryService.createEnquiry = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const enquiry = yield config_1.prisma.enquiry.create({
        data: Object.assign(Object.assign({}, data), { updatedAt: new Date() })
    });
    return enquiry;
});
exports.default = EnquiryService;
