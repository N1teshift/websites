import { NextApiRequest, NextApiResponse } from "next";
import { clearSessionCookie } from "@websites/infrastructure/auth/session";
import { createComponentLogger } from "@websites/infrastructure/logging";

const logger = createComponentLogger("UserLogout");

/**
 * API route handler for user logout
 *
 * Clears the session cookie
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    clearSessionCookie(res);
    logger.info("User logged out");

    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    logger.error("Error during logout", error instanceof Error ? error : new Error(String(error)));
    res.status(500).json({ message: "Server error during logout." });
  }
}
