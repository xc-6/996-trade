import { EXCHANGE } from "@/lib/const";
import { arrayToEnum } from "@/lib/utils";
import { z } from "zod";

export const Currency = z.nativeEnum(arrayToEnum(EXCHANGE))

export const SellRecord = z.object({
  sellPrice: z
  .string({
    message: "Sell Price is required.",
  })
  .refine(
    (v) => {
      const n = Number(v);
      return !isNaN(n) && v?.length > 0;
    },
    { message: "Invalid number" }
  ),
  sellAmount: z
  .string({
    message: "Sell Amount is required.",
  })
  .refine(
    (v) => {
      const n = Number(v);
      return !isNaN(n) && v?.length > 0;
    },
    { message: "Invalid number" }
  ),
  sellDate: z.date(),
});

export const BuyRecord = z.object({
  exchange: Currency,
  stockCode: z.string().min(1, {
    message: "Stock Code is required.",
  }),
  buyPrice: z
  .string({
    message: "Buy Price is required.",
  })
  .refine(
    (v) => {
      const n = Number(v);
      return !isNaN(n) && v?.length > 0;
    },
    { message: "Invalid number" }
  ),
  buyAmount: z
    .string({
      message: "Buy Amount is required.",
    })
    .refine(
      (v) => {
        const n = Number(v);
        return !isNaN(n) && v?.length > 0;
      },
      { message: "Invalid number" }
    ),
  buyDate: z.date({
    message: "Buy Date is required.",
  }),
  accountId: z.string({
    message: "Account is required.",
  }),
});
