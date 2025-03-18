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
exports.allowSubAdmin = exports.isAdmin = exports.authenticate = void 0;
const services_1 = require("../services");
const types_1 = require("../types/types");
const utils_1 = require("../utils");
const error_middleware_1 = require("./error.middleware");
exports.authenticate = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    const tokenFromCookie = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token;
    const tokenFromHeader = ((_c = (_b = req.headers["authorization"]) === null || _b === void 0 ? void 0 : _b.split("Bearer ")[1]) === null || _c === void 0 ? void 0 : _c.trim()) ||
        ((_e = (_d = req.headers.cookie) === null || _d === void 0 ? void 0 : _d.split("=")[1]) === null || _e === void 0 ? void 0 : _e.trim());
    const tokenFromHeader2 = (_g = (_f = req.headers["authorization"]) === null || _f === void 0 ? void 0 : _f.split("Bearer ")[1]) === null || _g === void 0 ? void 0 : _g.trim();
    const token = tokenFromCookie || tokenFromHeader || tokenFromHeader2;
    if (!token) {
        return next(new utils_1.ErrorResponse("Not authorized, token missing", types_1.statusCode.Unauthorized));
    }
    let decoded;
    try {
        decoded = utils_1.jwt.verifyToken(token);
    }
    catch (error) {
        return next(new utils_1.ErrorResponse("Invalid or expired token", types_1.statusCode.Unauthorized));
    }
    const admin = yield services_1.AdminService.findById(decoded === null || decoded === void 0 ? void 0 : decoded.id);
    if (!admin) {
        return next(new utils_1.ErrorResponse("Not authorized, admin or Sub Admin not found", types_1.statusCode.Unauthorized));
    }
    req.admin = Object.assign(Object.assign({}, admin), { id: admin.id.toString() });
    next();
}));
exports.isAdmin = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (((_a = req.admin) === null || _a === void 0 ? void 0 : _a.role) === "admin")
        next();
    else {
        return next(new utils_1.ErrorResponse("Permission Denied", types_1.statusCode.Forbidden));
    }
}));
exports.allowSubAdmin = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    if (((_a = req.admin) === null || _a === void 0 ? void 0 : _a.role) === "admin" || ((_b = req.admin) === null || _b === void 0 ? void 0 : _b.role) === "sub_admin")
        next();
    else {
        return next(new utils_1.ErrorResponse("Permission Denied", types_1.statusCode.Forbidden));
    }
}));
