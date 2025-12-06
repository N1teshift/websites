import { 
  ApiError, 
  ApiErrorType, 
  createApiError, 
  isAxiosError, 
  isError, 
  createErrorLogger 
} from '@websites/infrastructure/logging';

/**
 * Handle Google API errors
 */
export function handleGoogleError(error: unknown, endpoint: string): ApiError {
  const logger = createErrorLogger('google');
  
  logger.error('Google API error', isError(error) ? error : new Error(String(error)), { endpoint });
  
  if (isAxiosError(error) && error.response) {
    const statusCode = error.response.status;
    
    switch (statusCode) {
      case 401:
        return createApiError(
          ApiErrorType.AUTHENTICATION,
          'Google API authentication failed',
          'google',
          { statusCode, endpoint, originalError: isError(error) ? error : new Error(String(error)) }
        );
      case 403:
        return createApiError(
          ApiErrorType.AUTHORIZATION,
          'Google API permission denied',
          'google',
          { statusCode, endpoint, originalError: isError(error) ? error : new Error(String(error)) }
        );
      case 429:
        return createApiError(
          ApiErrorType.RATE_LIMIT,
          'Google API rate limit exceeded',
          'google',
          { statusCode, endpoint, originalError: isError(error) ? error : new Error(String(error)), retryable: true }
        );
      default:
        return createApiError(
          ApiErrorType.UNKNOWN,
          `Google API error: ${statusCode}`,
          'google',
          { statusCode, endpoint, originalError: isError(error) ? error : new Error(String(error)) }
        );
    }
  }
  
  const errorMessage = isError(error) ? error.message : String(error);
  return createApiError(
    ApiErrorType.NETWORK,
    errorMessage || 'Network error connecting to Google API',
    'google',
    { endpoint, originalError: isError(error) ? error : new Error(errorMessage), retryable: true }
  );
}



