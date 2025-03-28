import { z } from "zod";

const QrValidator = z.object({
  phone: z
    .string({
      required_error: "Phone number is required",
    })
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits")
    .nonempty("Phone number is required")
    .trim()
    .optional(),

  image: z
    .object({
      mimetype: z.string().refine((val) => val.startsWith("image/"), {
        message: "File must be an image",
      }),
      size: z.number().max(2 * 1024 * 1024, "File size must be less than 2MB"),
    })
    .optional(),
});


export default QrValidator
export type QrValidatorType = z.infer<typeof QrValidator>
