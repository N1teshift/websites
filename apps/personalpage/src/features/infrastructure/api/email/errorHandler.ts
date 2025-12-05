import { createComponentLogger } from '@websites/infrastructure/logging';

const logger = createComponentLogger('EmailErrorHandler');

/**
 * Handles email-related errors with appropriate logging and error transformation
 */
export function handleEmailError(error: unknown, context: string): Error {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const fullContext = `EmailService:${context}`;

  logger.error(`Email error in ${context}`, error instanceof Error ? error : new Error(errorMessage), {
    component: 'EmailService',
    operation: context,
  });

  if (errorMessage.includes('authentication')) {
    return new Error(`Email authentication failed: ${errorMessage}`);
  }

  if (errorMessage.includes('connection') || errorMessage.includes('timeout')) {
    return new Error(`Email connection failed: ${errorMessage}`);
  }

  if (errorMessage.includes('invalid')) {
    return new Error(`Invalid email configuration: ${errorMessage}`);
  }

  return new Error(`Email service error: ${errorMessage}`);
}







