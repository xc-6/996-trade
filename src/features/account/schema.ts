import { z } from "zod";

export const Currency = z.enum(["CNY", "USD", "HKD"]);

export const Account = z.object({
  name: z.string(),
  currency: Currency,
});
