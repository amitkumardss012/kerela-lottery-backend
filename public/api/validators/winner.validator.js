"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WinnerValdator = void 0;
const zod_1 = require("zod");
exports.WinnerValdator = zod_1.z.object({
    name: zod_1.z
        .string({ required_error: "Name is required" })
        .min(3, "Name must be at least 3 characters long")
        .max(50, "Name must be at most 50 characters long")
        .nonempty("Name is required")
        .trim(),
    email: zod_1.z
        .string({ required_error: "Email is required" })
        .email("Invalid email format")
        .nonempty("Email is required")
        .trim(),
    phone: zod_1.z
        .string({ required_error: "Phone is required" })
        .min(10, "Phone number must be at least 10 characters long")
        .max(10, "Phone number must be at most 10 characters long")
        .nonempty("Phone number is required")
        .trim(),
    state: zod_1.z
        .string({ required_error: "State is required" })
        .nonempty("State is required")
        .trim(),
    lottery_id: zod_1.z
        .string({ required_error: "Lottery ID is required" })
        .nonempty("Lottery ID is required"),
    ticket_number: zod_1.z
        .string({ required_error: "Ticket ID is required" })
        .nonempty("Ticket ID is required")
        .trim(),
    prize_amount: zod_1.z
        .string({ required_error: "Prize Amount is required" })
        .nonempty("Prize Amount is required")
        .trim(),
    winner_rank: zod_1.z.string().optional(),
}).strict();
exports.default = exports.WinnerValdator;
