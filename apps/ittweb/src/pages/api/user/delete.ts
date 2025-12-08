import type { NextApiRequest } from "next";
import { createPostHandler, requireSession } from "@websites/infrastructure/api";
import { deleteUserDataServer } from "@/features/modules/community/users/services/userDataService.server";
import { createComponentLogger } from "@websites/infrastructure/logging";

const logger = createComponentLogger("api/user/delete");

/**
 * POST /api/user/delete - Delete user account (requires authentication)
 */
export default createPostHandler<{ success: boolean; message: string }>(
  async (req: NextApiRequest, res, context) => {
    const session = requireSession(context);
    const discordId = session.discordId || "";

    logger.info("Deleting user account", { discordId });

    await deleteUserDataServer(discordId);

    logger.info("User account deleted successfully", { discordId });

    return { success: true, message: "Account deleted successfully" };
  },
  {
    requireAuth: true,
    logRequests: true,
  }
);
