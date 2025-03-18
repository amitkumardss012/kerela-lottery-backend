"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const AdminValidator = zod_1.z
    .object({
    name: zod_1.z
        .string({ required_error: "Name is required" })
        .min(2, { message: "Name must be at least 2 characters long" })
        .max(50, { message: "Name must not exceed 50 characters" })
        .trim()
        .nonempty({ message: "Name is required" }),
    email: zod_1.z
        .string({ required_error: "Email is required" })
        .email({ message: "Invalid email format" })
        .toLowerCase()
        .trim()
        .nonempty({ message: "Email is required" }),
    password: zod_1.z
        .string({ required_error: "Password is required" })
        .min(8, { message: "Password must be at least 8 characters long" })
        .max(100, { message: "Password must not exceed 100 characters" })
        .nonempty({
        message: "Password is required",
    }),
    role: zod_1.z.enum(["admin", "sub_admin"]).default("sub_admin").optional(),
})
    .strict("no extra field allowed");
exports.default = AdminValidator;
