import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import {
  createApiHandler as createGenericApiHandler,
  type ApiHandler,
  type ApiHandlerOptions,
  type GenericSession,
} from "@websites/infrastructure/api";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getUserDataByDiscordIdServer } from "@/features/modules/community/users/services/userDataService.server";
import { isAdmin } from "@/features/modules/community/users";

/**
 * @deprecated This wrapper is deprecated. Use @websites/infrastructure/api directly instead.
 *
 * The default auth configuration is now registered automatically via @/config/auth.
 * All handlers should import from @websites/infrastructure/api and rely on the default auth config.
 *
 * Migration example:
 * ```typescript
 * // Old (deprecated):
 * import { createPostHandler } from "@/lib/api-wrapper";
 *
 * // New:
 * import { createPostHandler } from "@websites/infrastructure/api";
 * import "@/config/auth"; // Ensures default auth is registered
 * ```
 *
 * This wrapper will be removed in a future major version.
 */

/**
 * Create ittweb-specific auth config
 * @deprecated Use getIttwebAuthConfig from @/lib/auth-config instead
 */
function getIttwebAuthConfig() {
  return {
    getSession: async (req: NextApiRequest, res: NextApiResponse): Promise<Session | null> => {
      return await getServerSession(req, res, authOptions);
    },
    checkAdmin: async (session: GenericSession): Promise<boolean> => {
      const userData = await getUserDataByDiscordIdServer(session.discordId || "");
      return isAdmin(userData?.role);
    },
  } as any;
}

/**
 * Create an API handler with ittweb auth configuration
 * @deprecated Use createApiHandler from @websites/infrastructure/api directly.
 * The default auth config is now registered automatically.
 */
export const createApiHandler = <T = unknown>(
  handler: ApiHandler<T>,
  options: ApiHandlerOptions = {}
) => {
  // Automatically add authConfig if auth is required
  const needsAuth = options.requireAuth || options.requireAdmin;
  const finalOptions = needsAuth ? { ...options, authConfig: getIttwebAuthConfig() } : options;

  return createGenericApiHandler(handler, finalOptions as any);
};

/**
 * Helper to create GET-only API handlers
 * @deprecated Use createGetHandler from @websites/infrastructure/api directly.
 */
export const createGetHandler = <T = unknown>(
  handler: ApiHandler<T>,
  options?: Omit<ApiHandlerOptions, "methods">
) => {
  return createApiHandler(handler, { ...options, methods: ["GET"] });
};

/**
 * Helper to create POST-only API handlers
 * @deprecated Use createPostHandler from @websites/infrastructure/api directly.
 */
export const createPostHandler = <T = unknown>(
  handler: ApiHandler<T>,
  options?: Omit<ApiHandlerOptions, "methods">
) => {
  return createApiHandler(handler, { ...options, methods: ["POST"] });
};

/**
 * Helper to create handlers that accept both GET and POST
 * @deprecated Use createGetPostHandler from @websites/infrastructure/api directly.
 */
export const createGetPostHandler = <T = unknown>(
  handler: ApiHandler<T>,
  options?: Omit<ApiHandlerOptions, "methods">
) => {
  return createApiHandler(handler, { ...options, methods: ["GET", "POST"] });
};

/**
 * Helper to check if a user owns a resource or is an admin
 */
export async function checkResourceOwnership(
  resource: { [key: string]: unknown } | null | undefined,
  session: Session | null,
  ownerField: string = "createdByDiscordId"
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

// Re-export other utilities
export {
  errorResponse,
  successResponse,
  requireSession,
  zodValidator,
  parseQueryString,
  parseRequiredQueryString,
  parseQueryInt,
  parseRequiredQueryInt,
  parseQueryBoolean,
  parseQueryDate,
  parseQueryEnum,
  parseQueryArray,
  parsePagination,
  type ApiResponse,
  type HttpMethod,
  type CacheControlOptions,
  type ResourceOwnershipChecker,
} from "@websites/infrastructure/api";
