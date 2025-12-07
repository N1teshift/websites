import { 
  ApiError, 
  ApiErrorType, 
  createApiError, 
  isError, 
  createErrorLogger 
} from '../../logging';

/**
 * Type guard for Firebase-like errors
 */
function isFirebaseError(err: unknown): err is { code?: string; message?: string } {
  return typeof err === 'object' && err !== null && 'code' in err;
}

/**
 * Handle Firebase Storage API errors
 */
export function handleFirebaseStorageError(error: unknown, operation: string): ApiError {
  const logger = createErrorLogger('firebase.storage');

  logger.error('Firebase Storage error', isError(error) ? error : new Error(String(error)), { operation });

  if (isFirebaseError(error) && error.code) {
    switch (error.code) {
      case 'auth/invalid-credential':
        return createApiError(
          ApiErrorType.AUTHENTICATION,
          'Firebase Storage authentication failed',
          'firebase.storage',
          { originalError: isError(error) ? error : new Error(String(error)) }
        );
      case 'permission-denied':
        return createApiError(
          ApiErrorType.AUTHORIZATION,
          'Firebase Storage permission denied',
          'firebase.storage',
          { originalError: isError(error) ? error : new Error(String(error)) }
        );
      case 'resource-exhausted':
        return createApiError(
          ApiErrorType.QUOTA_EXCEEDED,
          'Firebase Storage quota exceeded',
          'firebase.storage',
          { originalError: isError(error) ? error : new Error(String(error)) }
        );
      case 'unavailable':
        return createApiError(
          ApiErrorType.SERVER_ERROR,
          'Firebase Storage service unavailable',
          'firebase.storage',
          { originalError: isError(error) ? error : new Error(String(error)), retryable: true }
        );
      default:
        return createApiError(
          ApiErrorType.UNKNOWN,
          `Firebase Storage error: ${error.code}`,
          'firebase.storage',
          { originalError: isError(error) ? error : new Error(String(error)) }
        );
    }
  }

  const errorMessage = isError(error) ? error.message : String(error);
  return createApiError(
    ApiErrorType.UNKNOWN,
    errorMessage || 'Unknown Firebase Storage error',
    'firebase.storage',
    { originalError: isError(error) ? error : new Error(errorMessage) }
  );
}
