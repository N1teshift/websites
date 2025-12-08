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
 * Create ittweb-specific auth config
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
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
  const finalOptions = needsAuth ? { ...options, authConfig: getIttwebAuthConfig() } : options;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createGenericApiHandler(handler, finalOptions as any);
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
