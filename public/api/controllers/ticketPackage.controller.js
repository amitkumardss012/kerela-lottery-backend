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
exports.deleteTicketPackage = exports.updateTicketPackage = exports.getTicketPackageById = exports.getAllTicketPackages = exports.getAllActiveTicketPackages = exports.createTicketPackage = void 0;
const middlewares_1 = require("../middlewares");
const validators_1 = require("../validators");
const utils_1 = require("../utils");
const types_1 = require("../types/types");
const response_util_1 = require("../utils/response.util");
const ticketPackage_service_1 = __importDefault(require("../services/ticketPackage.service"));
const config_1 = require("../../config");
const cloudinary_1 = __importDefault(require("../../config/cloudinary"));
exports.createTicketPackage = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const validatedData = validators_1.TicketPackageValidator.parse(req.body);
    const totalTickets = validatedData.number_of_tickets;
    const paid = (_a = validatedData.paid_tickets) !== null && _a !== void 0 ? _a : 0;
    const free = (_b = validatedData.free_tickets) !== null && _b !== void 0 ? _b : 0;
    if (totalTickets !== paid + free) {
        return next(new utils_1.ErrorResponse("Total tickets must equal paid tickets + free tickets.", types_1.statusCode.Bad_Request));
    }
    // Handle bonus_perks if passed as JSON string
    let parsedBonusPerks = validatedData.bonus_perks;
    if (typeof parsedBonusPerks === "string" && parsedBonusPerks.trim() !== "") {
        try {
            parsedBonusPerks = JSON.parse(parsedBonusPerks);
        }
        catch (_c) {
            // Keep string if parsing fails
        }
    }
    // Handle Cloudinary image upload
    const imageFile = req.file;
    let imagePayload = null;
    if (imageFile) {
        const folder = config_1.ENV.cloud_folder
            ? `${config_1.ENV.cloud_folder}/ticket_packages`
            : "ticket_packages";
        const result = yield (0, config_1.uploadToCloudinary)(imageFile.buffer, folder);
        imagePayload = result;
    }
    const ticketPackage = yield ticketPackage_service_1.default.create(Object.assign(Object.assign({}, validatedData), { bonus_perks: parsedBonusPerks, image: imagePayload }));
    return (0, response_util_1.SuccessResponse)(res, "Ticket package created successfully", ticketPackage, types_1.statusCode.Created);
}));
exports.getAllActiveTicketPackages = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const ticketPackages = yield ticketPackage_service_1.default.getAllActive();
    return (0, response_util_1.SuccessResponse)(res, "Ticket packages fetched successfully", ticketPackages);
}));
exports.getAllTicketPackages = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const ticketPackages = yield ticketPackage_service_1.default.getAll();
    return (0, response_util_1.SuccessResponse)(res, "Ticket packages fetched successfully", ticketPackages);
}));
exports.getTicketPackageById = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (!id || isNaN(id))
        return next(new utils_1.ErrorResponse("Invalid Id", types_1.statusCode.Bad_Request));
    const ticketPackage = yield ticketPackage_service_1.default.getById(id);
    if (!ticketPackage)
        return next(new utils_1.ErrorResponse("Ticket package not found", types_1.statusCode.Not_Found));
    return (0, response_util_1.SuccessResponse)(res, "Ticket package fetched successfully", ticketPackage);
}));
exports.updateTicketPackage = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const id = Number(req.params.id);
    if (!id || isNaN(id))
        return next(new utils_1.ErrorResponse("Invalid Id", types_1.statusCode.Bad_Request));
    const existingPackage = yield ticketPackage_service_1.default.getById(id);
    if (!existingPackage) {
        return next(new utils_1.ErrorResponse("Ticket package not found", types_1.statusCode.Not_Found));
    }
    const validatedData = validators_1.TicketPackageValidator.partial().parse(req.body);
    const totalTickets = (_a = validatedData.number_of_tickets) !== null && _a !== void 0 ? _a : existingPackage.number_of_tickets;
    const paid = (_b = validatedData.paid_tickets) !== null && _b !== void 0 ? _b : existingPackage.paid_tickets;
    const free = (_d = (_c = validatedData.free_tickets) !== null && _c !== void 0 ? _c : existingPackage.free_tickets) !== null && _d !== void 0 ? _d : 0;
    if (totalTickets !== paid + free) {
        return next(new utils_1.ErrorResponse("Total tickets must equal paid tickets + free tickets.", types_1.statusCode.Bad_Request));
    }
    // Handle bonus_perks string JSON parsing
    let parsedBonusPerks = validatedData.bonus_perks;
    if (typeof parsedBonusPerks === "string" && parsedBonusPerks.trim() !== "") {
        try {
            parsedBonusPerks = JSON.parse(parsedBonusPerks);
        }
        catch (_e) {
            // Keep string
        }
    }
    // Handle image update/upload
    const imageFile = req.file;
    let newImagePayload = undefined;
    if (imageFile) {
        // Destroy old image from Cloudinary if available
        if (existingPackage.image) {
            const oldImg = existingPackage.image;
            if (oldImg === null || oldImg === void 0 ? void 0 : oldImg.public_id) {
                try {
                    yield cloudinary_1.default.uploader.destroy(oldImg.public_id);
                }
                catch (err) {
                    console.error("Failed to delete old package image from Cloudinary:", err);
                }
            }
        }
        const folder = config_1.ENV.cloud_folder
            ? `${config_1.ENV.cloud_folder}/ticket_packages`
            : "ticket_packages";
        const result = yield (0, config_1.uploadToCloudinary)(imageFile.buffer, folder);
        newImagePayload = result;
    }
    const updateData = Object.assign({}, validatedData);
    if (parsedBonusPerks !== undefined) {
        updateData.bonus_perks = parsedBonusPerks;
    }
    if (newImagePayload !== undefined) {
        updateData.image = newImagePayload;
    }
    const updatedPackage = yield ticketPackage_service_1.default.update(id, updateData);
    return (0, response_util_1.SuccessResponse)(res, "Ticket package updated successfully", updatedPackage);
}));
exports.deleteTicketPackage = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (!id || isNaN(id))
        return next(new utils_1.ErrorResponse("Invalid Id", types_1.statusCode.Bad_Request));
    const existingPackage = yield ticketPackage_service_1.default.getById(id);
    if (!existingPackage)
        return next(new utils_1.ErrorResponse("Ticket package not found", types_1.statusCode.Not_Found));
    // Delete image from Cloudinary if exists
    if (existingPackage.image) {
        const oldImg = existingPackage.image;
        if (oldImg === null || oldImg === void 0 ? void 0 : oldImg.public_id) {
            try {
                yield cloudinary_1.default.uploader.destroy(oldImg.public_id);
            }
            catch (err) {
                console.error("Failed to delete package image from Cloudinary on delete:", err);
            }
        }
    }
    yield ticketPackage_service_1.default.deleteById(id);
    return (0, response_util_1.SuccessResponse)(res, "Ticket package deleted successfully", { id });
}));
