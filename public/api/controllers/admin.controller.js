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
exports.deleteById = exports.getAdminById = exports.AllAdmins = exports.logout = exports.login = exports.createAdmin = void 0;
const middlewares_1 = require("../middlewares");
const services_1 = require("../services");
const types_1 = require("../types/types");
const utils_1 = require("../utils");
const response_util_1 = require("../utils/response.util");
const validators_1 = require("../validators");
exports.createAdmin = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Validate request body against AdminValidator schema
    const validData = validators_1.AdminValidator.parse(req.body);
    // Ensure only admin roles can be created
    if (validData.role === "admin")
        return next(new utils_1.ErrorResponse("only one admin is allowed", types_1.statusCode.Bad_Request));
    // Check for existing sub-admin and hash password concurrently
    const [existingSubAdmin, hashedPassword] = yield Promise.all([
        services_1.AdminService.findByEmail(validData.email),
        utils_1.Password.hashPassword(validData.password),
    ]);
    // Return error if sub-admin already exists
    if (existingSubAdmin)
        return next(new utils_1.ErrorResponse("Sub Admin already exists", types_1.statusCode.Bad_Request));
    // Create new sub-admin with hashed password
    const newSubAdmin = yield services_1.AdminService.createAdmin(Object.assign(Object.assign({}, validData), { password: hashedPassword }));
    return (0, response_util_1.SuccessResponse)(res, "Sub Admin Created Successfully", newSubAdmin, types_1.statusCode.Created);
}));
exports.login = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    // Validate required fields
    if (!email || !password)
        return next(new utils_1.ErrorResponse("Email and Password are required", types_1.statusCode.Bad_Request));
    // Find admin by email
    const admin = yield services_1.AdminService.findByEmail(email);
    console.log(admin);
    // Verify password and admin existence
    if (!admin || !(yield utils_1.Password.verifyPassword(password, admin.password))) {
        return next(new utils_1.ErrorResponse("Invalid email or Password", types_1.statusCode.Unauthorized));
    }
    // Generate JWT token
    const token = utils_1.jwt.generateToken({
        id: admin.id,
        email: admin.email,
        role: admin.role,
    });
    // Set cookie and send response
    return res
        .status(types_1.statusCode.OK)
        .cookie("token", token, {
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    })
        .header("Authorization", `Bearer ${token}`)
        .json({
        success: true,
        message: "Login successfully",
        token,
        data: admin,
    });
}));
exports.logout = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    return res
        .status(types_1.statusCode.OK)
        .cookie("token", "", {
        secure: process.env.NODE_ENV === "production", //? Secure in production
        sameSite: "strict", //? Prevent CSRF attacks
        expires: new Date(0),
    })
        .json({
        success: true,
        message: "Logout successfully",
    });
}));
exports.AllAdmins = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const admins = yield services_1.AdminService.getAllAdmin();
    return (0, response_util_1.SuccessResponse)(res, "Admins fetched successfully", admins, types_1.statusCode.OK);
}));
exports.getAdminById = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Validate and parse ID parameter
    const id = Number(req.params.id);
    if (isNaN(id) || !id)
        return next(new utils_1.ErrorResponse("Invalid ID", types_1.statusCode.Bad_Request));
    // Find admin by ID
    const admin = yield services_1.AdminService.findById(id);
    if (!admin)
        return next(new utils_1.ErrorResponse("admin or sub admin not found", types_1.statusCode.Not_Found));
    return (0, response_util_1.SuccessResponse)(res, "sub admin fetched successfully", admin);
}));
exports.deleteById = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Validate and parse ID parameter
    const id = Number(req.params.id);
    if (isNaN(id) || !id)
        return next(new utils_1.ErrorResponse("Invalid ID", types_1.statusCode.Bad_Request));
    // Delete admin and check if successful
    const deletedAdmin = yield services_1.AdminService.deleteById(id);
    if (!deletedAdmin)
        return next(new utils_1.ErrorResponse("Sub Admin not found", types_1.statusCode.Not_Found));
    return (0, response_util_1.SuccessResponse)(res, "Sub Admin deleted Successfully");
}));
