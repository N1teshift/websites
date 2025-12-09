import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import type { AuthConfig, GenericSession } from "@websites/infrastructure/api";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getUserDataByDiscordIdServer } from "@/features/modules/community/users/services/userDataService.server";
import { isAdmin } from "@/features/modules/community/users";

/**
 * Create ITT web-specific auth configuration.
 * This config is used to register the default authentication for all API handlers.
 *
 * @returns AuthConfig configured for ITT web app using NextAuth with Discord
 *
 * @example
 * ```typescript
 * import { registerDefaultAuthConfig } from "@websites/infrastructure/api";
 * import { getIttwebAuthConfig } from "@/lib/auth-config";
 *
 * // Register once at app startup
 * registerDefaultAuthConfig(getIttwebAuthConfig());
 * ```
 */
export function getIttwebAuthConfig(): AuthConfig {
  return {
    getSession: async (req: NextApiRequest, res: NextApiResponse): Promise<Session | null> => {
      return await getServerSession(req, res, authOptions);
    },
    checkAdmin: async (session: GenericSession): Promise<boolean> => {
      const userData = await getUserDataByDiscordIdServer(session.discordId || "");
      return isAdmin(userData?.role);
    },
  };
}
