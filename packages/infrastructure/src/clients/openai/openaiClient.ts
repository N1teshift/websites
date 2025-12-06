import axios from 'axios';
import { getOpenAIConfig, validateOpenAIConfig } from './config';
import { handleOpenAIError } from './errorHandler';
import { OpenAIMessage, OpenAIRequest, OpenAICompletionRequest, OpenAIResponse, OpenAIResponsesResponse } from './types';
import { createComponentLogger } from '@websites/infrastructure/logging';

/**
 * OpenAI API Client
 * 
 * Provides methods to interact with OpenAI's API using axios directly for external API calls.
 */
export class OpenAIClient {
  private config: ReturnType<typeof getOpenAIConfig>;
  private logger = createComponentLogger('OpenAIClient');

  constructor() {
    this.config = getOpenAIConfig();
    const errors = validateOpenAIConfig(this.config);
    if (errors.length > 0) {
      throw new Error(`OpenAI configuration errors: ${errors.join(', ')}`);
    }
  }

  private async makeRequest<T>(endpoint: string, data: Record<string, unknown>): Promise<T> {
    const response = await axios({
      method: 'POST',
      url: `${this.config.baseUrl}${endpoint}`,
      data,
      timeout: this.config.timeout,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data as T;
  }

  /**
   * Send a chat completion request to OpenAI
   */
  async chatCompletion(messages: OpenAIMessage[], options: Partial<OpenAIRequest> = {}): Promise<OpenAIResponse> {
    const endpoint = '/chat/completions';
    
    try {
      const payload: Record<string, unknown> = {
        model: options.model || this.config.defaultModel,
        messages,
        temperature: options.temperature || 0,
        max_tokens: options.max_tokens || 5000,
        ...options
      };

      this.logger.debug('Making OpenAI chat completion request', { endpoint, model: payload.model });

      return await this.makeRequest<OpenAIResponse>(endpoint, payload);
    } catch (error) {
      this.logger.error('OpenAI chat completion failed', error instanceof Error ? error : new Error(String(error)), { endpoint });
      throw handleOpenAIError(error, endpoint);
    }
  }

  /**
   * Send a completion request to OpenAI
   */
  async completion(prompt: string, options: Partial<OpenAICompletionRequest> = {}): Promise<OpenAIResponse> {
    const endpoint = '/completions';
    
    try {
      const payload: Record<string, unknown> = {
        model: options.model || this.config.defaultModel,
        prompt,
        temperature: options.temperature || 0,
        max_tokens: options.max_tokens || 5000,
        ...options
      };

      this.logger.debug('Making OpenAI completion request', { endpoint, model: payload.model });

      return await this.makeRequest<OpenAIResponse>(endpoint, payload);
    } catch (error) {
      this.logger.error('OpenAI completion failed', error instanceof Error ? error : new Error(String(error)), { endpoint });
      throw handleOpenAIError(error, endpoint);
    }
  }

  /**
   * Send a responses request to OpenAI (Responses API)
   */
  async responses(params: Record<string, unknown>): Promise<OpenAIResponsesResponse> {
    const endpoint = '/responses';
    
    try {
      this.logger.debug('Making OpenAI responses request', { endpoint, model: params.model });

      return await this.makeRequest<OpenAIResponsesResponse>(endpoint, params);
    } catch (error) {
      this.logger.error('OpenAI responses failed', error instanceof Error ? error : new Error(String(error)), { endpoint });
      throw handleOpenAIError(error, endpoint);
    }
  }
}

/**
 * Create a new OpenAI client instance
 */
export function createOpenAIClient(): OpenAIClient {
  return new OpenAIClient();
}



