export function sanitizeNextPath(value: string | null | undefined): string {
  if (!value) return "/dashboard";
  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    value.includes("\0")
  ) {
    return "/dashboard";
  }
  try {
    const url = new URL(value, "http://frontend.local");
    if (url.origin !== "http://frontend.local") return "/dashboard";
  } catch {
    return "/dashboard";
  }
  return value;
}
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
