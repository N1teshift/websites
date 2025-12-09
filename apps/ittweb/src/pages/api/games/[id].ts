import type { NextApiRequest } from "next";
import { createApiHandler } from "@websites/infrastructure/api";
// Import auth config to ensure default auth is registered
import "@/config/auth";
import { getGameById, deleteGame } from "@/features/modules/game-management/games/lib/gameService";
import { createComponentLogger } from "@websites/infrastructure/logging";

const logger = createComponentLogger("api/games/[id]");

/**
 * GET /api/games/[id] - Get a game by ID (public)
 * DELETE /api/games/[id] - Delete a game by ID (requires authentication)
 */
export default createApiHandler(
  async (req: NextApiRequest, res, context) => {
    const id = req.query.id as string;

    if (!id) {
      throw new Error("Game ID is required");
    }

    if (req.method === "GET") {
      const game = await getGameById(id);
      if (!game) {
        const error = new Error("Game not found") as Error & { statusCode?: number };
        error.statusCode = 404;
        throw error;
      }
      return game;
    }

    if (req.method === "DELETE") {
      // Require authentication for deletion
      if (!context?.session) {
        throw new Error("Authentication required");
      }

      await deleteGame(id);
      logger.info("Game deleted", { id });
      return { message: "Game deleted successfully" };
    }

    throw new Error("Method not allowed");
  },
  {
    methods: ["GET", "DELETE"],
    requireAuth: false, // GET is public, DELETE will check auth manually
    logRequests: true,
    cacheControl: {
      public: true,
      maxAge: 60,
      mustRevalidate: true,
    },
  }
);
