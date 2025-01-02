import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import * as fedHolidays from "@18f/us-federal-holidays";

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

export const numberFormatter = (num?: number) => {
  if (num === undefined) return "N/A";
  return new Intl.NumberFormat().format(Number(num.toFixed(2)));
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

const isChineseMarketOpen = () => {
  const now = new Date();
  const hours = now.getUTCHours(); // Get current hour in UTC

  return (
    (hours === 1 && now.getUTCMinutes() >= 30) || // Morning session starts at 9:30 AM UTC+8
    hours === 2 || // Morning session until 11:30 AM UTC+8
    (hours === 3 && now.getUTCMinutes() < 30) || // Morning session ends at 11:30 AM UTC+8
    [5, 6].includes(hours)
  ); // Afternoon session starts at 1:00 PM UTC+8 Afternoon session ends at 3:00 PM UTC+8
};

const isUSMarketOpen = () => {
  const now = new Date();
  if (fedHolidays.isAHoliday(now)) {
    return false;
  }

  const hours = now.getUTCHours(); // Get current hour in UTC
  return hours >= 14 && hours < 21; // 9:30 AM to 4:00 PM UTC-5
};

const isHKMarketOpen = () => {
  const now = new Date();
  const hours = now.getUTCHours(); // Get current hour in UTC
  return (
    (hours === 1 && now.getUTCMinutes() >= 30) || // Morning session starts at 9:30 AM UTC+8
    [2, 3, 4, 5].includes(hours) ||
    (hours === 6 && now.getUTCMinutes() < 30)
  ); // Afternoon session ends at 3:00 PM UTC+8
};

export const isMarketOpen = (stocks: Array<string>) => {
  const now = new Date();
  // Check the UTC time if it's Saturday or Sunday return false directly
  if ([0, 6].includes(now.getUTCDay())) {
    return false;
  }

  const isChinese = stocks.some(
    (code) => code.startsWith("SH") || code.startsWith("SZ"),
  );
  const isUS = stocks.some((code) => code.startsWith("US"));
  const isHK = stocks.some((code) => code.startsWith("HK"));

  if (isChinese && isChineseMarketOpen()) {
    return true;
  } else if (isUS && isUSMarketOpen()) {
    return true;
  } else if (isHK && isHKMarketOpen()) {
    return true;
  }
  return false;
};

export const formatBytes = (
  bytes: number,
  opts: {
    decimals?: number;
    sizeType?: "accurate" | "normal";
  } = {},
) => {
  const { decimals = 0, sizeType = "normal" } = opts;

  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const accurateSizes = ["Bytes", "KiB", "MiB", "GiB", "TiB"];
  if (bytes === 0) return "0 Byte";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${
    sizeType === "accurate"
      ? (accurateSizes[i] ?? "Bytes")
      : (sizes[i] ?? "Bytes")
  }`;
};
