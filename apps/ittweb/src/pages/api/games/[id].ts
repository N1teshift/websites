import type { NextApiRequest } from "next";
import { createApiHandler } from "@websites/infrastructure/api";
// Import auth config to ensure default auth is registered
import "@/config/auth";
import {
  getGameById,
  deleteGame,
  updateGame,
} from "@/features/modules/game-management/games/lib/gameService";
import { createComponentLogger } from "@websites/infrastructure/logging";
import type { UpdateGame } from "@/features/modules/game-management/games/types";
import { normalizeCategoryFromTeamSize } from "@/features/modules/game-management/games/lib/gameCategory.utils";

const logger = createComponentLogger("api/games/[id]");

/**
 * GET /api/games/[id] - Get a game by ID (public)
 * PUT /api/games/[id] - Update a game by ID (requires authentication)
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

    if (req.method === "PUT") {
      // Require authentication for updates
      if (!context?.session) {
        throw new Error("Authentication required");
      }

      const body = req.body as UpdateGame & { teamSize?: string; customTeamSize?: string };

      // Handle category: prefer category field, or derive from teamSize for backward compat
      const updates: UpdateGame = { ...body };
      if (updates.category) {
        // Category provided, use it
      } else if (body.teamSize) {
        // Derive category from teamSize for backward compatibility
        updates.category = normalizeCategoryFromTeamSize(body.teamSize as any, body.customTeamSize);
      }

      // Remove deprecated fields from updates (keep them in body for backward compat during transition)
      delete (updates as any).teamSize;
      delete (updates as any).customTeamSize;

      await updateGame(id, updates);
      logger.info("Game updated", { id });
      return { message: "Game updated successfully" };
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
    methods: ["GET", "PUT", "DELETE"],
    requireAuth: false, // GET is public, PUT/DELETE will check auth manually
    logRequests: true,
    cacheControl: {
      public: true,
      maxAge: 60,
      mustRevalidate: true,
    },
  }
);
