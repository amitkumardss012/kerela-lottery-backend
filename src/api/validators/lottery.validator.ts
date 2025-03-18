import { z } from "zod";
/**
 * Validator schema for Lottery entity
 * Defines validation rules for lottery-related data
 */
const LotteryValidator = z.object({
  name: z
    .string({
      required_error: "Name is required",
      invalid_type_error: "Name must be a string",
    })
    .min(3, "Name must be at least 3 characters long")
    .max(50, "Name must be at most 50 characters long")
    .trim()
    .nonempty("Name is required"),
  
  result_date: z
    .string({
      required_error: "Result date is required",
      invalid_type_error: "Result date must be a string",
    })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use YYYY-MM-DD"),
  
  result_time: z
    .string({
      required_error: "Result time is required",
      invalid_type_error: "Result time must be a string",
    })
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format. Use HH:mm"),
  
  is_active: z
    .boolean({
      invalid_type_error: "Active status must be a boolean",
    })
    .default(true)
    .optional(),
});

/**
 * Export the validator schema and its inferred type
 */
export default LotteryValidator;
export type LotteryType = z.infer<typeof LotteryValidator>;
