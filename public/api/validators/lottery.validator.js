"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
/**
 * Validator schema for Lottery entity
 * Defines validation rules for lottery-related data
 */
const LotteryValidator = zod_1.z.object({
    name: zod_1.z
        .string({
        required_error: "Name is required",
        invalid_type_error: "Name must be a string",
    })
        .min(3, "Name must be at least 3 characters long")
        .max(50, "Name must be at most 50 characters long")
        .trim()
        .nonempty("Name is required"),
    result_date: zod_1.z
        .string({
        required_error: "Result date is required",
        invalid_type_error: "Result date must be a string",
    })
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use YYYY-MM-DD"),
    result_time: zod_1.z
        .string({
        required_error: "Result time is required",
        invalid_type_error: "Result time must be a string",
    })
        .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format. Use HH:mm"),
    is_active: zod_1.z
        .boolean({
        invalid_type_error: "Active status must be a boolean",
    })
        .default(true)
        .optional(),
});
/**
 * Export the validator schema and its inferred type
 */
exports.default = LotteryValidator;
