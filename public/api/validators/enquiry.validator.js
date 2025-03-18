"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const EnquiryValidator = zod_1.z.object({
    name: zod_1.z
        .string({ required_error: "Name is required" })
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name cannot exceed 100 characters")
        .nonempty("Name is required"),
    email: zod_1.z
        .string()
        .trim()
        .toLowerCase()
        .email("Please enter a valid email address")
        .min(5, "Email must be at least 5 characters")
        .max(254, "Email cannot exceed 254 characters")
        .nonempty("Email is required"),
    phone: zod_1.z
        .string()
        .trim()
        .length(10, "Phone number must be exactly 10 digits")
        .regex(/^[0-9]+$/, "Phone number can only contain digits")
        .nonempty("Phone is required"),
    subject: zod_1.z
        .string()
        .trim()
        .min(3, "Subject must be at least 3 characters")
        .max(200, "Subject cannot exceed 200 characters")
        .nonempty("Subject cannot be empty"),
    message: zod_1.z
        .string()
        .trim()
        .min(10, "Message must be at least 10 characters")
        .max(1000, "Message cannot exceed 1000 characters")
        .nonempty("Message cannot be empty"),
    isRead: zod_1.z
        .boolean()
        .default(false)
        .optional()
}).strict();
exports.default = EnquiryValidator;
