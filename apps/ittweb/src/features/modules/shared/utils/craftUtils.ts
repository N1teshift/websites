import type { CraftEvent } from "@/features/modules/game-management/lib/mechanics/replay/types";

/**
 * Format time in seconds to MM:SS format
 * Re-exported from buildingUtils for consistency
 */
export { formatTimeMMSS } from "./buildingUtils";

/**
 * Filter craft events to only SUCCESS status and sort by time
 */
export function getSuccessfulCrafts(events: CraftEvent[]): CraftEvent[] {
  return events
    .filter((event) => event.status === "SUCCESS")
    .sort((a, b) => a.timeSeconds - b.timeSeconds);
}

/**
 * Group craft events by team
 */
export function groupCraftsByTeam(events: CraftEvent[]): Map<number, CraftEvent[]> {
  const grouped = new Map<number, CraftEvent[]>();

  for (const event of events) {
    if (!grouped.has(event.team)) {
      grouped.set(event.team, []);
    }
    grouped.get(event.team)!.push(event);
  }

  // Sort each team's crafts by time
  for (const [, crafts] of grouped.entries()) {
    crafts.sort((a, b) => a.timeSeconds - b.timeSeconds);
  }

  return grouped;
}
