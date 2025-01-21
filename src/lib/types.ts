export type Currency = "USD" | "CNY" | "HKD";
export type Exchange = "SH" | "SZ" | "US" | "HK";

// export interface Account {
//     account_id: string;
//     account_name: string;
//     currency: Currency;
// }

export interface DivRecord {
  _id?: string;
  divDate: string;
  divAmount: string | number;
  perDiv: string | number;
}

export interface SellRecord {
  _id?: string;
  sellPrice: string | number;
  sellAmount: string | number;
  sellDate: string;
}

export interface BuyRecord {
  _id?: string;
  stockCode: string;
  accountId: string;
  currency?: Currency;
  buyPrice: string | number;
  buyAmount: string | number;
  buyDate: string;
  sellRecords: Array<SellRecord>;
  unsoldAmount: string | number;
}

export interface DivBatch {
  _id?: string;
  divDate: string;
  perDiv: string | number;
  stockCode: string;
  accountIds: Array<string>;
  divRecords?: Array<{
    buyRecordId: string;
    accountId: string;
    divAmount: number;
  }>;
}

export interface StockInfo {
  code: string;
  name: string;
  percent: number;
  now: number;
  low: number;
  high: number;
  yesterday: number;
}

export type ExtractArrayType<T> = T extends Array<infer U> ? U : never;
export type Filter = Record<
  string,
  {
    min?: number;
    max?: number;
  }
>;

export type Sort = {
  key?: string;
  order?: "asc" | "desc";
};
