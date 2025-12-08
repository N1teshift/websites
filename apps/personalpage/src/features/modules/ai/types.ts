/**
 * @file Defines various TypeScript types and interfaces used across the AI feature,
 * including API responses, chain structures, validation results, and configuration objects.
 */
import { ObjectType } from "@math/types/mathTypes";
import { MathInput } from "@math/types/mathObjectSettingsInterfaces";

/**
 * Defines the expected structure of responses from AI generation services,
 * typically containing an array of generated mathematical objects and token usage statistics.
 * @deprecated Consider migrating to a more standardized response structure if possible.
 */
export interface MathObjectResponse {
  objects: Array<{
    objectType: string;
    [key: string]: unknown;
  }>;
  usage?: {
    total_tokens: number;
    prompt_tokens?: number;
    completion_tokens?: number;
  };
}

/**
 * Represents data associated with a specific prompt, including the prompt text
 * and the resulting generated mathematical objects.
 * @deprecated Likely related to older AI processing logic.
 */
export interface PromptData {
  prompt: string;
  result: GeneratedMathObjects;
}

/**
 * Represents the output of generating mathematical objects, containing the array
 * of objects adhering to the `MathInput` interface and optional token usage data.
 * @deprecated May be superseded by newer response types.
 */
export interface GeneratedMathObjects {
  objects: MathInput[];
  usage?: {
    total_tokens: number;
    prompt_tokens?: number;
    completion_tokens?: number;
  };
}

/**
 * Defines the result structure for validation processes, indicating validity,
 * any errors encountered, the list of objects that passed validation, and usage data.
 * @deprecated Possibly part of the legacy chain validation system.
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  validObjects: MathInput[];
  usage?: {
    total_tokens: number;
    prompt_tokens?: number;
    completion_tokens?: number;
  };
}

/**
 * Represents the direct output of the TypeIdentifierChain, indicating the identified object type.
 * @deprecated Specific to the legacy TypeIdentifierChain.
 */
export type TypeIdentificationResult = { objectType: ObjectType };

/**
 * Represents a validation error, containing a message and an optional flag
 * to indicate if it's just a warning.
 */
export interface ValidationError {
  message: string;
  isWarning?: boolean;
}

/**
 * Defines allowed OpenAI model identifiers.
 * Includes specific known models and allows for string flexibility.
 */
export type OpenAIModel = "gpt-4o-mini" | "gpt-4o-mini-2024-07-18" | string;

/**
 * Configuration options for interacting with the OpenAI API proxy (Responses API).
 */
export interface ResponsesConfig {
  /** The sampling temperature to use. */
  temperature?: number;
  /** The maximum number of tokens to generate. */
  maxTokens?: number;
  /** The specific OpenAI model to use. */
  model?: string;
  /** An optional system prompt to guide the model. */
  systemPrompt?: string;
  /** Specifies the desired response format (text or structured JSON). */
  textFormat?: "text" | "json_object";
  /** A JSON schema to enforce for the response when `textFormat` is 'json_object'. */
  schema?: Record<string, unknown>;
  /** Whether to stream the response. */
  stream?: boolean;
  /** A list of messages for chat completion models. */
  messages?: { role: "user" | "assistant" | "system"; content: string }[];
}

/**
 * Represents token usage statistics reported by the OpenAI API.
 */
export interface OpenAIApiUsage {
  input_tokens?: number;
  output_tokens?: number;
  total_tokens?: number;
}

/**
 * Interface for the raw response structure received from the custom OpenAI API proxy service.
 */
export interface ResponsesResult {
  /** The primary output text from the model. */
  output_text: string;
  /** Token usage statistics for the API call. */
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    total_tokens?: number;
    prompt_tokens?: number; // Often redundant with input_tokens
    completion_tokens?: number; // Often redundant with output_tokens
  };
  /** The full, raw response object from the underlying API (e.g., OpenAI), if available. */
  full_response?: unknown;
}

/**
 * Defines the standard result structure for a single chain execution within the legacy chain system.
 * @template T The expected type of the primary output data from the chain.
 * @deprecated Part of the legacy chain system.
 */
export interface ChainResult<T = unknown> {
  /** The primary, validated output of the chain. */
  output: T;
  /** The execution context, potentially updated by the chain. */
  context: Record<string, unknown>;
  /** Token usage specific to this chain's execution. */
  usage: TokenUsage;
}

/**
 * Interface defining the contract for a chain within the legacy system.
 * @deprecated Part of the legacy chain system.
 */
export interface Chain {
  name: string;
  systemPrompt: string;
  execute(userPrompt: string, context: Record<string, unknown>): Promise<ChainResult>;
}

/**
 * Configuration options for the legacy `ChainManager`.
 * @property chains - Optional array of chains to execute in sequence.
 * @property model - Optional OpenAI model to use across all chains that don't specify one.
 * @property debug - Optional flag to enable debug logging.
 * @deprecated Related to the legacy chain system.
 */
export interface ChainManagerConfig {
  chains?: Chain[];
  model?: OpenAIModel;
  debug?: boolean;
}

/**
 * Configuration specific to OpenAI API calls, often used within services or chains.
 * @deprecated May be consolidated or replaced by `ResponsesConfig` or similar.
 */
export interface OpenAIConfig {
  temperature?: number;
  maxTokens?: number;
  functionSchema?: Record<string, unknown>;
  functionName?: string;
  forceFunctionCall?: boolean;
  model?: OpenAIModel;
}

/**
 * Unified structure for tracking token usage across different parts of the AI feature.
 */
export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
}
