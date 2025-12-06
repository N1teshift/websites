import { 
  ApiError, 
  ApiErrorType, 
  createApiError, 
  isAxiosError, 
  isError, 
  createErrorLogger 
} from '@websites/infrastructure/logging';

/**
 * Handle Microsoft API errors
 */
export function handleMicrosoftError(error: unknown, endpoint: string): ApiError {
  const logger = createErrorLogger('microsoft');
  
  logger.error('Microsoft API error', isError(error) ? error : new Error(String(error)), { endpoint });
  
  if (isAxiosError(error) && error.response) {
    const statusCode = error.response.status;
    
    switch (statusCode) {
      case 401:
        return createApiError(
          ApiErrorType.AUTHENTICATION,
          'Microsoft API authentication failed',
          'microsoft',
          { statusCode, endpoint, originalError: isError(error) ? error : new Error(String(error)) }
        );
      case 403:
        return createApiError(
          ApiErrorType.AUTHORIZATION,
          'Microsoft API permission denied',
          'microsoft',
          { statusCode, endpoint, originalError: isError(error) ? error : new Error(String(error)) }
        );
      case 429:
        return createApiError(
          ApiErrorType.RATE_LIMIT,
          'Microsoft API rate limit exceeded',
          'microsoft',
          { statusCode, endpoint, originalError: isError(error) ? error : new Error(String(error)), retryable: true }
        );
      default:
        return createApiError(
          ApiErrorType.UNKNOWN,
          `Microsoft API error: ${statusCode}`,
          'microsoft',
          { statusCode, endpoint, originalError: isError(error) ? error : new Error(String(error)) }
        );
    }
  }
  
  const errorMessage = isError(error) ? error.message : String(error);
  return createApiError(
    ApiErrorType.NETWORK,
    errorMessage || 'Network error connecting to Microsoft API',
    'microsoft',
    { endpoint, originalError: isError(error) ? error : new Error(errorMessage), retryable: true }
  );
}



