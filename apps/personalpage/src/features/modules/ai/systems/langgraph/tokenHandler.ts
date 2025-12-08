/**
 * @file Defines a custom LangChain callback handler for tracking OpenAI token usage.
 */
import { BaseCallbackHandler } from "@langchain/core/callbacks/base";
import { LLMResult } from "@langchain/core/outputs";
import { createComponentLogger } from "@websites/infrastructure/logging";
import { updateTokenUsage } from "../../shared/utils/tokenUtils";

/**
 * Custom LangChain CallbackHandler that intercepts the end of LLM calls
 * to extract token usage information and update a shared token counter.
 *
 * This allows aggregating token usage across multiple LLM calls within a LangChain Runnable or Graph execution.
 *
 * @extends BaseCallbackHandler
 */
export class TokenUsageCallbackHandler extends BaseCallbackHandler {
  /** A unique name identifier for this callback handler. */
  name = "TokenUsageCallbackHandler"; // Identifier for the handler
  private logger = createComponentLogger("TokenUsageCallback");

  /**
   * Initializes a new instance of the TokenUsageCallbackHandler.
   */
  constructor() {
    super(); // Call the parent constructor
    this.logger.info("TokenUsageCallbackHandler initialized");
  }

  /**
   * LangChain callback method executed when an LLM call successfully completes.
   * Extracts token usage data from the `llmOutput` property of the result.
   * Adapts the potentially varied token usage property names (e.g., `promptTokens` vs `input_tokens`)
   * to the application's standard `TokenUsage` interface.
   * Calls the `updateTokenUsage` utility function to update the shared counter.
   *
   * @param {LLMResult} output The result object from the completed LLM call.
   * @returns {Promise<void>}
   */
  async handleLLMEnd(output: LLMResult): Promise<void> {
    // Extract token usage from the LLM output metadata
    const usage = output.llmOutput?.tokenUsage;
    if (usage) {
      // Adapt LangChain's token usage format (e.g., promptTokens) to our format (input_tokens)
      const adaptedUsage = {
        // Use nullish coalescing to handle potential variations in property names (snake_case vs camelCase)
        input_tokens: usage.promptTokens ?? usage.input_tokens ?? 0,
        output_tokens: usage.completionTokens ?? usage.output_tokens ?? 0,
        total_tokens: usage.totalTokens ?? usage.total_tokens ?? 0,
      };
      this.logger.info("LLM Token Usage Recorded", { adaptedUsage });
      // Update the shared global token usage counter
      updateTokenUsage(adaptedUsage);
    } else {
      this.logger.warn("No token usage information found in LLM output.");
      // console.warn("No token usage found in LLM output:", JSON.stringify(output, null, 2)); // Optional: Log if needed
    }
  }

  // Implement other methods if needed, but handleLLMEnd is usually sufficient for usage tracking
  // Example: handleLLMError, handleChainStart, etc. (return Promise<void>)
}
