import { z } from "zod";

export const budgetRangeSchema = z
  .object({
    min: z.number().nonnegative(),
    max: z
      .number()
      .nonnegative()
      .refine((val) => val > 0, {
        message: "Maximum value must be greater than 0",
      }),
  })
  .refine((data) => !data.min || !data.max || data.max >= data.min, {
    message: "Maximum value must be greater than minimum value",
    path: ["max"],
  });
