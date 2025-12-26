import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// UZS (so'm) ko'rinishida formatlash
export function formatCurrencyUZS(value: number) {
  return `${value.toLocaleString("uz-UZ")} so'm`;
}