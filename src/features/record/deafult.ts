import { Filter } from "@/lib/types";

export const unsoldAmount: Filter[string] = {
  min: 0.000001,
  max: 1000000,
};

export const totalUnsoldAmount: Filter[string] = {
  min: 0.000001,
  max: 1000000,
};

export const buyDate: Filter[string] = {
  min: undefined,
  max: undefined,
};

export const stockCode: Filter[string] = {
  values: [],
};
