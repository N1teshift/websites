/**
 * Error Tracking Integration
 * 
 * Provides error tracking capabilities with console logging.
 */

export interface ErrorContext {
  component?: string;
  operation?: string;
  userId?: string;
  sessionId?: string;
  [key: string]: unknown;
}

/**
 * Initialize error tracking
 * Call this once during app initialization
 */
export function initializeErrorTracking(): void {
  // Error tracking is always enabled (console logging)
  // No initialization needed
}

/**
 * Capture an error with context
 */
export function captureError(
  error: Error,
  context?: ErrorContext
): void {
  const errorContext: Record<string, unknown> = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    ...context,
  };

  // Add error category if available
  if (context?.category) {
    errorContext.category = context.category;
  }

  // Log to console
    console.error('[Error]', error, errorContext);
}

/**
 * Capture a message (non-error)
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: ErrorContext
): void {
  const logMethod = level === 'error' ? 'error' : level === 'warning' ? 'warn' : 'info';
  console[logMethod](`[${level.toUpperCase()}]`, message, context);
}

/**
 * Set user context for error tracking
 */
export function setUserContext(userId: string, email?: string, username?: string): void {
  // User context tracking not implemented
  // Can be extended in the future if needed
}

/**
 * Check if error tracking is enabled
 */
export function isErrorTrackingEnabled(): boolean {
  // Error tracking is always enabled (console logging)
  return true;
}
