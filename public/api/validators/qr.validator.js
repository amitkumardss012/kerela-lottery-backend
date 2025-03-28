"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const QrValidator = zod_1.z.object({
    phone: zod_1.z
        .string({
        required_error: "Phone number is required",
    })
        .regex(/^\d{10}$/, "Phone number must be exactly 10 digits")
        .nonempty("Phone number is required")
        .trim()
        .optional(),
    image: zod_1.z
        .object({
        mimetype: zod_1.z.string().refine((val) => val.startsWith("image/"), {
            message: "File must be an image",
        }),
        size: zod_1.z.number().max(2 * 1024 * 1024, "File size must be less than 2MB"),
    })
        .optional(),
});
exports.default = QrValidator;
