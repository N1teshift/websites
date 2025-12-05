/**
 * @file Defines the base abstract class for creating processing chains.
 * @deprecated This chain system is considered legacy and may be replaced by a newer implementation using Langchain/LangGraph.
 */
import { ChainResult, ResponsesResult } from "../../../types";
import { getModelResponseWithSchema } from "../../../shared/services/openaiResponsesClient";
import { TokenUsage } from "@ai/types";
import { createComponentLogger } from "@websites/infrastructure/logging";

/**
 * Base abstract class for all chains. Provides common functionality for chain execution.
 * Chains process user prompts through an LLM, enforce schema validation, and manage context.
 * @template T The expected type of the validated output from the chain.
 * @deprecated This chain system is considered legacy and may be replaced by a newer implementation using Langchain/LangGraph.
 */
export abstract class BaseChain<T = unknown> {
  name: string;
  systemPrompt: string;
  protected logger: ReturnType<typeof createComponentLogger>;
  
  /**
   * Creates an instance of BaseChain.
   * @param {string} name - The name of the chain, used for logging and context keys.
   * @param {string} systemPrompt - The system prompt to guide the LLM's behavior.
   */
  constructor(name: string, systemPrompt: string) {
    this.name = name;
    this.systemPrompt = systemPrompt;
    this.logger = createComponentLogger(name, 'BaseChain');
  }
  
  /**
   * Executes the chain's logic.
   * This involves preparing the prompt, calling the LLM with schema enforcement,
   * parsing the response, validating the output, and updating the context.
   * @param {string} userPrompt - The initial user prompt.
   * @param {Record<string, unknown>} context - The current execution context.
   * @returns {Promise<ChainResult<T>>} A promise that resolves with the chain's output, updated context, and token usage.
   * @throws {Error} Throws an error if the model response is invalid JSON or if validation fails.
   */
  async execute(userPrompt: string, context: Record<string, unknown>): Promise<ChainResult<T>> {
    this.logger.info(`Executing with prompt: ${userPrompt.substring(0, 50)}...`);
    const startTime = Date.now();

    // Prepare the final user prompt (subclasses might modify it)
    const preparedPrompt = this.preparePrompt(userPrompt);
    
    // Get the schema required for this chain's output
    const schema = this.getSchema(context);

    try {
      // Call the model using the function that enforces the schema
      const response: ResponsesResult = await getModelResponseWithSchema(
        preparedPrompt,
        this.systemPrompt,
        schema as Record<string, unknown>
      );
      
      this.logger.debug(`Raw JSON string response received: ${response.output_text.substring(0, 100)}...`);

      // 1. Parse the raw JSON string response
      const parsedResponse = await this.parseResponse(response.output_text);
      this.logger.debug(`Parsed response object: ${JSON.stringify(parsedResponse, null, 2)}`);

      // 2. Validate the parsed response object
      const output = await this.validateResponse(parsedResponse, userPrompt, context);
      this.logger.debug(`Validated response object: ${JSON.stringify(output, null, 2)}`);
      
      // Update the context based on the validated output
      const finalContext = this.updateContext(output, context);

      this.logger.debug(`Final context: ${JSON.stringify(finalContext, null, 2)}`);
      
      // Extract token usage information
      const usage: TokenUsage = {
        input_tokens: response.usage?.input_tokens ?? 0,
        output_tokens: response.usage?.output_tokens ?? 0,
        total_tokens: response.usage?.total_tokens ?? 0
      };
      
      // Log completion and return the final result
      this.logger.info(`Completed execution in ${Date.now() - startTime}ms.`);
      return {
        output,
        context: finalContext,
        usage
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logError(`Error executing chain: ${message}`);
      // Re-throw the error to allow higher-level handling
      throw error; 
    }
  }
  
  /**
   * Prepares the user prompt before sending it to the LLM.
   * Subclasses can override this method to modify the prompt based on context or other logic.
   * @param {string} userPrompt - The original user prompt.
   * @returns {string} The prepared prompt.
   * @protected
   */
  protected preparePrompt(userPrompt: string): string {
    return userPrompt;
  }
  
  /**
   * Gets the JSON schema required for validating the LLM's output for this specific chain.
   * This method must be implemented by subclasses.
   * @param {Record<string, unknown>} context - The current execution context, which might influence the schema.
   * @returns {unknown} The JSON schema object.
   * @protected
   * @abstract
   */
  protected abstract getSchema(context: Record<string, unknown>): unknown;
  
  /**
   * Parses the raw JSON string response from the LLM into a JavaScript object.
   * @param {string} response - The raw JSON string response from the LLM.
   * @returns {Promise<unknown>} A promise that resolves with the parsed JavaScript object.
   * @throws {Error} Throws an error if the response string is not valid JSON.
   * @protected
   */
  protected async parseResponse(response: string): Promise<unknown> {
    this.logger.debug(`Parsing raw response.`);
    try {
      const parsedOutput = JSON.parse(response);
      this.logger.debug(`Successfully parsed JSON response.`);
      return parsedOutput;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logError(`Error parsing JSON response: ${errorMsg}. Raw response: ${response}`);
      // Rethrow a more informative error
      throw new Error(`Invalid JSON response received from model: ${response}`);
    }
  }

  /**
   * Validates the parsed response object against the expected schema and potentially other constraints.
   * Transforms the parsed object into the final output type `T`.
   * This method must be implemented by subclasses.
   * @param {unknown} parsedResponse - The parsed JavaScript object from the LLM response.
   * @param {string} userPrompt - The original user prompt (for context during validation).
   * @param {Record<string, unknown>} context - The current execution context (for context during validation).
   * @returns {Promise<T>} A promise that resolves with the validated and transformed output.
   * @protected
   * @abstract
   */
  protected abstract validateResponse(
    parsedResponse: unknown,
    userPrompt: string,
    context: Record<string, unknown>
  ): Promise<T>;
  
  /**
   * Updates the execution context with the output from this chain.
   * By default, it adds the output under a key corresponding to the chain's name.
   * Subclasses can override this to implement custom context updates.
   * @param {T} output - The validated output of the chain.
   * @param {Record<string, unknown>} context - The context before this chain executed.
   * @returns {Record<string, unknown>} The updated context.
   * @protected
   */
  protected updateContext(output: T, context: Record<string, unknown>): Record<string, unknown> {
    return {
      ...context,
      [this.name]: output
    };
  }

  /**
   * Logs an error message specific to this chain instance.
   * @param {string} message - The error message to log.
   * @protected
   */
  protected logError(message: string): void {
    this.logger.error(message);
  }
} 



