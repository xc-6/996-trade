import { EXCHANGE } from "@/lib/const";
import { arrayToEnum } from "@/lib/utils";
import { z } from "zod";

export const Currency = z.nativeEnum(arrayToEnum(EXCHANGE));

export const DivRecord = z.object({
  divDate: z.date({
    message: "Dividend Date is required.",
  }),
  list: z
    .array(
      z.object({
        buyRecordId: z.string(),
        divAmount: z
          .string({
            message: "dividend Amount is required.",
          })
          .refine(
            (v) => {
              const n = Number(v);
              return !isNaN(n) && v?.length > 0 && n > 0;
            },
            { message: "Invalid number" },
          ),
      }),
    )
    .min(1, { message: "Please select at least one buy record" }),
  perDiv: z
    .string({
      message: "Dividend Per Share is required.",
    })
    .refine(
      (v) => {
        const n = Number(v);
        return !isNaN(n) && v?.length > 0;
      },
      { message: "Invalid number" },
    ),
});

export const SellRecord = z.object({
  sellPrice: z
    .string({
      message: "Sold Price is required.",
    })
    .refine(
      (v) => {
        const n = Number(v);
        return !isNaN(n) && v?.length > 0;
      },
      { message: "Invalid number" },
    ),
  sellAmount: z
    .string({
      message: "Sold Amount is required.",
    })
    .refine(
      (v) => {
        const n = Number(v);
        return !isNaN(n) && v?.length > 0;
      },
      { message: "Invalid number" },
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
      { message: "Invalid number" },
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
      { message: "Invalid number" },
    ),
  buyDate: z.date({
    message: "Buy Date is required.",
  }),
  accountId: z.string({
    message: "Account is required.",
  }),
});
