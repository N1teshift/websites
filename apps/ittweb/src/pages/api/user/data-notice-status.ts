import type { NextApiRequest } from "next";
import { createGetHandler, requireSession } from "@websites/infrastructure/api";
// Import auth config to ensure default auth is registered
import "@/config/auth";
import { getUserDataByDiscordIdServer } from "@/features/modules/community/users/services/userDataService.server";

/**
 * GET /api/user/data-notice-status - Get user's data collection notice acceptance status (requires authentication)
 */
export default createGetHandler<{ accepted: boolean }>(
  async (req: NextApiRequest, res, context) => {
    const session = requireSession(context);
    const userData = await getUserDataByDiscordIdServer(session.discordId || "");

    return {
      accepted: userData?.dataCollectionNoticeAccepted ?? false,
    };
  },
  {
    requireAuth: true,
    logRequests: true,
    // authConfig is now provided by default registration - no need to specify manually
    // Private cache - user-specific data should not be cached publicly
    cacheControl: {
      private: true,
      maxAge: 60,
      mustRevalidate: true,
    },
  }
);
