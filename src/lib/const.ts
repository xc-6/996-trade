import { Currency, Exchange } from "./types";

export const TOKEN_KEY = "token";
export const LOCAL_STORAGE_ACCOUNT_KEY = "trade-redcords-app-active-accounts";
export const CURRENCY: Array<Currency> = ["CNY", "USD", "HKD"];
export const EXCHANGE: Array<Exchange> = ["SH", "SZ", "US", "HK"];
export const CURRENCY_GROUP = {
  CNY: ["SH", "SZ"],
  USD: ["US"],
  HKD: ["HK"],
};
