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
exports.getUnreadEnquiries = exports.deleteEnquiry = exports.getEnquiryById = exports.getAllEnquiries = exports.createEnquiry = void 0;
const config_1 = require("../../config");
const middlewares_1 = require("../middlewares");
const enquiry_service_1 = __importDefault(require("../services/enquiry.service"));
const types_1 = require("../types/types");
const utils_1 = require("../utils");
const response_util_1 = require("../utils/response.util");
const validators_1 = require("../validators");
exports.createEnquiry = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const validatedData = validators_1.EnquiryValidator.parse(req.body);
    const enquiry = yield enquiry_service_1.default.createEnquiry(validatedData);
    return (0, response_util_1.SuccessResponse)(res, "Enquiry created successfully", enquiry, types_1.statusCode.Created);
}));
exports.getAllEnquiries = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const date = req.query.date; // expecting date in 'YYYY-MM-DD' format
    // Build where condition for date filtering
    let whereCondition = {};
    if (date) {
        // Convert to start and end of the day
        const startDate = new Date(`${date}T00:00:00.000Z`);
        const endDate = new Date(`${date}T23:59:59.999Z`);
        whereCondition = {
            createdAt: {
                gte: startDate,
                lte: endDate
            }
        };
    }
    const [enquiries, totalEnquiries] = yield Promise.all([
        config_1.prisma.enquiry.findMany({
            take: limit,
            skip: (page - 1) * limit,
            where: whereCondition,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                subject: true,
                message: true,
                state: true,
                isRead: true,
                createdAt: true,
            },
            orderBy: [
                { isRead: "asc" },
                { createdAt: "desc" }
            ]
        }),
        config_1.prisma.enquiry.count({
            where: whereCondition
        })
    ]);
    if (page > Math.ceil(totalEnquiries / limit) && totalEnquiries > 0)
        return next(new utils_1.ErrorResponse("Page not found", types_1.statusCode.Not_Found));
    if (!enquiries)
        return next(new utils_1.ErrorResponse("Enquiries not found", types_1.statusCode.Not_Found));
    return (0, response_util_1.SuccessResponse)(res, "Enquiries fetched successfully", {
        enquiries,
        currentPage: page,
        totalPages: Math.ceil(totalEnquiries / limit),
        totalEnquiries,
        count: enquiries.length,
        hasNextPage: page * limit < totalEnquiries,
        hasPreviousPage: page > 1,
    });
}));
exports.getEnquiryById = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (!id || isNaN(id))
        return next(new utils_1.ErrorResponse("Invalid Id", types_1.statusCode.Bad_Request));
    const enquiry = yield enquiry_service_1.default.getEnquiryById(id);
    if (!enquiry)
        return next(new utils_1.ErrorResponse("Enquiry not found", types_1.statusCode.Not_Found));
    if (!enquiry.isRead) {
        yield enquiry_service_1.default.markEnquiryAsRead(id);
    }
    return (0, response_util_1.SuccessResponse)(res, "Enquiry fetched successfully", enquiry);
}));
exports.deleteEnquiry = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (!id || isNaN(id))
        return next(new utils_1.ErrorResponse("Invalid Id", types_1.statusCode.Bad_Request));
    const enquiry = yield enquiry_service_1.default.getEnquiryById(id);
    if (!enquiry)
        return next(new utils_1.ErrorResponse("Enquiry not found", types_1.statusCode.Not_Found));
    const deletedEnquiry = yield enquiry_service_1.default.deleteEnquiry(id);
    if (!deletedEnquiry)
        return next(new utils_1.ErrorResponse("Enquiry not found", types_1.statusCode.Not_Found));
    return (0, response_util_1.SuccessResponse)(res, "Enquiry deleted successfully");
}));
exports.getUnreadEnquiries = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const enquiries = yield enquiry_service_1.default.getUnreadEnquiries();
    return (0, response_util_1.SuccessResponse)(res, "Unread enquiries fetched successfully", enquiries);
}));
