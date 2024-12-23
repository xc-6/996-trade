import { z } from "zod";

export const Currency = z.enum(["RMB", "USD"])

export const Account = z.object({
  name: z.string(),
  currency: Currency,
})