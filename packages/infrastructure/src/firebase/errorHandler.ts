import { logError } from '../logging';

export enum FirebaseErrorType {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  NETWORK = 'NETWORK',
  UNKNOWN = 'UNKNOWN',
}

export interface FirebaseError {
  type: FirebaseErrorType;
  message: string;
  originalError: unknown;
  retryable: boolean;
}

export function handleFirebaseError(
  error: unknown,
  operation: string
): FirebaseError {
  const errorObj = error as any;
  
  let type = FirebaseErrorType.UNKNOWN;
  let retryable = false;

  if (errorObj?.code === 'permission-denied') {
    type = FirebaseErrorType.PERMISSION_DENIED;
  } else if (errorObj?.code === 'not-found') {
    type = FirebaseErrorType.NOT_FOUND;
  } else if (errorObj?.code === 'already-exists') {
    type = FirebaseErrorType.ALREADY_EXISTS;
  } else if (errorObj?.code === 'unavailable') {
    type = FirebaseErrorType.NETWORK;
    retryable = true;
  }

  const message = `Firebase ${operation} failed: ${errorObj?.message || 'Unknown error'}`;
  
  logError(error instanceof Error ? error : new Error(String(error)), message, { component: 'firebase', operation, type });

  return {
    type,
    message,
    originalError: error,
    retryable,
  };
}

