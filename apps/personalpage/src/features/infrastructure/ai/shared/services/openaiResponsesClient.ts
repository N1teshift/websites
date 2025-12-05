/**
 * @file Service for interacting with the OpenAI API (works on both client and server).
 * Provides functions to send prompts and receive structured or unstructured
 * responses from an LLM, while handling configuration, payload construction,
 * and token usage tracking.
 */
import { ResponsesConfig, ResponsesResult } from "../../types";
import { apiRequest } from "@/features/infrastructure/api";
import { updateTokenUsage } from "../utils/tokenUtils";
import { openaiService } from "@/features/infrastructure/api/openai/openaiService";

/**
 * @internal
 * Default settings for OpenAI model API calls made through the proxy.
 */
const AI_SETTINGS = {
  temperature: 0,
  maxTokens: 5000,
  model: "gpt-4o-mini"
};

/**
 * Sends a request to the backend OpenAI proxy (`/api/openai/responses-proxy`)
 * to get a response from an LLM.
 *
 * Allows flexible configuration through the `config` parameter, supporting:
 * - Basic prompts (`userPrompt`, `systemPrompt`).
 * - Chat messages (`messages`).
 * - Response format control (`textFormat`, `schema`).
 * - Standard LLM parameters (`temperature`, `maxTokens`, `model`).
 *
 * Updates the global token usage counter via `updateTokenUsage`.
 * Uses `apiRequest` for the actual HTTP request.
 *
 * @param {string} userPrompt - The user's text input (used if `messages` is not provided).
 * @param {ResponsesConfig} [config={}] - Configuration options for the request.
 * @returns {Promise<ResponsesResult>} The model response, including output text and usage statistics.
 * @throws {Error} If the API request fails or returns an empty response.
 */
export async function getModelResponse(
  userPrompt: string,
  config: ResponsesConfig = {}
): Promise<ResponsesResult> {
  const {
    temperature = AI_SETTINGS.temperature,
    maxTokens = AI_SETTINGS.maxTokens,
    model = AI_SETTINGS.model,
    systemPrompt,
    textFormat = 'json_object',
    schema,
    messages
  } = config;
  
  try {
    // Prepare request payload
    const payload: Record<string, unknown> = {
      temperature,
      maxTokens,
      model
    };
    
    // Include messages if provided, otherwise use userPrompt
    if (messages && messages.length > 0) {
      payload.messages = messages;
    } else {
      payload.userPrompt = userPrompt;
      
      if (systemPrompt) {
        payload.systemPrompt = systemPrompt;
      }
      
      // Prioritize schema if provided, otherwise use textFormat
      if (schema) {
        payload.schema = schema;
      } else if (textFormat) {
        payload.textFormat = textFormat; // Fallback to textFormat if no schema
      }
    }
    
    // Make API request
    const data = await apiRequest<ResponsesResult>('/api/openai/responses-proxy', 'POST', payload);
    
    // Validate response
    if (data === undefined || data === null) {
      throw new Error('Empty response from API');
    }
    
    // Track token usage with the utility function
    if (data.usage) {
      updateTokenUsage({
        input_tokens: data.usage.input_tokens ?? data.usage.prompt_tokens ?? 0,
        output_tokens: data.usage.output_tokens ?? data.usage.completion_tokens ?? 0,
        total_tokens: data.usage.total_tokens ?? 0
      });
    }
    
    return data;
  } catch (error) {
    console.error(`Error calling OpenAI API:`, error);
    throw new Error('Error calling OpenAI API');
  }
}

/**
 * Sends a request to the backend OpenAI proxy, specifically enforcing a JSON schema
 * for the LLM's response.
 *
 * Provides a simplified interface compared to `getModelResponse` for schema-based calls.
 * Uses default model settings (`temperature`, `maxTokens`, `model`) defined in `AI_SETTINGS`.
 * Updates the global token usage counter via `updateTokenUsage`.
 *
 * @param {string} userPrompt - The user's text input.
 * @param {string} systemPrompt - The system prompt guiding the model's behavior.
 * @param {Record<string, unknown>} schema - The JSON schema the response must conform to.
 * @returns {Promise<ResponsesResult>} The model response with structured output text and usage statistics.
 * @throws {Error} If the API request fails, returns an empty response, or another error occurs.
 */
export async function getModelResponseWithSchema(
  userPrompt: string,
  systemPrompt: string,
  // Use Record<string, unknown> instead of any for the schema type
  schema: Record<string, unknown> 
): Promise<ResponsesResult> {
  // Use the default settings directly from AI_SETTINGS
  const { model, temperature, maxTokens } = AI_SETTINGS;

  try {
    // Check if we're on the server side (where we can call the service directly)
    const isServerSide = typeof window === 'undefined';

    if (isServerSide) {
      // On server side, call the service directly (avoids HTTP overhead and URL issues)
      const response = await openaiService.processResponse(userPrompt, undefined, {
        systemPrompt,
        schema,
        model,
        temperature,
        maxTokens,
        textFormat: 'json_object'
      });

      // Track token usage with the utility function
      if (response.usage) {
        const usage = response.usage as { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number; input_tokens?: number; output_tokens?: number };
        updateTokenUsage({
          input_tokens: usage.input_tokens ?? usage.prompt_tokens ?? 0,
          output_tokens: usage.output_tokens ?? usage.completion_tokens ?? 0,
          total_tokens: usage.total_tokens ?? 0
        });
      }

      return response as ResponsesResult;
    } else {
      // On client side, use the API route
      const payload: Record<string, unknown> = {
        userPrompt,
        systemPrompt,
        schema,
        model,
        temperature,
        maxTokens
      };

      // Make API request
      const data = await apiRequest<ResponsesResult>('/api/openai/responses-proxy', 'POST', payload);
      
      // Validate response
      if (data === undefined || data === null) {
        throw new Error('Empty response from API in getModelResponseWithSchema');
      }
      
      // Track token usage with the utility function
      if (data.usage) {
        updateTokenUsage({
          input_tokens: data.usage.input_tokens ?? data.usage.prompt_tokens ?? 0,
          output_tokens: data.usage.output_tokens ?? data.usage.completion_tokens ?? 0,
          total_tokens: data.usage.total_tokens ?? 0
        });
      }
      
      return data;
    }
  } catch (error) {
    // Handle errors with context
    if (error instanceof Error) {
      throw new Error(`Error calling OpenAI API with schema: ${error.message}`);
    } else {
      throw new Error(`Error calling OpenAI API with schema: ${String(error)}`);
    }
  }
} 



