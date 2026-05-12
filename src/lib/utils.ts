import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  if (price >= 10000) {
    return `${(price / 1000).toFixed(1)}k`;
  }
  return `${price.toLocaleString("zh-CN")}`;
}
