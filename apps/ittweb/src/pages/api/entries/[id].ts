import type { NextApiRequest } from "next";
import { createApiHandler, zodValidator } from "@websites/infrastructure/api";
// Import auth config to ensure default auth is registered
import "@/config/auth";
import { updateEntry } from "@/features/modules/game-management/entries/lib/entryService";
import { UpdateEntrySchema } from "@/features/modules/game-management/entries/lib";
import { createComponentLogger } from "@websites/infrastructure/logging";

const logger = createComponentLogger("api/entries/[id]");

/**
 * PUT /api/entries/[id] - Update an entry by ID (requires authentication)
 */
export default createApiHandler(
  async (req: NextApiRequest, res, context) => {
    const id = req.query.id as string;

    if (!id) {
      throw new Error("Entry ID is required");
    }

    if (req.method === "PUT") {
      // Require authentication
      if (!context?.session) {
        throw new Error("Authentication required");
      }

      const updates = req.body;
      await updateEntry(id, updates);
      logger.info("Entry updated", { id });
      return { message: "Entry updated successfully" };
    }

    throw new Error("Method not allowed");
  },
  {
    methods: ["PUT"],
    requireAuth: true,
    logRequests: true,
    validateBody: zodValidator(UpdateEntrySchema),
  }
);
