import type { SimpleMapData, SimpleTile } from "../types/map";
import type { OptimizedMapData } from "../types/mapOptimized";
import { fromOptimizedMapData } from "./mapOptimizationUtils";

const WATER_FLAG = 0x20000000; // from wc3maptranslator WATER.FLAG

/**
 * Corrects isWater flags in SimpleMapData based on flagsMask.
 * This is useful when loading maps where isWater was incorrectly set.
 */
export function correctIsWaterFromFlags(map: SimpleMapData): SimpleMapData {
  let hasIncompleteFlags = false;
  let correctedCount = 0;

  const correctedTiles = map.tiles.map((tile) => {
    // If flagsMask exists, check for WATER_FLAG
    if (typeof tile.flagsMask === "number") {
      // Check if flagsMask looks incomplete (WATER_FLAG is 0x20000000, so if max flag is much smaller, it's likely incomplete)
      if (tile.flagsMask > 0 && tile.flagsMask < 0x1000000) {
        hasIncompleteFlags = true;
      }

      const hasWaterFlag = (tile.flagsMask & WATER_FLAG) !== 0;
      // Also check if waterHeight exists (another indicator of water)
      const hasWaterHeight = typeof tile.waterHeight === "number";

      // Correct isWater if flagsMask indicates water or waterHeight exists
      if (hasWaterFlag || hasWaterHeight) {
        correctedCount++;
        return {
          ...tile,
          isWater: true,
          // Ensure waterHeight is set if we detected water but it wasn't set
          waterHeight: tile.waterHeight ?? (hasWaterFlag ? tile.groundHeight : undefined),
        };
      }
    }
    // If waterHeight exists but isWater is false, correct it
    if (typeof tile.waterHeight === "number" && !tile.isWater) {
      correctedCount++;
      return {
        ...tile,
        isWater: true,
      };
    }
    return tile;
  });

  // Warn if flags appear incomplete and no water was detected
  if (hasIncompleteFlags && correctedCount === 0) {
    console.warn(
      "Map flags appear incomplete (flagsMask values are too small to contain WATER_FLAG 0x20000000). " +
        "Water detection may fail. Consider using the raw map format with full flags array: " +
        "{ map: {width, height}, flags: [...], groundHeight: [...], waterHeight: [...] }"
    );
  }

  return {
    ...map,
    tiles: correctedTiles,
  };
}

export function normalizeJsonToSimpleMap(json: unknown): SimpleMapData {
  if (!json || typeof json !== "object") throw new Error("Invalid JSON");
  const obj = json as Record<string, unknown>;

  // PRIORITY 1: Check for raw format with flags array first (this preserves water flags correctly)
  // wc3maptranslator may return: { map: {width, height}, flags: [...], groundHeight: [...], waterHeight: [...] }
  // OR it might return flags at top level: { width, height, flags: [...], groundHeight: [...], waterHeight: [...] }

  // Check top-level format first: { width, height, flags: [...], ... }
  // Some versions of wc3maptranslator might return flags at top level
  if (
    typeof obj.width === "number" &&
    typeof obj.height === "number" &&
    Array.isArray(obj.flags) &&
    Array.isArray(obj.groundHeight) &&
    !obj.map // Make sure it's not the nested format
  ) {
    // Convert to nested format for processing
    const converted = {
      map: { width: obj.width, height: obj.height },
      flags: obj.flags,
      groundHeight: obj.groundHeight,
      waterHeight: obj.waterHeight,
      cliffData: obj.cliffData,
    };
    // Recursively process as nested format
    return normalizeJsonToSimpleMap(converted);
  }

  // Check nested format: { map: {width, height}, flags: [...], ... }
  // This is handled below in the raw format section

  // Check if this is already OptimizedMapData (corrected format with 2D tiles array)
  if (
    typeof obj.width === "number" &&
    typeof obj.height === "number" &&
    Array.isArray(obj.tiles) &&
    obj.tiles.length > 0 &&
    Array.isArray(obj.tiles[0])
  ) {
    // This is OptimizedMapData format - convert back to SimpleMapData
    // If it's already corrected, we can use it directly without transformation
    const optimized = obj as OptimizedMapData;
    return fromOptimizedMapData(optimized);
  }

  // support two shapes: optimized { meta: { w,h }, tiles: [...] } and raw-like { map:{width,height}, flags, groundHeight, waterHeight }
  if (obj.meta && typeof obj.meta === "object" && obj.meta !== null) {
    const meta = obj.meta as Record<string, unknown>;
    if (typeof meta.w === "number" && typeof meta.h === "number" && Array.isArray(obj.tiles)) {
      const width = meta.w;
      const height = meta.h;
      // optimized tiles format (varies). Expect [x,y,visualX,type,groundHeight,...]
      const tiles: SimpleTile[] = new Array(width * height);
      const rawTiles = obj.tiles as unknown[];
      for (let i = 0; i < rawTiles.length; i++) {
        const tileRaw = rawTiles[i] as unknown;
        if (!Array.isArray(tileRaw)) continue;
        const tileArray = tileRaw as unknown[];
        const x = typeof tileArray[0] === "number" ? tileArray[0] : 0;
        const y = typeof tileArray[1] === "number" ? tileArray[1] : 0;
        const typeCode = typeof tileArray[3] === "number" ? tileArray[3] : 0;
        const groundHeight = typeof tileArray[4] === "number" ? tileArray[4] : 0;
        const waterHeight = typeof tileArray[5] === "number" ? tileArray[5] : undefined;
        const idx = y * width + x;
        tiles[idx] = {
          isWater: typeCode === 1,
          groundHeight: Number(groundHeight) || 0,
          waterHeight: typeof waterHeight === "number" ? waterHeight : undefined,
        };
      }
      // fill any undefined with land
      for (let i = 0; i < tiles.length; i++) {
        if (!tiles[i]) tiles[i] = { isWater: false, groundHeight: 0 };
      }
      return { width, height, tiles };
    }
  }

  if (obj.map && typeof obj.map === "object" && obj.map !== null) {
    const mapObj = obj.map as Record<string, unknown>;
    if (
      typeof mapObj.width === "number" &&
      typeof mapObj.height === "number" &&
      Array.isArray(obj.flags) &&
      Array.isArray(obj.groundHeight)
    ) {
      const width = mapObj.width as number;
      const height = mapObj.height as number;
      const flags = obj.flags as number[];
      const ground = obj.groundHeight as number[];
      const water = (obj.waterHeight as number[]) || [];
      const cliffs = (obj.cliffData as number[]) || [];
      const tiles: SimpleTile[] = new Array(width * height);
      const RAMP = 0x00000002;
      const NO_WATER = 0x00000004;

      // Warcraft 3 terrain data has each row shifted right by its row index in the source arrays
      // To correct: read from source (x + y, y) and write to target (x, y)
      // This effectively shifts each row left by its row index
      // For out-of-bounds positions (bottom-right triangle), read from the original position without shift
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          // Source position accounts for the rightward shift
          let sourceX = x + y;
          let sourceY = y;

          // If sourceX is out of bounds, continue reading from the next row
          // This handles the bottom-right triangle where data wraps to next row
          if (sourceX >= width) {
            sourceX = x + y - width;
            sourceY = y + 1;
            // If we've gone past the last row, clamp to last row
            if (sourceY >= height) {
              sourceY = height - 1;
              sourceX = Math.min(width - 1, sourceX);
            }
          }

          // Source index in the flat array (row-major order)
          const sourceIdx = sourceY * width + sourceX;

          // Target index (where we want to place the corrected tile)
          const targetIdx = y * width + x;

          const groundHeightValue = Number(ground[sourceIdx]) || 0;
          const waterVal = water[sourceIdx];
          const waterHeightValue = waterVal != null ? Number(waterVal) : undefined;

          // Water detection: In WC3MapTranslator format, water is indicated by:
          // 1. WATER_FLAG bit in flags (0x20000000), OR
          // 2. waterHeight being different from groundHeight (indicates water depth)
          // The difference between waterHeight and groundHeight shows depth (shallow vs deep)
          const hasWaterFlag = (flags[sourceIdx] & WATER_FLAG) !== 0;
          const hasWaterHeight =
            waterHeightValue !== undefined && waterHeightValue !== groundHeightValue; // Any difference indicates water
          const isWater = hasWaterFlag || hasWaterHeight;

          let cliffLevel: number | undefined;
          if (cliffs[sourceIdx] != null) {
            const byte = cliffs[sourceIdx] as number;
            const level4bit = byte & 0x0f; // low 4 bits
            cliffLevel = level4bit & 0x8 ? level4bit - 0x10 : level4bit; // two's complement for 4-bit signed
          }
          tiles[targetIdx] = {
            isWater,
            groundHeight: groundHeightValue,
            // Set waterHeight if it differs from groundHeight (shows water depth)
            waterHeight: isWater && hasWaterHeight ? waterHeightValue : undefined,
            cliffLevel,
            flagsMask: flags[sourceIdx] >>> 0,
            isRamp: (flags[sourceIdx] & RAMP) !== 0,
            isNoWater: (flags[sourceIdx] & NO_WATER) !== 0,
          };
        }
      }
      return { width, height, tiles };
    }
  }

  throw new Error("Unsupported map JSON format");
}
