/**
 * Utilities for mapping replay item IDs to item data
 *
 * Replay files store items as numeric IDs (integers). These need to be:
 * 1. Decoded to 4-character codes (e.g., 1768712192 -> "IM2o")
 * 2. Mapped to item slugs (e.g., "IM2o" -> "iron-axe")
 * 3. Looked up in the item database
 */

import { ITEMS_DATA } from "./index";
import { RAW_ITEM_CODE_TO_SLUG } from "./replayItemMapping";
import type { ItemData } from "@/types/items";

/**
 * Decode Warcraft III object ID integer into its 4-character string
 *
 * Warcraft 3 stores object IDs as 32-bit integers where each byte represents
 * a character in the 4-character code (little-endian).
 *
 * @param value - Numeric object ID from replay
 * @returns 4-character code (e.g., "IM2o") or null if invalid
 */
export function decodeObjectId(value: number): string | null {
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
 * Get item by replay ID (numeric ID from game replay)
 *
 * Converts a numeric replay ID to an item by:
 * 1. Decoding the numeric ID to a 4-character code
 * 2. Looking up the code in RAW_ITEM_CODE_TO_SLUG to get the item slug
 * 3. Looking up the item by slug using getItemById
 *
 * @param replayId - Numeric item ID from replay metadata
 * @returns ItemData if found, undefined otherwise
 */
export function getItemByReplayId(replayId: number): ItemData | undefined {
  if (!replayId || replayId === 0) {
    return undefined;
  }

  // Step 1: Decode numeric ID to 4-character code
  const itemCode = decodeObjectId(replayId);
  if (!itemCode) {
    // Debug: log if decode fails
    if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
      console.debug("[getItemByReplayId] Failed to decode replay ID:", replayId);
    }
    return undefined;
  }

  // Step 2: Map code to item slug
  const itemSlug = RAW_ITEM_CODE_TO_SLUG[itemCode];
  if (!itemSlug) {
    // Debug: log if mapping not found
    if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
      console.debug(
        "[getItemByReplayId] No mapping found for code:",
        itemCode,
        "from replay ID:",
        replayId,
        "Mapping size:",
        Object.keys(RAW_ITEM_CODE_TO_SLUG).length
      );
    }
    return undefined;
  }

  // Step 3: Get item by slug
  const item = ITEMS_DATA.find((item) => item.id === itemSlug);
  if (!item && typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    console.debug("[getItemByReplayId] Item not found for slug:", itemSlug, "from code:", itemCode);
  }
  return item;
}

/**
 * Get items by replay IDs (array of numeric IDs from game replay)
 * Filters out zeros and invalid IDs
 *
 * @param replayIds - Array of numeric item IDs from replay metadata
 * @returns Array of ItemData objects for valid items
 */
export function getItemsByReplayIds(replayIds: number[]): ItemData[] {
  if (!replayIds || replayIds.length === 0) {
    return [];
  }

  const items: ItemData[] = [];
  for (const replayId of replayIds) {
    if (replayId && replayId !== 0) {
      const item = getItemByReplayId(replayId);
      if (item) {
        items.push(item);
      }
    }
  }
  return items;
}
