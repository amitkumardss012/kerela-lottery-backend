"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const TicketPackageValidator = zod_1.z.object({
    name: zod_1.z
        .string({ required_error: "Name is required" })
        .min(2, { message: "Name must be at least 2 characters long" })
        .max(50, { message: "Name must not exceed 50 characters" })
        .trim()
        .nonempty({ message: "Name is required" }),
    number_of_tickets: zod_1.z
        .number({ required_error: "Number of tickets is required" })
        .min(1, { message: "Number of tickets must be at least 1" })
        .nonnegative({ message: "Number of tickets must be a positive number" }),
    paid_tickets: zod_1.z
        .number({ required_error: "Paid tickets is required" })
        .min(0, { message: "Paid tickets must be at least 0" })
        .nonnegative({ message: "Paid tickets must be a positive number" }),
    free_tickets: zod_1.z
        .number({ required_error: "Free tickets is required" })
        .min(0, { message: "Free tickets must be at least 0" })
        .nonnegative({ message: "Free tickets must be a positive number" })
        .optional(),
    price: zod_1.z
        .number({ required_error: "Price is required" })
        .min(0, { message: "Price must be at least 0" })
        .nonnegative({ message: "Price must be a positive number" }),
    is_active: zod_1.z.boolean().default(true).optional(),
}).strict();
exports.default = TicketPackageValidator;
