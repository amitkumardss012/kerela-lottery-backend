import { z } from "zod";

const EnquiryValidator = z.object({
  name: z
    .string({required_error: "Name is required"})
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .nonempty("Name is required"),
    
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address")
    .min(5, "Email must be at least 5 characters")
    .max(254, "Email cannot exceed 254 characters")
    .nonempty("Email is required"),
    
  phone: z
    .string()
    .trim()
    .length(10, "Phone number must be exactly 10 digits")
    .regex(/^[0-9]+$/, "Phone number can only contain digits")
    .nonempty("Phone is required"),
  
  
    
  subject: z
    .string()
    .trim()
    .optional(),
    
  message: z
    .string()
    .trim()
    .optional(),
  state: z
    .string()
    .trim()
    .min(2, "State must be at least 2 characters")
    .max(100, "State cannot exceed 100 characters")
    .nonempty("State cannot be empty"),
    
  isRead: z
    .boolean()
    .default(false)
    .optional()
}).strict();

export default EnquiryValidator;

export type EnquiryType = z.infer<typeof EnquiryValidator>;