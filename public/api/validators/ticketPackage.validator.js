"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const numberCoerce = (val) => {
    if (val === null || val === undefined || (typeof val === "string" && val.trim() === ""))
        return null;
    if (typeof val === "string" && val.trim() !== "") {
        const num = Number(val);
        return isNaN(num) ? val : num;
    }
    return val;
};
const booleanCoerce = (val) => {
    if (typeof val === "string")
        return val === "true";
    return val;
};
const TicketPackageValidator = zod_1.z.object({
    name: zod_1.z
        .string({ required_error: "Name is required" })
        .min(2, { message: "Name must be at least 2 characters long" })
        .max(100, { message: "Name must not exceed 100 characters" })
        .trim(),
    description: zod_1.z.string().optional().nullable(),
    badge: zod_1.z
        .preprocess((val) => (typeof val === "string" && val.trim() === "" ? null : val), zod_1.z
        .enum([
        "POPULAR",
        "BEST_VALUE",
        "RECOMMENDED",
        "HOT_DEAL",
        "EXCLUSIVE",
        "LIMITED_OFFER",
    ])
        .optional()
        .nullable()),
    image: zod_1.z.any().optional().nullable(),
    number_of_tickets: zod_1.z.preprocess(numberCoerce, zod_1.z.number({ required_error: "Number of tickets is required" }).min(1)),
    paid_tickets: zod_1.z.preprocess(numberCoerce, zod_1.z.number({ required_error: "Paid tickets is required" }).min(0)),
    free_tickets: zod_1.z.preprocess(numberCoerce, zod_1.z.number().min(0).default(0).optional().nullable()),
    price: zod_1.z.preprocess(numberCoerce, zod_1.z.number({ required_error: "Price is required" }).min(0)),
    original_price: zod_1.z.preprocess(numberCoerce, zod_1.z.number().min(0).optional().nullable()),
    savings_text: zod_1.z.string().optional().nullable(),
    odds_multiplier_text: zod_1.z.string().optional().nullable(),
    bonus_perks: zod_1.z.any().optional().nullable(),
    // valid_until: z
    //   .preprocess((val) => {
    //     if (typeof val === "string" && val.trim() !== "") return new Date(val);
    //     return val;
    //   }, z.date().optional().nullable()),
    is_active: zod_1.z
        .preprocess(booleanCoerce, zod_1.z.boolean().default(true).optional()),
    lottery_id: zod_1.z.preprocess(numberCoerce, zod_1.z.number().optional().nullable()),
});
exports.default = TicketPackageValidator;
