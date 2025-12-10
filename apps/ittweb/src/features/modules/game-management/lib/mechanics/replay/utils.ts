import type Player from "w3gjs/dist/types/Player";
import type { GameCategory } from "@/features/modules/game-management/games/types";

export function getDurationSeconds(durationMs?: number): number {
  if (!durationMs || Number.isNaN(durationMs)) {
    return 1;
  }
  return Math.max(1, Math.round(durationMs / 1000));
}

export function deriveCategory(players: Player[]): GameCategory | undefined {
  const teamCounts = players.reduce<Record<number, number>>((acc, player) => {
    acc[player.teamid] = (acc[player.teamid] || 0) + 1;
    return acc;
  }, {});

  // Get team IDs and sort them to preserve team order (team 1, team 2, etc.)
  const teamIds = Object.keys(teamCounts)
    .map(Number)
    .sort((a, b) => a - b);

  // Get counts in team order (not sorted by size)
  const counts = teamIds.map((teamId) => teamCounts[teamId]);

  // Single team: 1v1 or Xp format
  if (counts.length === 1) {
    return counts[0] === 1 ? "1v1" : (`${counts[0]}p` as GameCategory);
  }

  // Two or more teams: output in team order (e.g., "2v3", "3v3v3", "2v2v2v2")
  return counts.join("v") as GameCategory;
}
