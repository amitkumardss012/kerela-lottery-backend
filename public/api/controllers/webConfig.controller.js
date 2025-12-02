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
exports.getWebConfig = exports.updateWebConfig = void 0;
const config_1 = require("../../config");
const middlewares_1 = require("../middlewares");
const utils_1 = require("../utils");
const response_util_1 = require("../utils/response.util");
exports.updateWebConfig = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { whatsAppNumber, phoneNumber, email } = req.body;
    if (!whatsAppNumber && !phoneNumber && !email) {
        return next(new utils_1.ErrorResponse("At least one field is required", 400));
    }
    let webConfig = yield config_1.prisma.webConfig.findFirst();
    if (webConfig) {
        webConfig = yield config_1.prisma.webConfig.update({
            where: {
                id: webConfig.id
            },
            data: {
                whatsAppNumber,
                phoneNumber,
                email
            }
        });
    }
    else {
        webConfig = yield config_1.prisma.webConfig.create({
            data: {
                whatsAppNumber,
                phoneNumber,
                email,
                updatedAt: new Date()
            }
        });
    }
    return (0, response_util_1.SuccessResponse)(res, "Web Config updated successfully", webConfig);
}));
exports.getWebConfig = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const webConfig = yield config_1.prisma.webConfig.findFirst();
    return (0, response_util_1.SuccessResponse)(res, "Web Config fetched successfully", webConfig);
}));
