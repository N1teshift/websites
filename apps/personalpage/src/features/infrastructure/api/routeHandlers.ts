/**
 * Compatibility wrapper for personalpage-specific API handlers
 * This file provides personalpage-specific auth configuration for the generic handlers
 * from @websites/infrastructure/api
 */

import { NextApiRequest, NextApiResponse } from "next";
import {
  createApiHandler as createGenericApiHandler,
  type ApiHandler,
  type ApiHandlerOptions,
} from "@websites/infrastructure/api";
import { getSession } from "@websites/infrastructure/auth";

/**
 * Create personalpage-specific auth config
 * Converts SessionData to GenericSession format
 */
function getPersonalpageAuthConfig() {
  return {
    getSession: async (req: NextApiRequest, _res: NextApiResponse) => {
      const sessionData = getSession(req);
      if (!sessionData) {
        return null;
      }
      // Convert SessionData to GenericSession format
      // GenericSession is flexible and accepts any properties
      return sessionData as any;
    },
  };
}

/**
 * Create an API handler with personalpage auth configuration
 */
export const createApiHandler = <T = unknown>(
  handler: ApiHandler<T>,
  options: ApiHandlerOptions = {}
) => {
  // Automatically add authConfig if auth is required
  const needsAuth = options.requireAuth;
  const finalOptions = needsAuth
    ? { ...options, authConfig: getPersonalpageAuthConfig() }
    : options;

  return createGenericApiHandler(handler, finalOptions);
};

/**
 * Helper to create GET-only API handlers
 */
export const createGetHandler = <T = unknown>(
  handler: ApiHandler<T>,
  options?: Omit<ApiHandlerOptions, "methods">
) => {
  return createApiHandler(handler, { ...options, methods: ["GET"] });
};

/**
 * Helper to create POST-only API handlers
 */
export const createPostHandler = <T = unknown>(
  handler: ApiHandler<T>,
  options?: Omit<ApiHandlerOptions, "methods">
) => {
  return createApiHandler(handler, { ...options, methods: ["POST"] });
};

/**
 * Helper to create handlers that accept both GET and POST
 */
export const createGetPostHandler = <T = unknown>(
  handler: ApiHandler<T>,
  options?: Omit<ApiHandlerOptions, "methods">
) => {
  return createApiHandler(handler, { ...options, methods: ["GET", "POST"] });
};

// Re-export other utilities that don't need auth config
export {
  errorResponse,
  successResponse,
  requireSession,
  type ApiResponse,
  type HttpMethod,
  type CacheControlOptions,
  type ResourceOwnershipChecker,
} from "@websites/infrastructure/api";
