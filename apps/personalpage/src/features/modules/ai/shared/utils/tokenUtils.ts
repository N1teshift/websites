/**
 * @file Utility functions for tracking and managing LLM token usage.
 * Provides a global counter and functions to update, retrieve, combine,
 * normalize, and estimate the cost of token usage.
 */
import { TokenUsage } from "../../types";

/**
 * @internal
 * Global accumulator for token usage across multiple LLM calls within a single logical operation
 * (e.g., a single run of the MathObjectGenerator or the LangGraph).
 * It should be reset before each independent generation task using `resetGlobalTokenUsage`.
 */
let globalTokenUsage: TokenUsage = {
  input_tokens: 0,
  output_tokens: 0,
  total_tokens: 0,
};

/**
 * Represents an empty `TokenUsage` object, often used as an initializer.
 */
export const EMPTY_TOKEN_USAGE: TokenUsage = {
  input_tokens: 0,
  output_tokens: 0,
  total_tokens: 0,
};

/**
 * Resets the `globalTokenUsage` counter back to zero.
 * Should be called before starting a new, independent generation process
 * to ensure accurate tracking for that process.
 */
export function resetGlobalTokenUsage(): void {
  globalTokenUsage = {
    input_tokens: 0,
    output_tokens: 0,
    total_tokens: 0,
  };
}

/**
 * Retrieves a *copy* of the current `globalTokenUsage` statistics.
 * @returns {TokenUsage} A copy of the current global token usage.
 */
export function getGlobalTokenUsage(): TokenUsage {
  return { ...globalTokenUsage };
}

/**
 * Updates the `globalTokenUsage` statistics by adding the values from the provided `usage` object.
 * @param {Partial<TokenUsage>} usage - An object containing the token counts to add.
 */
export function updateTokenUsage(usage: Partial<TokenUsage>): void {
  globalTokenUsage.input_tokens += usage.input_tokens || 0;
  globalTokenUsage.output_tokens += usage.output_tokens || 0;
  globalTokenUsage.total_tokens += usage.total_tokens || 0;
}

/**
 * Combines token usage from multiple sources into a single `TokenUsage` object.
 * Safely handles undefined or null inputs.
 * @param {...(Partial<TokenUsage> | undefined | null)[]} usages - An array or arguments list of usage objects.
 * @returns {TokenUsage} A new object representing the sum of all provided usages.
 * @deprecated Consider using `sumTokenUsage` which might be slightly clearer.
 */
export function combineTokenUsage(
  ...usages: (Partial<TokenUsage> | undefined | null)[]
): TokenUsage {
  return {
    total_tokens: usages.reduce((sum, usage) => sum + (usage?.total_tokens || 0), 0),
    input_tokens: usages.reduce((sum, usage) => sum + (usage?.input_tokens || 0), 0),
    output_tokens: usages.reduce((sum, usage) => sum + (usage?.output_tokens || 0), 0),
  };
}

/**
 * Accumulates token usage from a `newUsage` object into an existing `accumulator` object.
 * Modifies the `accumulator` object directly.
 * @param {TokenUsage} accumulator - The object to add usage counts to (will be mutated).
 * @param {Partial<TokenUsage>} newUsage - The usage counts to add.
 */
export function accumulateTokenUsage(accumulator: TokenUsage, newUsage: Partial<TokenUsage>): void {
  accumulator.input_tokens += newUsage.input_tokens ?? 0;
  accumulator.output_tokens += newUsage.output_tokens ?? 0;
  accumulator.total_tokens += newUsage.total_tokens ?? 0;
}

/**
 * Sums up token usage from an array of `TokenUsage` objects.
 * Safely handles undefined or null entries in the array.
 * @param {(Partial<TokenUsage> | undefined | null)[]} usages - An array of usage objects.
 * @returns {TokenUsage} A new object representing the sum of all usages in the array.
 */
export function sumTokenUsage(usages: (Partial<TokenUsage> | undefined | null)[]): TokenUsage {
  return usages.reduce<TokenUsage>(
    (sum, usage) => {
      sum.input_tokens += usage?.input_tokens || 0;
      sum.output_tokens += usage?.output_tokens || 0;
      sum.total_tokens += usage?.total_tokens || 0;
      return sum;
    },
    { input_tokens: 0, output_tokens: 0, total_tokens: 0 }
  );
}

/** @internal Hardcoded approximate cost per input token (e.g., for gpt-4o-mini). */
const PROMPT_TOKEN_RATE = 0.00000015; // $0.15 / 1M input tokens
/** @internal Hardcoded approximate cost per output token (e.g., for gpt-4o-mini). */
const COMPLETION_TOKEN_RATE = 0.0000006; // $0.60 / 1M output tokens

/**
 * Calculates the estimated cost of an LLM call based on input and output token counts
 * using hardcoded rates for gpt-4o-mini.
 * @param {number} inputTokens - The number of input tokens.
 * @param {number} outputTokens - The number of output tokens.
 * @returns {number} The estimated cost in dollars.
 */
export const calculateCost = (inputTokens: number, outputTokens: number): number => {
  // Ensure non-negative tokens before calculation
  const safeInputTokens = Math.max(0, inputTokens);
  const safeOutputTokens = Math.max(0, outputTokens);

  return safeInputTokens * PROMPT_TOKEN_RATE + safeOutputTokens * COMPLETION_TOKEN_RATE;
};

/**
 * Normalizes any OpenAI or LangChain usage object to our TokenUsage format.
 * Accepts both new (input_tokens/output_tokens) and old (prompt_tokens/completion_tokens) field names.
 * Always returns a valid TokenUsage object.
 *
 * We use 'unknown' for the input type to avoid 'any' and enforce type safety.
 */
export function normalizeTokenUsage(usage: unknown): TokenUsage {
  const u = usage as Record<string, unknown> | undefined;
  return {
    input_tokens:
      typeof u?.input_tokens === "number"
        ? u.input_tokens
        : typeof u?.prompt_tokens === "number"
          ? u.prompt_tokens
          : 0,
    output_tokens:
      typeof u?.output_tokens === "number"
        ? u.output_tokens
        : typeof u?.completion_tokens === "number"
          ? u.completion_tokens
          : 0,
    total_tokens: typeof u?.total_tokens === "number" ? u.total_tokens : 0,
  };
}
