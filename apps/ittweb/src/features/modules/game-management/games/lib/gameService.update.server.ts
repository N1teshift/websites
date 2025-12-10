/**
 * Game Service - Update Operations (Server-Only)
 *
 * Server-only functions for updating games.
 * These functions use Firebase Admin SDK and should only be used in API routes.
 */

import { getFirestoreAdmin } from "@websites/infrastructure/firebase/admin";
import { logError } from "@websites/infrastructure/logging";
import { removeUndefined, createTimestampFactoryAsync } from "@websites/infrastructure/utils";
import { invalidateAnalyticsCache } from "@websites/infrastructure/cache/analyticsCache.server";
import type { UpdateGame } from "../types";
import { updateEloScores } from "@/features/modules/game-management/lib/mechanics";
import { normalizeCategoryFromTeamSize } from "./gameCategory.utils";

const GAMES_COLLECTION = "games";

/**
 * Update a game (Server-Only)
 */
export async function updateGame(id: string, updates: UpdateGame): Promise<void> {
  try {
    const cleanedUpdates = removeUndefined(updates as unknown as Record<string, unknown>);
    const updateData: Record<string, unknown> = { ...cleanedUpdates };
    const timestampFactory = await createTimestampFactoryAsync();

    // Handle category: prefer category field, or derive from teamSize for backward compat
    if (updates.category) {
      updateData.category = updates.category;
    } else if (updates.teamSize) {
      // Derive category from teamSize for backward compatibility
      const category = normalizeCategoryFromTeamSize(updates.teamSize, updates.customTeamSize);
      if (category) {
        updateData.category = category;
      }
    }

    // Remove deprecated fields from update data
    delete updateData.teamSize;
    delete updateData.customTeamSize;

    if (cleanedUpdates.datetime) {
      updateData.datetime = timestampFactory.fromDate(new Date(cleanedUpdates.datetime as string));
    }

    if (cleanedUpdates.scheduledDateTime && typeof cleanedUpdates.scheduledDateTime === "string") {
      updateData.scheduledDateTime = timestampFactory.fromDate(
        new Date(cleanedUpdates.scheduledDateTime as string)
      );
      updateData.scheduledDateTimeString = cleanedUpdates.scheduledDateTime;
    }

    const adminDb = getFirestoreAdmin();
    await adminDb
      .collection(GAMES_COLLECTION)
      .doc(id)
      .update({
        ...updateData,
        updatedAt: timestampFactory.now(),
      });

    // Recalculate ELO if game result changed
    if (cleanedUpdates.players) {
      await updateEloScores(id);
    }

    // Invalidate analytics cache
    invalidateAnalyticsCache().catch(() => {});
  } catch (error) {
    const err = error as Error;
    logError(err, "Failed to update game", {
      component: "gameService",
      operation: "updateGame",
      id,
    });
    throw err;
  }
}
