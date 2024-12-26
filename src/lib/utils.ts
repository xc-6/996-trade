import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const arrayToEnum = (array: string[]) => {
  return Object.freeze(
    Object.fromEntries(array.map((value) => [value, value])),
  );
};

export const reverseMapping = (mapping: Record<string, Array<string>>) => {
  return Object.entries(mapping).reduce(
    (acc: Record<string, string>, [currency, exchanges]) => {
      exchanges.forEach((exchange) => {
        acc[exchange] = currency;
      });
      return acc;
    },
    {},
  );
};

export const currencyFormatter = (
  currency: "CNY" | "USD" | "HKD",
  num: number,
) => {
  const lanuage = {
    CNY: "zh-CN",
    USD: "en-US",
    HKD: "zh-TW",
  };
  const formatter = new Intl.NumberFormat(lanuage[currency], {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  });

  return formatter.format(num);
};
