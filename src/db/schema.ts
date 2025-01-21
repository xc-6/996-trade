/* eslint-disable @typescript-eslint/no-unused-vars */
import { z, infer as ZodInfer } from "zod";
import { models, model, Model, Schema } from "mongoose";
import { zodSchema, extendZod, zId } from "@zodyac/zod-mongoose";
import { ObjectId } from "mongodb";

extendZod(z);

export const zCurrency = z.enum(["CNY", "USD", "HKD"]);

export const zAccount = z.object({
  _id: zId(),
  name: z.string(),
  currency: zCurrency,
});

export const zUser = z.object({
  _id: zId(),
  email: z.string(),
  password: z.string().optional(),
  name: z.string(),
  image: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  // auth-next would not pass it
  accounts: z.array(zAccount).default([]).optional(),
});

export const zSellRecord = z.object({
  _id: zId(),
  sellPrice: z.number(),
  sellAmount: z.number(),
  profitLoss: z.number().default(0),
  apy: z.number().default(0),
  sellDate: z.date(),
});

export const zBuyRecord = z.object({
  _id: zId(),
  stockCode: z.string(),
  buyPrice: z.number(),
  buyAmount: z.number(),
  buyDate: z.date(),
  accountId: zId("auth_users"),
  sellRecords: z.array(zSellRecord).default([]),
  unsoldAmount: z.number().default(0),
  profitLoss: z.number().default(0),
});

export const zDivBatchRecord = z.object({
  _id: zId(),
  stockCode: z.string(),
  perDiv: z.number(),
  divDate: z.date(),
  accountIds: z.array(zId("auth_users")).default([]),
  divRecords: z
    .array(
      z.object({
        buyRecordId: zId("buy_records"),
        divAmount: z.number(),
        accountId: zId("auth_users"),
      }),
    )
    .default([]),
});

const zUserWithoutId = zUser.omit({ _id: true });
const zAccountWithoutId = zAccount.omit({ _id: true });
const zSellRecordWithoutId = zSellRecord.omit({ _id: true });
const zBuyRecordWithoutId = zBuyRecord.omit({ _id: true });
const zDivBatchRecordWithoutId = zDivBatchRecord.omit({ _id: true });
type UserModel = Model<z.infer<typeof zUserWithoutId>>;
type AccountModel = Model<z.infer<typeof zAccountWithoutId>>;
type SellRecordModel = Model<z.infer<typeof zSellRecordWithoutId>>;
type BuyRecordModel = Model<z.infer<typeof zBuyRecordWithoutId>>;
type DivBatchRecordModel = Model<z.infer<typeof zDivBatchRecordWithoutId>>;

export const users: UserModel =
  (models?.["auth_users"] as unknown as UserModel) ||
  model("auth_users", zodSchema(zUserWithoutId));
export const accounts: AccountModel =
  (models?.["user_accounts"] as unknown as AccountModel) ||
  model("user_accounts", zodSchema(zAccountWithoutId, { autoCreate: false }));
export const sellRecords: SellRecordModel =
  (models?.["sell_records"] as unknown as SellRecordModel) ||
  model("sell_records", zodSchema(zSellRecordWithoutId, { autoCreate: false }));
export const buyRecords: BuyRecordModel =
  (models?.["buy_records"] as unknown as BuyRecordModel) ||
  model("buy_records", zodSchema(zBuyRecordWithoutId));
export const divBatchRecords: DivBatchRecordModel =
  (models?.["div_batch_records"] as unknown as DivBatchRecordModel) ||
  model("div_batch_records", zodSchema(zDivBatchRecordWithoutId));
