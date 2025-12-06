/**
 * Compatibility wrapper for ittweb-specific API handlers
 * This file provides ittweb-specific auth configuration for the generic handlers
 * from @websites/infrastructure/api
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import {
  createApiHandler as createGenericApiHandler,
  type ApiHandler,
  type ApiHandlerOptions,
} from '@websites/infrastructure/api';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getUserDataByDiscordIdServer } from '@/features/modules/community/users/services/userDataService.server';
import { isAdmin } from '@/features/modules/community/users';

/**
 * Create ittweb-specific auth config
 */
function getIttwebAuthConfig() {
  return {
    getSession: async (req: NextApiRequest, res: NextApiResponse): Promise<Session | null> => {
      return await getServerSession(req, res, authOptions);
    },
    checkAdmin: async (session: Session): Promise<boolean> => {
      const userData = await getUserDataByDiscordIdServer(session.discordId || '');
      return isAdmin(userData?.role);
    },
  };
}

/**
 * Create an API handler with ittweb auth configuration
 */
export const createApiHandler = <T = unknown>(
  handler: ApiHandler<T>,
  options: ApiHandlerOptions = {}
) => {
  // Automatically add authConfig if auth is required
  const needsAuth = options.requireAuth || options.requireAdmin;
  const finalOptions = needsAuth
    ? { ...options, authConfig: getIttwebAuthConfig() }
    : options;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createGenericApiHandler(handler, finalOptions as any);
};

/**
 * Helper to create GET-only API handlers
 */
export const createGetHandler = <T = unknown>(
  handler: ApiHandler<T>,
  options?: Omit<ApiHandlerOptions, 'methods'>
) => {
  return createApiHandler(handler, { ...options, methods: ['GET'] });
};

/**
 * Helper to create POST-only API handlers
 */
export const createPostHandler = <T = unknown>(
  handler: ApiHandler<T>,
  options?: Omit<ApiHandlerOptions, 'methods'>
) => {
  return createApiHandler(handler, { ...options, methods: ['POST'] });
};

/**
 * Helper to create handlers that accept both GET and POST
 */
export const createGetPostHandler = <T = unknown>(
  handler: ApiHandler<T>,
  options?: Omit<ApiHandlerOptions, 'methods'>
) => {
  return createApiHandler(handler, { ...options, methods: ['GET', 'POST'] });
};

/**
 * Helper to check if a user owns a resource or is an admin
 * @param resource - The resource to check ownership for
 * @param session - The user session
 * @param ownerField - The field name that contains the owner ID (default: 'createdByDiscordId')
 * @returns Promise<boolean> - true if user owns the resource or is admin
 */
export async function checkResourceOwnership(
  resource: { [key: string]: unknown } | null | undefined,
  session: Session | null,
  ownerField: string = 'createdByDiscordId'
): Promise<boolean> {
  if (!session?.discordId) {
    return false;
  }

  if (!resource) {
    return false;
  }

  // Check if user is admin
  const userData = await getUserDataByDiscordIdServer(session.discordId);
  if (isAdmin(userData?.role)) {
    return true;
  }

  // Check if user owns the resource
  const ownerId = resource[ownerField];
  return ownerId === session.discordId;
}

// Re-export other utilities that don't need auth config
export {
  errorResponse,
  successResponse,
  requireSession,
  type ApiResponse,
  type HttpMethod,
  type CacheControlOptions,
  type ResourceOwnershipChecker,
} from '@websites/infrastructure/api';
