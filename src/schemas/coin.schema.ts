import * as z from "zod";

export const CoinQuerySchema = z.object({
  coins: z.string().min(1),
  amount: z.coerce.number().positive().default(1),
});
