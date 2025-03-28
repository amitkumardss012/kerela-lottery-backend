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
const express_1 = require("express");
const middlewares_1 = require("../middlewares");
const response_util_1 = require("../utils/response.util");
const types_1 = require("../types/types");
const config_1 = require("../../config");
const cloudinary_1 = __importDefault(require("../../config/cloudinary"));
const Qr = (0, express_1.Router)();
Qr.put("/add", middlewares_1.multerUpload.single("image"), (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const phone = req.body.phone;
    const image = req.file;
    if (!image && !phone) {
        return next(new response_util_1.ErrorResponse("Either phone or image is required", types_1.statusCode.Bad_Request));
    }
    if (image) {
        if (!image.mimetype.startsWith("image/")) {
            return next(new response_util_1.ErrorResponse("Only JPEG, PNG, and WEBP images are allowed", types_1.statusCode.Bad_Request));
        }
        if (image.size > 10 * 1024 * 1024) {
            return next(new response_util_1.ErrorResponse("File size must be less than 10MB", types_1.statusCode.Bad_Request));
        }
    }
    if (phone && phone.length !== 10) {
        return next(new response_util_1.ErrorResponse("Phone number must be exactly 10 digits", types_1.statusCode.Bad_Request));
    }
    try {
        // 🔹 Step 1: Find existing QR Code
        let qrCode = yield config_1.prisma.qRCode.findFirst();
        let oldPublicId = null;
        if (qrCode === null || qrCode === void 0 ? void 0 : qrCode.image) {
            const existingImage = qrCode.image;
            oldPublicId = existingImage.public_id;
        }
        let cloudinaryResult = null;
        if (image) {
            // 🔹 Step 2: Upload new image to Cloudinary
            cloudinaryResult = yield (0, config_1.uploadToCloudinary)(image.buffer, config_1.ENV.cloud_folder);
            if (!cloudinaryResult) {
                return next(new response_util_1.ErrorResponse("Failed to upload image to Cloudinary", types_1.statusCode.Internal_Server_Error));
            }
        }
        if (qrCode) {
            // 🔹 Step 3: Update the QR code in DB (Only update provided fields)
            const updateData = { updatedAt: new Date() };
            // Only update phone if provided
            if (phone) {
                updateData.phone = phone;
            }
            // Only update image if a new image was uploaded
            if (cloudinaryResult) {
                updateData.image = {
                    public_id: cloudinaryResult.public_id,
                    secure_url: cloudinaryResult.secure_url,
                };
            }
            qrCode = yield config_1.prisma.qRCode.update({
                where: { id: qrCode.id },
                data: updateData,
            });
            // 🔹 Step 4: Delete old image from Cloudinary (Only if a new image was uploaded)
            if (oldPublicId && cloudinaryResult) {
                const deleteFromCloudinary = yield cloudinary_1.default.uploader.destroy(oldPublicId);
                if ((deleteFromCloudinary === null || deleteFromCloudinary === void 0 ? void 0 : deleteFromCloudinary.result) !== "ok") {
                    return next(new response_util_1.ErrorResponse("Failed to delete old image from Cloudinary", types_1.statusCode.Internal_Server_Error));
                }
            }
        }
        else {
            // 🔹 Step 5: If QR code doesn't exist, create a new one
            qrCode = yield config_1.prisma.qRCode.create({
                data: {
                    phone: phone || "", // Default to empty string if phone is not provided
                    image: cloudinaryResult
                        ? { public_id: cloudinaryResult.public_id, secure_url: cloudinaryResult.secure_url }
                        : undefined,
                    updatedAt: new Date(),
                },
            });
        }
        return (0, response_util_1.SuccessResponse)(res, "QR code updated successfully", qrCode);
    }
    catch (error) {
        return next(new response_util_1.ErrorResponse("Failed to add QR code", types_1.statusCode.Internal_Server_Error));
    }
})));
Qr.get("/get", (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const qrCode = yield config_1.prisma.qRCode.findFirst();
        if (!qrCode) {
            return next(new response_util_1.ErrorResponse("QR code not found", types_1.statusCode.Not_Found));
        }
        return (0, response_util_1.SuccessResponse)(res, "QR code fetched successfully", qrCode);
    }
    catch (error) {
        return next(new response_util_1.ErrorResponse("Failed to fetch QR code", types_1.statusCode.Internal_Server_Error));
    }
})));
exports.default = Qr;
