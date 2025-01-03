import { z } from "zod";
import { models, model, Model } from "mongoose";
import { zodSchema, extendZod, zId } from "@zodyac/zod-mongoose";

extendZod(z);

export const zCurrency = z.enum(["CNY", "USD", "HKD"]);

export const zAccount = z.object({
  name: z.string(),
  currency: zCurrency,
});

export const zUser = z.object({
  email: z.string(),
  password: z.string().optional(),
  name: z.string(),
  image: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  // auth-next would not pass it
  accounts: z.array(zAccount).default([]).optional(),
});

export const zSellRecord = z.object({
  sellPrice: z.number(),
  sellAmount: z.number(),
  profitLoss: z.number().default(0),
  apy: z.number().default(0),
  sellDate: z.date(),
});

export const zBuyRecord = z.object({
  stockCode: z.string(),
  buyPrice: z.number(),
  buyAmount: z.number(),
  buyDate: z.date(),
  accountId: zId(),
  sellRecords: z.array(zSellRecord).default([]),
  unsoldAmount: z.number().default(0),
  profitLoss: z.number().default(0),
});

type UserModel = Model<z.infer<typeof zUser>>;
type AccountModel = Model<z.infer<typeof zAccount>>;
type sellRecordModel = Model<z.infer<typeof zSellRecord>>;
type butRecordModel = Model<z.infer<typeof zBuyRecord>>;

export const users: UserModel =
  (models?.["auth_users"] as unknown as UserModel) ||
  model("auth_users", zodSchema(zUser));
export const accounts: AccountModel =
  (models?.["user_accounts"] as unknown as AccountModel) ||
  model("user_accounts", zodSchema(zAccount, { autoCreate: false }));
export const sellRecords: sellRecordModel =
  (models?.["sell_records"] as unknown as sellRecordModel) ||
  model("sell_records", zodSchema(zSellRecord, { autoCreate: false }));
export const buyRecords: butRecordModel =
  (models?.["buy_records"] as unknown as butRecordModel) ||
  model("buy_records", zodSchema(zBuyRecord));
