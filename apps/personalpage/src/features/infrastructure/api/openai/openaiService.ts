import { createOpenAIClient } from './openaiClient';
import { createComponentLogger } from '@websites/infrastructure/logging';
import { handleOpenAIError } from './errorHandler';
import { ApiError } from '@websites/infrastructure/logging';

/**
 * Configuration for retry behavior
 */
interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2
};

/**
 * OpenAI service for handling business logic
 */
export class OpenAIService {
  private logger = createComponentLogger('OpenAIService');
  private _client: ReturnType<typeof createOpenAIClient> | null = null;
  private retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG;

  /**
   * Lazy-load the OpenAI client only when needed and only on the server side
   */
  private getClient() {
    // Only create client on server side
    if (typeof window !== 'undefined') {
      throw new Error('OpenAIService can only be used on the server side. Use the API route from the client.');
    }

    if (!this._client) {
      this._client = createOpenAIClient();
    }
    return this._client;
  }

  /**
   * Checks if an error is retryable based on error type
   */
  private isRetryableError(error: unknown): boolean {
    try {
      const apiError = handleOpenAIError(error, 'responses');
      return apiError.retryable === true;
    } catch {
      // If error handling fails, assume network errors are retryable
      const errorMessage = error instanceof Error ? error.message : String(error);
      const networkErrorIndicators = ['network', 'timeout', 'ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND'];
      return networkErrorIndicators.some(indicator => 
        errorMessage.toLowerCase().includes(indicator.toLowerCase())
      );
    }
  }

  /**
   * Sleeps for the specified number of milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Calculates delay for exponential backoff
   */
  private calculateDelay(attempt: number): number {
    const delay = this.retryConfig.initialDelayMs * 
      Math.pow(this.retryConfig.backoffMultiplier, attempt);
    return Math.min(delay, this.retryConfig.maxDelayMs);
  }

  /**
   * Retries an operation with exponential backoff
   */
  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    operationName: string,
    attempt: number = 0
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const isLastAttempt = attempt >= this.retryConfig.maxRetries;
      const isRetryable = this.isRetryableError(error);

      if (!isRetryable || isLastAttempt) {
        // Don't retry if error is not retryable or we've exhausted retries
        if (isLastAttempt) {
          this.logger.error(
            `Failed after ${attempt + 1} attempts: ${operationName}`,
            error instanceof Error ? error : new Error(String(error)),
            { attempt: attempt + 1, maxRetries: this.retryConfig.maxRetries }
          );
        }
        throw error;
      }

      // Calculate delay and retry
      const delay = this.calculateDelay(attempt);
      this.logger.warn(
        `Retrying ${operationName} (attempt ${attempt + 1}/${this.retryConfig.maxRetries}) after ${delay}ms`,
        { attempt: attempt + 1, delay, error: error instanceof Error ? error.message : String(error) }
      );

      await this.sleep(delay);
      return this.retryWithBackoff(operation, operationName, attempt + 1);
    }
  }

  /**
   * Process a response request through OpenAI (full-featured version)
   */
  async processResponse(
    userPrompt?: string,
    context?: Record<string, unknown>,
    options?: {
      temperature?: number;
      maxTokens?: number;
      model?: string;
      systemPrompt?: string;
      textFormat?: 'text' | 'json_object';
      schema?: Record<string, unknown>;
      messages?: Array<{
        role: 'system' | 'user' | 'assistant';
        content: string;
      }>;
    }
  ) {
    this.logger.info('Processing OpenAI response request', {
      promptLength: userPrompt?.length || 0,
      hasContext: !!context,
      hasMessages: !!options?.messages?.length,
      hasSchema: !!options?.schema
    });

    try {
      // Use OpenAI Responses API for full functionality
      const responseParams: Record<string, unknown> = {
        model: options?.model || 'gpt-4o-mini',
        temperature: options?.temperature || 0,
        max_output_tokens: options?.maxTokens || 5000
      };

      // Handle different input methods
      if (options?.messages && options.messages.length > 0) {
        responseParams.messages = options.messages;
      } else if (userPrompt) {
        responseParams.input = userPrompt;

        // Handle structured output
        if (options?.schema) {
          responseParams.text = {
            format: {
              type: "json_schema",
              name: "extracted_data",
              schema: options.schema
            }
          };
        } else if (options?.textFormat === 'json_object') {
          responseParams.input = `${userPrompt}. Provide output in json format.`;
          responseParams.text = { format: { type: "json_object" } };
        }

        // Add system prompt if provided
        if (options?.systemPrompt) {
          responseParams.instructions = options.systemPrompt;
        }
      }

      // Call OpenAI Responses API with retry logic for transient failures
      const response = await this.retryWithBackoff(
        () => this.getClient().responses(responseParams),
        'OpenAI API call'
      );

      this.logger.info('OpenAI response generated successfully', {
        hasOutputText: !!response.output_text,
        outputLength: response.output_text?.length || 0
      });

      // Extract text from the actual response structure with improved error handling
      let extractedText = '';
      const extractionWarnings: string[] = [];

      // Try to extract from multiple possible locations in the response
      if (response.output_text) {
        extractedText = response.output_text;
      } else if (response.output && response.output[0]?.content?.[0]?.text) {
        extractedText = response.output[0].content[0].text;
      } else if (response.output && response.output[0]) {
        // Check for direct text property (with type assertion for safety)
        const outputItem = response.output[0] as { text?: string;[key: string]: unknown };
        if (outputItem.text && typeof outputItem.text === 'string') {
          extractedText = outputItem.text;
        } else {
          extractionWarnings.push('Response output found but no text property available');
        }
      } else {
        extractionWarnings.push('No recognizable response structure found');
      }

      if (extractionWarnings.length > 0) {
        this.logger.warn('Issues extracting text from OpenAI response', {
          warnings: extractionWarnings,
          responseKeys: Object.keys(response),
          hasOutputText: !!response.output_text,
          hasOutput: !!response.output,
          outputLength: response.output?.length || 0
        });
      }

      if (!extractedText && extractionWarnings.length > 0) {
        const errorMessage = `Failed to extract text from OpenAI response. Response structure: ${JSON.stringify(response).substring(0, 200)}`;
        this.logger.error('Failed to extract text from response', new Error(errorMessage), {
          responseStructure: {
            hasOutputText: !!response.output_text,
            hasOutput: !!response.output,
            outputType: typeof response.output,
            outputLength: Array.isArray(response.output) ? response.output.length : 'not an array'
          }
        });
        throw new Error(`Malformed OpenAI response: ${extractionWarnings.join('; ')}`);
      }

      this.logger.info('Extracted text from OpenAI response', {
        extractedLength: extractedText.length,
        hasText: !!extractedText,
        hadWarnings: extractionWarnings.length > 0
      });

      // Return full response structure for backward compatibility
      return {
        output_text: extractedText,
        usage: response.usage || null,
        full_response: response
      };
    } catch (error) {
      // Error has already been logged by retry logic if it was retryable
      // For non-retryable errors, log here
      if (!this.isRetryableError(error)) {
        this.logger.error('Failed to process OpenAI response (non-retryable)', error instanceof Error ? error : new Error(String(error)));
      }
      
      // Transform error to provide better error messages
      try {
        const apiError = handleOpenAIError(error, 'responses');
        throw apiError;
      } catch (transformedError) {
        throw transformedError;
      }
    }
  }

  /**
   * Validate OpenAI request payload
   */
  validateRequest(body: unknown): boolean | string {
    // Add debugging
    this.logger.debug('[OpenAI Validation] Request body received:', {
      bodyType: typeof body,
      bodyKeys: body && typeof body === 'object' ? Object.keys(body) : 'not an object',
      body: body && typeof body === 'object' ? body : 'not an object'
    });

    if (!body || typeof body !== 'object') {
      this.logger.warn('[OpenAI Validation] FAILED: Request body is required');
      return 'Request body is required';
    }

    const { prompt, userPrompt } = body as Record<string, unknown>;
    const finalPrompt = prompt || userPrompt; // Support both formats

    this.logger.debug('[OpenAI Validation] Prompt check:', {
      hasPrompt: !!prompt,
      hasUserPrompt: !!userPrompt,
      finalPrompt: finalPrompt ? String(finalPrompt).substring(0, 100) + '...' : 'none',
      promptType: typeof finalPrompt
    });

    if (!finalPrompt || typeof finalPrompt !== 'string') {
      this.logger.warn('[OpenAI Validation] FAILED: Prompt is required and must be a string');
      return 'Prompt is required and must be a string';
    }

    if (String(finalPrompt).trim().length === 0) {
      this.logger.warn('[OpenAI Validation] FAILED: Prompt cannot be empty');
      return 'Prompt cannot be empty';
    }

    if (String(finalPrompt).length > 10000) {
      this.logger.warn('[OpenAI Validation] FAILED: Prompt is too long');
      return 'Prompt is too long (max 10,000 characters)';
    }

    this.logger.debug('[OpenAI Validation] SUCCESS: Validation passed');
    return true;
  }
}

// Export singleton instance
export const openaiService = new OpenAIService();



