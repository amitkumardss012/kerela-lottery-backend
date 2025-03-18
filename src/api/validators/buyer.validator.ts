import { z } from "zod";
import { transaction_status } from "../types/types";

export const BuyerValidator = z.object({
  name: z
    .string({
      required_error: "Full name is required",
      invalid_type_error: "Full name must be a valid string",
    })
    .trim()
    .min(3, "Full name must contain at least 3 characters")
    .max(255, "Full name cannot exceed 255 characters"),

  email: z
    .string({
      required_error: "Email address is required",
      invalid_type_error: "Email must be a valid string",
    })
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address")
    .max(320, "Email address cannot exceed 320 characters"),

  phone: z
    .string({
      required_error: "Contact number is required",
      invalid_type_error: "Contact number must be a valid string",
    })
    .trim()
    .regex(/^\d{10}$/, "Contact number must be exactly 10 digits"),

  state: z
    .string({
      required_error: "State/Region is required",
      invalid_type_error: "State/Region must be a valid string",
    })
    .trim()
    .min(2, "State/Region name must contain at least 2 characters")
    .max(255, "State/Region name cannot exceed 255 characters"),

  lottery_id: z
    .number({
      required_error: "Lottery identifier is required",
      invalid_type_error: "Lottery identifier must be a valid number",
    })
    .int("Lottery identifier must be an integer")
    .positive("Lottery identifier must be a positive number")
    .safe("Lottery identifier must be within safe integer limits"),

  ticket_package_id: z
    .number({
      required_error: "Package identifier is required",
      invalid_type_error: "Package identifier must be a valid number",
    })
    .int("Package identifier must be an integer")
    .positive("Package identifier must be a positive number")
    .safe("Package identifier must be within safe integer limits"),

  transaction_id: z.string({
    required_error: "Transaction identifier is required",
    invalid_type_error: "Transaction identifier must be a valid string",
  }).trim(),

  transaction_status: z
    .nativeEnum(transaction_status, {
      errorMap: () => ({
        message: "Transaction status must be one of the valid status types",
      }),
    })
    .default(transaction_status.Not_Varified)
    .optional(),
});

export default BuyerValidator;

export type BuyerType = z.infer<typeof BuyerValidator>;
