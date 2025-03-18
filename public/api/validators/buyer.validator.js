"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuyerValidator = void 0;
const zod_1 = require("zod");
const types_1 = require("../types/types");
exports.BuyerValidator = zod_1.z.object({
    name: zod_1.z
        .string({
        required_error: "Full name is required",
        invalid_type_error: "Full name must be a valid string",
    })
        .trim()
        .min(3, "Full name must contain at least 3 characters")
        .max(255, "Full name cannot exceed 255 characters"),
    email: zod_1.z
        .string({
        required_error: "Email address is required",
        invalid_type_error: "Email must be a valid string",
    })
        .trim()
        .toLowerCase()
        .email("Please provide a valid email address")
        .max(320, "Email address cannot exceed 320 characters"),
    phone: zod_1.z
        .string({
        required_error: "Contact number is required",
        invalid_type_error: "Contact number must be a valid string",
    })
        .trim()
        .regex(/^\d{10}$/, "Contact number must be exactly 10 digits"),
    state: zod_1.z
        .string({
        required_error: "State/Region is required",
        invalid_type_error: "State/Region must be a valid string",
    })
        .trim()
        .min(2, "State/Region name must contain at least 2 characters")
        .max(255, "State/Region name cannot exceed 255 characters"),
    lottery_id: zod_1.z
        .number({
        required_error: "Lottery identifier is required",
        invalid_type_error: "Lottery identifier must be a valid number",
    })
        .int("Lottery identifier must be an integer")
        .positive("Lottery identifier must be a positive number")
        .safe("Lottery identifier must be within safe integer limits"),
    ticket_package_id: zod_1.z
        .number({
        required_error: "Package identifier is required",
        invalid_type_error: "Package identifier must be a valid number",
    })
        .int("Package identifier must be an integer")
        .positive("Package identifier must be a positive number")
        .safe("Package identifier must be within safe integer limits"),
    transaction_id: zod_1.z.string({
        required_error: "Transaction identifier is required",
        invalid_type_error: "Transaction identifier must be a valid string",
    }).trim(),
    transaction_status: zod_1.z
        .nativeEnum(types_1.transaction_status, {
        errorMap: () => ({
            message: "Transaction status must be one of the valid status types",
        }),
    })
        .default(types_1.transaction_status.Not_Varified)
        .optional(),
});
exports.default = exports.BuyerValidator;
