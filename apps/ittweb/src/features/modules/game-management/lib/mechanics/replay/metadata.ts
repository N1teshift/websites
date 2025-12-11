import type { ITTMetadata, ITTPlayerStats, BuildingEvent, CraftEvent } from "./types";

/**
 * Extract ITT-specific metadata from W3MMD custom messages
 */
export function extractITTMetadata(w3mmdActions: unknown[]): ITTMetadata | undefined {
  const customData = new Map<string, string>();

  // Extract custom messages from W3MMD actions
  for (const action of w3mmdActions) {
    const actionObj = action as { cache?: { key?: string } };
    const key = actionObj.cache?.key;

    if (!key || typeof key !== "string") continue;

    // ITT custom messages format: "custom itt_<identifier> <data>"
    if (key.startsWith("custom itt_")) {
      const content = key.slice("custom ".length);
      const firstSpace = content.indexOf(" ");
      if (firstSpace !== -1) {
        const identifier = content.substring(0, firstSpace);
        const data = content.substring(firstSpace + 1);
        customData.set(identifier, data);
      }
    }
  }

  // Check if we have ITT metadata
  const chunksCountStr = customData.get("itt_chunks");
  if (!chunksCountStr) {
    return undefined;
  }

  const numChunks = parseInt(chunksCountStr, 10);
  if (isNaN(numChunks) || numChunks <= 0) {
    return undefined;
  }

  // Reconstruct payload from chunks
  const chunks: string[] = [];
  for (let i = 0; i < numChunks; i++) {
    const chunk = customData.get(`itt_data_${i}`);
    if (chunk !== undefined) {
      chunks.push(chunk);
    }
  }

  // Unescape backslashes (WurstMMD escapes spaces)
  const payload = chunks.join("").replace(/\\(.)/g, "$1");

  // Get schema version for parsing
  const schemaVersion = customData.get("itt_schema")
    ? parseInt(customData.get("itt_schema")!, 10)
    : undefined;

  // Parse the payload to extract player stats, building events, and craft events
  const { players, buildingEvents, craftEvents } = parseITTPayload(payload, schemaVersion);

  return {
    version: customData.get("itt_version"),
    schema: schemaVersion,
    payload,
    players,
    buildingEvents,
    craftEvents,
  };
}

/**
 * Parse item string with optional charges (format: "itemId:charges" or "itemId")
 * Returns { itemId, charges }
 */
function parseItemWithCharges(itemStr: string): { itemId: number; charges: number } {
  const colonIndex = itemStr.indexOf(":");
  if (colonIndex !== -1) {
    const itemId = parseInt(itemStr.substring(0, colonIndex), 10) || 0;
    const charges = parseInt(itemStr.substring(colonIndex + 1), 10) || 0;
    return { itemId, charges };
  }
  const itemId = parseInt(itemStr, 10) || 0;
  return { itemId, charges: itemId === 0 ? 0 : 1 }; // Default to 1 charge if item exists, 0 if empty slot
}

/**
 * Parse ITT metadata payload to extract player stats, building events, and craft events
 * Supports schema v2, v3, v4, v5, v6, v7, and v8 formats
 * Building events (v7+): build:<team>|<timeSeconds>|<unitTypeId>|<status>
 * Craft events (v8+): craft:<team>|<timeSeconds>|<itemId>|<status>
 */
function parseITTPayload(
  payload: string,
  schemaVersion?: number
): { players: ITTPlayerStats[]; buildingEvents?: BuildingEvent[]; craftEvents?: CraftEvent[] } {
  const players: ITTPlayerStats[] = [];
  const buildingEvents: BuildingEvent[] = [];
  const craftEvents: CraftEvent[] = [];
  const lines = payload.split("\n");

  for (const line of lines) {
    if (!line.startsWith("player:")) continue;

    const parts = line.slice("player:".length).split("|");

    // Schema v6 format: slot|name|race|class|team|result|dmg|selfHeal|allyHeal|gold|meat|elk|hawk|snake|wolf|bear|panther|items
    // Items format: "itemId:charges" for stacked items, "itemId" for non-stacked or empty
    if (parts.length >= 18 && schemaVersion && schemaVersion >= 6) {
      const itemsStr = parts[17];
      const items: number[] = [];
      const itemCharges: number[] = [];

      if (itemsStr) {
        const itemParts = itemsStr.split(",");
        for (const itemPart of itemParts) {
          const { itemId, charges } = parseItemWithCharges(itemPart);
          items.push(itemId);
          itemCharges.push(charges);
        }
      }

      const result = parts[5] || ""; // WIN, LOSS, LEAVE, etc.

      players.push({
        slotIndex: parseInt(parts[0], 10) || 0,
        name: parts[1] || "",
        trollClass: parts[3] || undefined,
        team: parseInt(parts[4], 10) || 0,
        result: result.toUpperCase(), // WIN, LOSS, LEAVE, etc.
        damageTroll: parseInt(parts[6], 10) || 0,
        selfHealing: parseInt(parts[7], 10) || 0,
        allyHealing: parseInt(parts[8], 10) || 0,
        goldAcquired: parseInt(parts[9], 10) || 0,
        meatEaten: parseInt(parts[10], 10) || 0,
        killsElk: parseInt(parts[11], 10) || 0,
        killsHawk: parseInt(parts[12], 10) || 0,
        killsSnake: parseInt(parts[13], 10) || 0,
        killsWolf: parseInt(parts[14], 10) || 0,
        killsBear: parseInt(parts[15], 10) || 0,
        killsPanther: parseInt(parts[16], 10) || 0,
        items,
        itemCharges,
      });
    }
    // Schema v4/v5 format: slot|name|race|class|team|result|dmg|selfHeal|allyHeal|gold|meat|elk|hawk|snake|wolf|bear|panther|items
    // Items are typically just comma-separated item IDs, but may include charges (format: "itemId:charges") for newer builds
    else if (parts.length >= 18 && schemaVersion && schemaVersion >= 4) {
      const itemsStr = parts[17];
      const items: number[] = [];
      const itemCharges: number[] = [];

      if (itemsStr) {
        const itemParts = itemsStr.split(",");
        for (const itemPart of itemParts) {
          const { itemId, charges } = parseItemWithCharges(itemPart);
          items.push(itemId);
          itemCharges.push(charges);
        }
      }

      const result = parts[5] || ""; // WIN, LOSS, LEAVE, etc.

      players.push({
        slotIndex: parseInt(parts[0], 10) || 0,
        name: parts[1] || "",
        trollClass: parts[3] || undefined,
        team: parseInt(parts[4], 10) || 0,
        result: result.toUpperCase(), // WIN, LOSS, LEAVE, etc.
        damageTroll: parseInt(parts[6], 10) || 0,
        selfHealing: parseInt(parts[7], 10) || 0,
        allyHealing: parseInt(parts[8], 10) || 0,
        goldAcquired: parseInt(parts[9], 10) || 0,
        meatEaten: parseInt(parts[10], 10) || 0,
        killsElk: parseInt(parts[11], 10) || 0,
        killsHawk: parseInt(parts[12], 10) || 0,
        killsSnake: parseInt(parts[13], 10) || 0,
        killsWolf: parseInt(parts[14], 10) || 0,
        killsBear: parseInt(parts[15], 10) || 0,
        killsPanther: parseInt(parts[16], 10) || 0,
        items,
        // Always include itemCharges if items exist (parallel array, needed to match indices)
        itemCharges: items.length > 0 ? itemCharges : undefined,
      });
    }
    // Schema v3 format: slot|name|race|class|team|result|dmg|selfHeal|allyHeal|gold|meat|elk|hawk|snake|wolf|bear|panther
    else if (parts.length >= 17 && schemaVersion && schemaVersion >= 3) {
      const result = parts[5] || ""; // WIN, LOSS, LEAVE, etc.

      players.push({
        slotIndex: parseInt(parts[0], 10) || 0,
        name: parts[1] || "",
        trollClass: parts[3] || undefined,
        team: parseInt(parts[4], 10) || 0,
        result: result.toUpperCase(), // WIN, LOSS, LEAVE, etc.
        damageTroll: parseInt(parts[6], 10) || 0,
        selfHealing: parseInt(parts[7], 10) || 0,
        allyHealing: parseInt(parts[8], 10) || 0,
        goldAcquired: parseInt(parts[9], 10) || 0,
        meatEaten: parseInt(parts[10], 10) || 0,
        killsElk: parseInt(parts[11], 10) || 0,
        killsHawk: parseInt(parts[12], 10) || 0,
        killsSnake: parseInt(parts[13], 10) || 0,
        killsWolf: parseInt(parts[14], 10) || 0,
        killsBear: parseInt(parts[15], 10) || 0,
        killsPanther: parseInt(parts[16], 10) || 0,
      });
    }
    // Schema v2 format: slot|name|race|team|result|dmg|selfHeal|allyHeal|gold|meat|elk|hawk|snake|wolf|bear|panther
    else if (parts.length >= 16) {
      const result = parts[4] || ""; // WIN, LOSS, LEAVE, etc. (v2 has result at index 4)

      players.push({
        slotIndex: parseInt(parts[0], 10) || 0,
        name: parts[1] || "",
        team: parseInt(parts[3], 10) || 0,
        result: result.toUpperCase(), // WIN, LOSS, LEAVE, etc.
        damageTroll: parseInt(parts[5], 10) || 0,
        selfHealing: parseInt(parts[6], 10) || 0,
        allyHealing: parseInt(parts[7], 10) || 0,
        goldAcquired: parseInt(parts[8], 10) || 0,
        meatEaten: parseInt(parts[9], 10) || 0,
        killsElk: parseInt(parts[10], 10) || 0,
        killsHawk: parseInt(parts[11], 10) || 0,
        killsSnake: parseInt(parts[12], 10) || 0,
        killsWolf: parseInt(parts[13], 10) || 0,
        killsBear: parseInt(parts[14], 10) || 0,
        killsPanther: parseInt(parts[15], 10) || 0,
      });
    }
  }

  // Parse building events (schema version 7+)
  if (schemaVersion && schemaVersion >= 7) {
    for (const line of lines) {
      if (!line.startsWith("build:")) continue;

      try {
        const parts = line.slice("build:".length).split("|");
        if (parts.length !== 4) continue;

        const team = parseInt(parts[0], 10);
        const timeSeconds = parseInt(parts[1], 10);
        const buildingId = parseInt(parts[2], 10);
        const status = parts[3]?.toUpperCase() || "";

        if (
          isNaN(team) ||
          isNaN(timeSeconds) ||
          isNaN(buildingId) ||
          !status ||
          !["START", "FINISH", "CANCEL", "DESTROY"].includes(status)
        ) {
          continue; // Skip invalid entries
        }

        buildingEvents.push({
          team,
          timeSeconds,
          buildingId,
          status: status as BuildingEvent["status"],
        });
      } catch {
        // Skip malformed building event data
        continue;
      }
    }
  }

  // Parse craft events (schema version 8+)
  if (schemaVersion && schemaVersion >= 8) {
    for (const line of lines) {
      if (!line.startsWith("craft:")) continue;

      try {
        const parts = line.slice("craft:".length).split("|");
        if (parts.length !== 4) continue;

        const team = parseInt(parts[0], 10);
        const timeSeconds = parseInt(parts[1], 10);
        const itemId = parseInt(parts[2], 10);
        const status = parts[3]?.toUpperCase() || "";

        if (
          isNaN(team) ||
          isNaN(timeSeconds) ||
          isNaN(itemId) ||
          !status ||
          !["SUCCESS", "FAIL"].includes(status)
        ) {
          continue; // Skip invalid entries
        }

        craftEvents.push({
          team,
          timeSeconds,
          itemId,
          status: status as CraftEvent["status"],
        });
      } catch {
        // Skip malformed craft event data
        continue;
      }
    }
  }

  return {
    players,
    buildingEvents: buildingEvents.length > 0 ? buildingEvents : undefined,
    craftEvents: craftEvents.length > 0 ? craftEvents : undefined,
  };
}
