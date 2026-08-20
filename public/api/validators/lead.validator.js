"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSubmissionStatusValidator = exports.BulkDeleteLeadsValidator = exports.BulkAssignLeadValidator = exports.BulkUpdateLeadStatusValidator = exports.AssignLeadValidator = exports.UpdateLeadNotesValidator = exports.UpdateLeadStatusValidator = exports.GetAllLeadsQueryValidator = exports.UpdateLeadTransactionValidator = exports.UpsertLeadValidator = void 0;
const zod_1 = require("zod");
exports.UpsertLeadValidator = zod_1.z.object({
    name: zod_1.z
        .string({
        required_error: "Full name is required",
        invalid_type_error: "Full name must be a valid string",
    })
        .trim()
        .min(2, "Full name must contain at least 2 characters")
        .max(255, "Full name cannot exceed 255 characters"),
    phone: zod_1.z
        .string({
        required_error: "Contact number is required",
        invalid_type_error: "Contact number must be a valid string",
    })
        .trim()
        .regex(/^\d{10}$/, "Contact number must be exactly 10 digits"),
    email: zod_1.z
        .string({
        required_error: "Email address is required",
        invalid_type_error: "Email must be a valid string",
    })
        .trim()
        .toLowerCase()
        .email("Please provide a valid email address")
        .max(320, "Email address cannot exceed 320 characters"),
    state: zod_1.z
        .string({
        required_error: "State is required",
        invalid_type_error: "State must be a valid string",
    })
        .trim()
        .min(2, "State name must contain at least 2 characters")
        .max(255, "State name cannot exceed 255 characters"),
    lottery_id: zod_1.z
        .number({
        invalid_type_error: "Lottery ID must be a number",
    })
        .int()
        .positive()
        .nullable()
        .optional(),
    ticket_package_id: zod_1.z
        .number({
        invalid_type_error: "Ticket package ID must be a number",
    })
        .int()
        .positive()
        .nullable()
        .optional(),
    selected_tickets: zod_1.z
        .array(zod_1.z.string())
        .optional(),
    lead_submission_id: zod_1.z
        .number({
        invalid_type_error: "Lead submission ID must be a number",
    })
        .int()
        .positive()
        .optional(),
});
exports.UpdateLeadTransactionValidator = zod_1.z.object({
    lead_submission_id: zod_1.z
        .number({
        invalid_type_error: "Lead submission ID must be a number",
    })
        .int()
        .positive()
        .nullable()
        .optional(),
    phone: zod_1.z
        .string({
        required_error: "Contact number is required",
        invalid_type_error: "Contact number must be a valid string",
    })
        .trim()
        .regex(/^\d{10}$/, "Contact number must be exactly 10 digits"),
    transaction_id: zod_1.z
        .string({
        required_error: "Transaction ID is required",
        invalid_type_error: "Transaction ID must be a valid string",
    })
        .trim()
        .min(1, "Transaction ID cannot be empty"),
});
exports.GetAllLeadsQueryValidator = zod_1.z.object({
    page: zod_1.z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: zod_1.z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    search: zod_1.z.string().optional(),
    lead_status: zod_1.z.string().optional(),
    lead_submission_status: zod_1.z.string().optional(),
    assigned_sub_admin_id: zod_1.z.string().optional().transform((val) => (val ? parseInt(val, 10) : undefined)),
    ticket_package_id: zod_1.z.string().optional().transform((val) => (val ? parseInt(val, 10) : undefined)),
    lottery_id: zod_1.z.string().optional().transform((val) => (val ? parseInt(val, 10) : undefined)),
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
});
exports.UpdateLeadStatusValidator = zod_1.z.object({
    status: zod_1.z.enum([
        "NEW",
        "CONTACTED",
        "PAYMENT_PENDING",
        "VERIFIED",
        "CONVERTED",
        "REJECTED",
        "LOST",
    ]),
    notes: zod_1.z.string().optional(),
    assigned_sub_admin_id: zod_1.z.number().int().positive().nullable().optional(),
});
exports.UpdateLeadNotesValidator = zod_1.z.object({
    notes: zod_1.z
        .string({
        required_error: "Notes content is required",
    })
        .max(5000, "Notes cannot exceed 5000 characters"),
});
exports.AssignLeadValidator = zod_1.z.object({
    assigned_sub_admin_id: zod_1.z
        .number({
        invalid_type_error: "Assigned Sub-Admin ID must be a number",
    })
        .int()
        .positive()
        .nullable(),
});
exports.BulkUpdateLeadStatusValidator = zod_1.z.object({
    lead_ids: zod_1.z
        .array(zod_1.z.number().int().positive(), {
        required_error: "lead_ids array is required",
    })
        .min(1, "At least one lead ID is required")
        .max(25, "Cannot select more than 25 leads at a time"),
    status: zod_1.z.enum([
        "NEW",
        "CONTACTED",
        "PAYMENT_PENDING",
        "VERIFIED",
        "CONVERTED",
        "REJECTED",
        "LOST",
    ]),
});
exports.BulkAssignLeadValidator = zod_1.z.object({
    lead_ids: zod_1.z
        .array(zod_1.z.number().int().positive(), {
        required_error: "lead_ids array is required",
    })
        .min(1, "At least one lead ID is required")
        .max(25, "Cannot select more than 25 leads at a time"),
    assigned_sub_admin_id: zod_1.z
        .number({
        invalid_type_error: "Assigned Sub-Admin ID must be a number",
    })
        .int()
        .positive()
        .nullable(),
});
exports.BulkDeleteLeadsValidator = zod_1.z.object({
    lead_ids: zod_1.z
        .array(zod_1.z.number().int().positive(), {
        required_error: "lead_ids array is required",
    })
        .min(1, "At least one lead ID is required")
        .max(25, "Cannot select more than 25 leads at a time"),
});
exports.UpdateSubmissionStatusValidator = zod_1.z.object({
    status: zod_1.z
        .enum(["FORM_SUBMITTED", "TRANSACTION_ENTERED", "COMPLETED", "ABANDONED"])
        .optional(),
    transaction_id: zod_1.z.string().nullable().optional(),
    step_reached: zod_1.z.number().int().min(1).max(3).optional(),
});
