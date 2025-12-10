/**
 * Game Category Utilities
 *
 * Helper functions for working with the unified category field,
 * with backward compatibility for teamSize/customTeamSize.
 */

import type { Game, GameCategory, TeamSize } from "../types";

/**
 * Derive category from teamSize (for backward compatibility)
 * @param teamSize - The old teamSize field
 * @param customTeamSize - The old customTeamSize field (used when teamSize is "custom")
 * @returns The category string, or undefined if no teamSize provided
 */
export function deriveCategoryFromTeamSize(
  teamSize?: TeamSize,
  customTeamSize?: string
): GameCategory | undefined {
  if (!teamSize) return undefined;
  if (teamSize === "custom") return customTeamSize;
  return teamSize;
}

/**
 * Get category from game (with fallback to teamSize for backward compat)
 * This is the primary function to use when reading category from a game.
 *
 * @param game - The game object
 * @returns The category string, or undefined if not available
 */
export function getGameCategory(game: Game): GameCategory | undefined {
  // Prefer category field (new unified field)
  if (game.category) {
    return game.category;
  }

  // Fallback to teamSize for backward compatibility (scheduled games)
  if (game.gameState === "scheduled") {
    return deriveCategoryFromTeamSize(game.teamSize, game.customTeamSize);
  }

  return undefined;
}

/**
 * Normalize category value from teamSize input
 * Used when creating/updating scheduled games from forms that still use teamSize
 *
 * @param teamSize - The teamSize value from form
 * @param customTeamSize - The customTeamSize value from form (if teamSize is "custom")
 * @returns The normalized category string
 */
export function normalizeCategoryFromTeamSize(
  teamSize: TeamSize | undefined,
  customTeamSize?: string
): GameCategory | undefined {
  if (!teamSize) return undefined;
  if (teamSize === "custom") {
    return customTeamSize || undefined;
  }
  return teamSize;
}
