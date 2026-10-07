import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS class names
 * Useful for combining default and conditional classes without conflicts
 */
export function cn(...inputs: (string | undefined | false | null)[]) {
  return twMerge(inputs.filter(Boolean).join(" "));
}
