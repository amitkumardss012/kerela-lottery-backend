import { z } from "zod";

const AdminValidator = z
  .object({
    name: z
      .string({ required_error: "Name is required" })
      .min(2, { message: "Name must be at least 2 characters long" })
      .max(50, { message: "Name must not exceed 50 characters" })
      .trim()
      .nonempty({ message: "Name is required" }),
    email: z
      .string({ required_error: "Email is required" })
      .email({ message: "Invalid email format" })
      .toLowerCase()
      .trim()
      .nonempty({ message: "Email is required" }),
    password: z
      .string({ required_error: "Password is required" })
      .min(8, { message: "Password must be at least 8 characters long" })
      .max(100, { message: "Password must not exceed 100 characters" })
      .nonempty({
        message: "Password is required",
      }),
    role: z.enum(["admin", "sub_admin"]).default("sub_admin").optional(),
  })
  .strict("no extra field allowed");

export default AdminValidator;

export type AdminType = z.infer<typeof AdminValidator>;
