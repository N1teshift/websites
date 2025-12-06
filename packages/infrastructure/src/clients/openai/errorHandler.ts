import { 
  ApiError, 
  ApiErrorType, 
  createApiError, 
  isAxiosError, 
  isError, 
  createErrorLogger 
} from '@websites/infrastructure/logging';

/**
 * Handle OpenAI API errors
 */
export function handleOpenAIError(error: unknown, endpoint: string): ApiError {
  const logger = createErrorLogger('openai');
  
  if (isAxiosError(error) && error.response) {
    const statusCode = error.response.status;
    const data = error.response.data;
    
    logger.error('OpenAI API error', error instanceof Error ? error : new Error(String(error)), { 
      statusCode, 
      endpoint, 
      data 
    });
    
    switch (statusCode) {
      case 401:
        return createApiError(
          ApiErrorType.AUTHENTICATION,
          'OpenAI API key is invalid or expired',
          'openai',
          { statusCode, endpoint, originalError: isError(error) ? error : new Error(String(error)) }
        );
      case 429:
        return createApiError(
          ApiErrorType.RATE_LIMIT,
          'OpenAI API rate limit exceeded',
          'openai',
          { statusCode, endpoint, originalError: isError(error) ? error : new Error(String(error)), retryable: true }
        );
      case 400:
        const errorMessage = typeof data === 'object' && data && 'error' in data && 
          typeof data.error === 'object' && data.error && 'message' in data.error && 
          typeof data.error.message === 'string' ? data.error.message : 'Invalid request to OpenAI API';
        return createApiError(
          ApiErrorType.VALIDATION,
          errorMessage,
          'openai',
          { statusCode, endpoint, originalError: isError(error) ? error : new Error(String(error)) }
        );
      case 500:
      case 502:
      case 503:
        return createApiError(
          ApiErrorType.SERVER_ERROR,
          'OpenAI API server error',
          'openai',
          { statusCode, endpoint, originalError: isError(error) ? error : new Error(String(error)), retryable: true }
        );
      default:
        return createApiError(
          ApiErrorType.UNKNOWN,
          `OpenAI API error: ${statusCode}`,
          'openai',
          { statusCode, endpoint, originalError: isError(error) ? error : new Error(String(error)) }
        );
    }
  }
  
  // Network or other errors
  const errorMessage = isError(error) ? error.message : String(error);
  logger.error('OpenAI network error', isError(error) ? error : new Error(errorMessage), { endpoint });
  
  return createApiError(
    ApiErrorType.NETWORK,
    errorMessage || 'Network error connecting to OpenAI API',
    'openai',
    { endpoint, originalError: isError(error) ? error : new Error(errorMessage), retryable: true }
  );
}



