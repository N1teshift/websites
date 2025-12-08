/**
 * @file resultFormatters.ts
 * @description Contains utility functions for formatting test execution results,
 *              such as durations, token counts, costs, and validation error messages.
 */

/**
 * Formats a duration in milliseconds into a human-readable string.
 *
 * - If less than 1000ms, shows as "Xms".
 * - If less than 60000ms (1 minute), shows as "X.YYs".
 * - Otherwise, shows as "Zm Xs.Ys".
 *
 * @param durationMs The duration in milliseconds.
 * @returns A formatted string representing the duration.
 */
export function formatDuration(durationMs: number): string {
  if (durationMs < 0) return "0ms"; // Handle negative durations gracefully
  if (durationMs < 1000) {
    return `${durationMs.toFixed(0)}ms`;
  } else if (durationMs < 60000) {
    return `${(durationMs / 1000).toFixed(2)}s`;
  } else {
    const minutes = Math.floor(durationMs / 60000);
    const seconds = ((durationMs % 60000) / 1000).toFixed(1);
    return `${minutes}m ${seconds}s`;
  }
}

/**
 * Formats a number of tokens into a human-readable string with a thousands separator.
 *
 * @param tokens The number of tokens.
 * @returns A formatted string, e.g., "1,234 tokens".
 */
export function formatTokenCount(tokens: number): string {
  if (tokens < 0) tokens = 0; // Handle negative token counts
  return `${tokens.toLocaleString()} tokens`;
}

/**
 * Formats a numerical cost into a currency string (USD) with four decimal places.
 *
 * @param cost The cost value.
 * @returns A formatted currency string, e.g., "$0.1234".
 */
export function formatCost(cost: number): string {
  if (cost < 0) cost = 0; // Handle negative costs
  return `$${cost.toFixed(4)}`;
}

/**
 * Formats a technical validation error message into a more user-friendly string.
 * Replaces common technical terms (like 'numberSet', 'representationType') and
 * uppercase enum-like values with more readable equivalents.
 *
 * @param validationError The raw validation error string.
 * @returns A more user-friendly version of the error message.
 */
export function formatValidationError(validationError: string): string {
  if (!validationError) return "An unknown validation error occurred.";

  // Replace technical terms with more user-friendly ones
  return validationError
    .replace(/numberSet/g, "number type")
    .replace(/representationType/g, "representation")
    .replace(/INTEGER/g, "integer")
    .replace(/DECIMAL/g, "decimal")
    .replace(/FRACTION/g, "fraction")
    .replace(/NATURAL/g, "natural number")
    .replace(/WHOLE/g, "whole number");
  // Add more replacements as needed
}
