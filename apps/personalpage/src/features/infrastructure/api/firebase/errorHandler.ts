import { 
  ApiError, 
  ApiErrorType, 
  createApiError, 
  isError, 
  createErrorLogger 
} from '@websites/infrastructure/logging';

/**
 * Type guard for Firebase-like errors
 */
function isFirebaseError(err: unknown): err is { code?: string; message?: string } {
  return typeof err === 'object' && err !== null && 'code' in err;
}

/**
 * Handle Firebase API errors
 */
export function handleFirebaseError(error: unknown, operation: string): ApiError {
  const logger = createErrorLogger('firebase');
  
  logger.error('Firebase error', isError(error) ? error : new Error(String(error)), { operation });
  
  if (isFirebaseError(error) && error.code) {
    switch (error.code) {
      case 'auth/invalid-credential':
        return createApiError(
          ApiErrorType.AUTHENTICATION,
          'Firebase authentication failed',
          'firebase',
          { originalError: isError(error) ? error : new Error(String(error)) }
        );
      case 'permission-denied':
        return createApiError(
          ApiErrorType.AUTHORIZATION,
          'Firebase permission denied',
          'firebase',
          { originalError: isError(error) ? error : new Error(String(error)) }
        );
      case 'resource-exhausted':
        return createApiError(
          ApiErrorType.QUOTA_EXCEEDED,
          'Firebase quota exceeded',
          'firebase',
          { originalError: isError(error) ? error : new Error(String(error)) }
        );
      case 'unavailable':
        return createApiError(
          ApiErrorType.SERVER_ERROR,
          'Firebase service unavailable',
          'firebase',
          { originalError: isError(error) ? error : new Error(String(error)), retryable: true }
        );
      default:
        return createApiError(
          ApiErrorType.UNKNOWN,
          `Firebase error: ${error.code}`,
          'firebase',
          { originalError: isError(error) ? error : new Error(String(error)) }
        );
    }
  }
  
  const errorMessage = isError(error) ? error.message : String(error);
  return createApiError(
    ApiErrorType.UNKNOWN,
    errorMessage || 'Unknown Firebase error',
    'firebase',
    { originalError: isError(error) ? error : new Error(errorMessage) }
  );
}



