import { z } from "zod";

export const UpsertLeadValidator = z.object({
  name: z
    .string({
      required_error: "Full name is required",
      invalid_type_error: "Full name must be a valid string",
    })
    .trim()
    .min(2, "Full name must contain at least 2 characters")
    .max(255, "Full name cannot exceed 255 characters"),

  phone: z
    .string({
      required_error: "Contact number is required",
      invalid_type_error: "Contact number must be a valid string",
    })
    .trim()
    .regex(/^\d{10}$/, "Contact number must be exactly 10 digits"),

  email: z
    .string({
      required_error: "Email address is required",
      invalid_type_error: "Email must be a valid string",
    })
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address")
    .max(320, "Email address cannot exceed 320 characters"),

  state: z
    .string({
      required_error: "State is required",
      invalid_type_error: "State must be a valid string",
    })
    .trim()
    .min(2, "State name must contain at least 2 characters")
    .max(255, "State name cannot exceed 255 characters"),

  lottery_id: z
    .number({
      invalid_type_error: "Lottery ID must be a number",
    })
    .int()
    .positive()
    .nullable()
    .optional(),

  ticket_package_id: z
    .number({
      invalid_type_error: "Ticket package ID must be a number",
    })
    .int()
    .positive()
    .nullable()
    .optional(),

  selected_tickets: z
    .array(z.string())
    .optional(),

  lead_submission_id: z
    .number({
      invalid_type_error: "Lead submission ID must be a number",
    })
    .int()
    .positive()
    .optional(),
});

export const UpdateLeadTransactionValidator = z.object({
  lead_submission_id: z
    .number({
      invalid_type_error: "Lead submission ID must be a number",
    })
    .int()
    .positive()
    .nullable()
    .optional(),

  phone: z
    .string({
      required_error: "Contact number is required",
      invalid_type_error: "Contact number must be a valid string",
    })
    .trim()
    .regex(/^\d{10}$/, "Contact number must be exactly 10 digits"),

  transaction_id: z
    .string({
      required_error: "Transaction ID is required",
      invalid_type_error: "Transaction ID must be a valid string",
    })
    .trim()
    .min(1, "Transaction ID cannot be empty"),
});

export const GetAllLeadsQueryValidator = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  search: z.string().optional(),
  lead_status: z.string().optional(),
  lead_submission_status: z.string().optional(),
  assigned_sub_admin_id: z.string().optional().transform((val) => (val ? parseInt(val, 10) : undefined)),
  ticket_package_id: z.string().optional().transform((val) => (val ? parseInt(val, 10) : undefined)),
  lottery_id: z.string().optional().transform((val) => (val ? parseInt(val, 10) : undefined)),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const UpdateLeadStatusValidator = z.object({
  status: z.enum([
    "NEW",
    "CONTACTED",
    "PAYMENT_PENDING",
    "VERIFIED",
    "CONVERTED",
    "REJECTED",
    "LOST",
  ]),
  notes: z.string().optional(),
  assigned_sub_admin_id: z.number().int().positive().nullable().optional(),
});

export const UpdateLeadNotesValidator = z.object({
  notes: z
    .string({
      required_error: "Notes content is required",
    })
    .max(5000, "Notes cannot exceed 5000 characters"),
});

export const AssignLeadValidator = z.object({
  assigned_sub_admin_id: z
    .number({
      invalid_type_error: "Assigned Sub-Admin ID must be a number",
    })
    .int()
    .positive()
    .nullable(),
});

export const BulkUpdateLeadStatusValidator = z.object({
  lead_ids: z
    .array(z.number().int().positive(), {
      required_error: "lead_ids array is required",
    })
    .min(1, "At least one lead ID is required")
    .max(25, "Cannot select more than 25 leads at a time"),
  status: z.enum([
    "NEW",
    "CONTACTED",
    "PAYMENT_PENDING",
    "VERIFIED",
    "CONVERTED",
    "REJECTED",
    "LOST",
  ]),
});

export const BulkAssignLeadValidator = z.object({
  lead_ids: z
    .array(z.number().int().positive(), {
      required_error: "lead_ids array is required",
    })
    .min(1, "At least one lead ID is required")
    .max(25, "Cannot select more than 25 leads at a time"),
  assigned_sub_admin_id: z
    .number({
      invalid_type_error: "Assigned Sub-Admin ID must be a number",
    })
    .int()
    .positive()
    .nullable(),
});

export const BulkDeleteLeadsValidator = z.object({
  lead_ids: z
    .array(z.number().int().positive(), {
      required_error: "lead_ids array is required",
    })
    .min(1, "At least one lead ID is required")
    .max(25, "Cannot select more than 25 leads at a time"),
});


export const UpdateSubmissionStatusValidator = z.object({
  status: z
    .enum(["FORM_SUBMITTED", "TRANSACTION_ENTERED", "COMPLETED", "ABANDONED"])
    .optional(),
  transaction_id: z.string().nullable().optional(),
  step_reached: z.number().int().min(1).max(3).optional(),
});

export type UpsertLeadType = z.infer<typeof UpsertLeadValidator>;
export type UpdateLeadTransactionType = z.infer<typeof UpdateLeadTransactionValidator>;
export type GetAllLeadsQueryType = z.infer<typeof GetAllLeadsQueryValidator>;
export type UpdateLeadStatusType = z.infer<typeof UpdateLeadStatusValidator>;
export type UpdateLeadNotesType = z.infer<typeof UpdateLeadNotesValidator>;
export type AssignLeadType = z.infer<typeof AssignLeadValidator>;
export type BulkUpdateLeadStatusType = z.infer<typeof BulkUpdateLeadStatusValidator>;
export type BulkAssignLeadType = z.infer<typeof BulkAssignLeadValidator>;
export type BulkDeleteLeadsType = z.infer<typeof BulkDeleteLeadsValidator>;
export type UpdateSubmissionStatusType = z.infer<typeof UpdateSubmissionStatusValidator>;
