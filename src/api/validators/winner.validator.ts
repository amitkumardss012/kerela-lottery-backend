import { z } from "zod";
import lottery from "../routes/lottery.routes";

export const WinnerValdator = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(3, "Name must be at least 3 characters long")
    .max(50, "Name must be at most 50 characters long")
    .nonempty("Name is required")
    .trim(),
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format")
    .nonempty("Email is required")
    .trim(),
  phone: z
    .string({ required_error: "Phone is required" })
    .min(10, "Phone number must be at least 10 characters long")
    .max(10, "Phone number must be at most 10 characters long")
    .nonempty("Phone number is required")
    .trim(),
  state: z
    .string({ required_error: "State is required" })
    .nonempty("State is required")
    .trim(),
    lottery_id: z
   .string({ required_error: "Lottery ID is required" })
  .nonempty("Lottery ID is required"),
  ticket_number: z
    .string({ required_error: "Ticket ID is required" })
    .nonempty("Ticket ID is required")
    .trim(),
  prize_amount: z
    .string({ required_error: "Prize Amount is required" })
    .nonempty("Prize Amount is required")
    .trim(),
  winner_rank: z.string().optional(),
}).strict();

export default WinnerValdator;

export type WinnerType = z.infer<typeof WinnerValdator>;
