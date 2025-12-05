/**
 * OpenAI-specific configuration
 * Contains only OpenAI-related environment variables and settings
 */

export interface OpenAIConfig {
  apiKey: string;
  baseUrl: string;
  defaultModel: string;
  timeout: number;
}

/**
 * Get OpenAI configuration from environment variables
 */
export function getOpenAIConfig(): OpenAIConfig {
  return {
    apiKey: process.env.OPENAI_API_KEY || '',
    baseUrl: process.env.OPENAI_API_BASE_URL || 'https://api.openai.com/v1',
    defaultModel: process.env.OPENAI_DEFAULT_MODEL || 'gpt-4o-mini',
    timeout: parseInt(process.env.OPENAI_TIMEOUT || '30000'),
  };
}

/**
 * Validate OpenAI configuration
 */
export function validateOpenAIConfig(config: OpenAIConfig): string[] {
  const errors: string[] = [];

  if (!config.apiKey) {
    errors.push('OPENAI_API_KEY is required');
  }

  return errors;
}



