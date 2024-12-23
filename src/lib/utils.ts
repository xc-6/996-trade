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
