import type { NextAuthOptions } from "next-auth";
import { createComponentLogger, logError } from "../../logging";

/**
 * Shared NextAuth configuration utilities
 * Provides common patterns for NextAuth setup across apps
 */

/**
 * Creates a standard NextAuth logger configuration
 */
export function createNextAuthLogger(componentName: string = 'nextauth') {
  const logger = createComponentLogger(componentName);
  
  return {
    error(code: string, ...metadata: unknown[]) {
      const meta: Record<string, unknown> = {
        code: String(code),
      };
      if (metadata.length > 0) {
        meta.metadata = metadata;
      }
      logger.error('NextAuth error', undefined, meta);
    },
  };
}

/**
 * Creates standard NextAuth event handlers with logging
 */
export function createNextAuthEvents(logger: ReturnType<typeof createComponentLogger>) {
  return {
    async signIn(message: unknown) {
      logger.debug('User signed in', { message });
    },
    async signOut(message: unknown) {
      logger.debug('User signed out', { message });
    },
  };
}

/**
 * Base NextAuth configuration that apps can extend
 * Provides common settings like JWT strategy, logging, and error handling
 */
export function createBaseNextAuthConfig(
  options: {
    secret?: string;
    debug?: boolean;
    loggerComponentName?: string;
  } = {}
): Partial<NextAuthOptions> {
  const logger = createComponentLogger(options.loggerComponentName || 'nextauth');
  
  return {
    secret: options.secret || process.env.NEXTAUTH_SECRET,
    session: { strategy: "jwt" },
    debug: options.debug ?? process.env.NODE_ENV === 'development',
    logger: createNextAuthLogger(options.loggerComponentName),
    events: createNextAuthEvents(logger),
  };
}

/**
 * Helper to safely execute callbacks with error handling
 * Prevents auth failures from breaking the authentication flow
 */
export async function safeCallback<T>(
  callback: () => Promise<T>,
  fallback: T,
  errorContext: { component: string; operation: string; [key: string]: unknown }
): Promise<T> {
  try {
    return await callback();
  } catch (error) {
    logError(error as Error, `Failed to execute ${errorContext.operation}`, errorContext);
    return fallback;
  }
}

