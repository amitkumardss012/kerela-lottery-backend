import { z } from "zod";

const numberCoerce = (val: unknown) => {
  if (typeof val === "string" && val.trim() !== "") {
    const num = Number(val);
    return isNaN(num) ? val : num;
  }
  return val;
};

const booleanCoerce = (val: unknown) => {
  if (typeof val === "string") return val === "true";
  return val;
};

const TicketPackageValidator = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(2, { message: "Name must be at least 2 characters long" })
    .max(100, { message: "Name must not exceed 100 characters" })
    .trim(),

  description: z.string().optional().nullable(),

  badge: z
    .enum([
      "POPULAR",
      "BEST_VALUE",
      "RECOMMENDED",
      "HOT_DEAL",
      "EXCLUSIVE",
      "LIMITED_OFFER",
    ])
    .optional()
    .nullable(),

  image: z.any().optional().nullable(),

  number_of_tickets: z.preprocess(
    numberCoerce,
    z.number({ required_error: "Number of tickets is required" }).min(1)
  ),

  paid_tickets: z.preprocess(
    numberCoerce,
    z.number({ required_error: "Paid tickets is required" }).min(0)
  ),

  free_tickets: z.preprocess(
    numberCoerce,
    z.number().min(0).default(0).optional().nullable()
  ),

  price: z.preprocess(
    numberCoerce,
    z.number({ required_error: "Price is required" }).min(0)
  ),

  original_price: z.preprocess(
    numberCoerce,
    z.number().min(0).optional().nullable()
  ),

  savings_text: z.string().optional().nullable(),
  odds_multiplier_text: z.string().optional().nullable(),

  bonus_perks: z.any().optional().nullable(),

  // valid_until: z
  //   .preprocess((val) => {
  //     if (typeof val === "string" && val.trim() !== "") return new Date(val);
  //     return val;
  //   }, z.date().optional().nullable()),

  is_active: z
    .preprocess(booleanCoerce, z.boolean().default(true).optional()),

  lottery_id: z.preprocess(
    numberCoerce,
    z.number().optional().nullable()
  ),
});

export default TicketPackageValidator;
export type TicketPackageType = z.infer<typeof TicketPackageValidator>;

