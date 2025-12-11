import {
  getUnitsByType,
  getUnitById,
  type UnitData,
} from "@/features/modules/content/guides/data/units";
import type { BuildingEvent } from "@/features/modules/game-management/lib/mechanics/replay/types";

/**
 * Decode Warcraft III object ID integer into its 4-character string
 * Same function as used for items
 */
function decodeObjectId(value: number): string | null {
  if (typeof value !== "number" || Number.isNaN(value) || value === 0) {
    return null;
  }

  let result = "";
  let remaining = value;

  // Extract 4 bytes (characters) from the integer (little-endian)
  for (let i = 0; i < 4; i++) {
    const charCode = remaining & 0xff;
    result = String.fromCharCode(charCode) + result;
    remaining = remaining >>> 8;
  }

  return result.trim() ? result : null;
}

/**
 * Mapping from building 4-character codes to unit IDs
 * This maps decoded building codes (e.g., "x01y") to full unit IDs (e.g., "x01y:hhou")
 *
 * This mapping can be populated manually or generated from replay data.
 * To find the code for a building ID, decode it using decodeObjectId().
 */
const BUILDING_CODE_TO_UNIT_ID: Record<string, string> = {
  // Example mappings (to be populated with actual decoded codes):
  // "x01y": "x01y:hhou", // Mixing Pot
  // "x023": "x023:hhou", // Tannery
  // Add more mappings as needed based on decoded building IDs from replays
};

/**
 * Get building unit data by buildingId
 * Converts a numeric replay ID to a building unit by:
 * 1. Decoding the numeric ID to a 4-character code
 * 2. Looking up the unit by the decoded code or trying to match it
 */
export function getBuildingByReplayId(buildingId: number): UnitData | null {
  if (!buildingId || buildingId === 0) {
    return null;
  }

  // Step 1: Decode numeric ID to 4-character code
  const buildingCode = decodeObjectId(buildingId);
  if (!buildingCode) {
    return null;
  }

  // Step 2: Try direct mapping first
  const unitId = BUILDING_CODE_TO_UNIT_ID[buildingCode];
  if (unitId) {
    const unit = getUnitById(unitId);
    if (unit && unit.type === "building") {
      return unit;
    }
  }

  // Step 3: Try to find unit by matching the decoded code
  // Building codes from replay are 4-character codes that need to be matched to unit IDs
  // Unit IDs are in format like "x01y:hhou" where "x01y" is the custom code
  const allBuildings = getUnitsByType("building");

  // Try different matching strategies
  const matchedBuilding = allBuildings.find((building) => {
    // Strategy 1: Exact match (if code is full unit ID)
    if (building.id === buildingCode) {
      return true;
    }

    // Strategy 2: Match the custom code part (before colon)
    // Unit IDs are like "x01y:hhou", so extract "x01y"
    const unitCodePart = building.id.split(":")[0];
    if (unitCodePart && unitCodePart === buildingCode) {
      return true;
    }

    // Strategy 3: Case-insensitive match
    if (unitCodePart && unitCodePart.toLowerCase() === buildingCode.toLowerCase()) {
      return true;
    }

    return false;
  });

  if (matchedBuilding) {
    return matchedBuilding;
  }

  // Step 4: Debug logging in development
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    console.debug(
      "[getBuildingByReplayId] No building found for code:",
      buildingCode,
      "from building ID:",
      buildingId,
      "- Available building codes (first 10):",
      allBuildings.slice(0, 10).map((b) => b.id.split(":")[0])
    );
  }

  return null;
}

/**
 * Get all buildings from units data
 */
export function getAllBuildings(): UnitData[] {
  return getUnitsByType("building");
}

/**
 * Format time in seconds to MM:SS format
 */
export function formatTimeMMSS(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Filter building events to only FINISH status and sort by time
 */
export function getFinishedBuildings(events: BuildingEvent[]): BuildingEvent[] {
  return events
    .filter((event) => event.status === "FINISH")
    .sort((a, b) => a.timeSeconds - b.timeSeconds);
}

/**
 * Group building events by team
 */
export function groupBuildingsByTeam(events: BuildingEvent[]): Map<number, BuildingEvent[]> {
  const grouped = new Map<number, BuildingEvent[]>();

  for (const event of events) {
    if (!grouped.has(event.team)) {
      grouped.set(event.team, []);
    }
    grouped.get(event.team)!.push(event);
  }

  // Sort each team's buildings by time
  for (const [, buildings] of grouped.entries()) {
    buildings.sort((a, b) => a.timeSeconds - b.timeSeconds);
  }

  return grouped;
}
