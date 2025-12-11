import type { SimpleMapData, SimpleTile } from "../types/map";
import type { OptimizedMapData, SoAMapData } from "../types/mapOptimized";

/**
 * Convert flat array format to 2D array format for easier coordinate access.
 * This is the recommended format for most transformations.
 * @param map - The SimpleMapData to convert
 * @param corrected - If true, marks this as already corrected (row-shifting applied)
 */
export function toOptimizedMapData(
  map: SimpleMapData,
  corrected: boolean = false
): OptimizedMapData {
  const tiles2D: SimpleTile[][] = [];

  for (let y = 0; y < map.height; y++) {
    const row: SimpleTile[] = [];
    for (let x = 0; x < map.width; x++) {
      const idx = y * map.width + x;
      row.push(map.tiles[idx]);
    }
    tiles2D.push(row);
  }

  return {
    width: map.width,
    height: map.height,
    tiles: tiles2D,
    version: corrected ? "1.0" : undefined,
    corrected: corrected || undefined,
  };
}

/**
 * Convert 2D array format back to flat array format (for backward compatibility).
 */
export function fromOptimizedMapData(map: OptimizedMapData): SimpleMapData {
  const tiles: SimpleTile[] = [];

  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      tiles.push(map.tiles[y][x]);
    }
  }

  return {
    width: map.width,
    height: map.height,
    tiles,
  };
}

/**
 * Convert to Structure-of-Arrays format for maximum transformation performance.
 * Useful for bulk operations, resampling, and filters.
 */
export function toSoAMapData(map: SimpleMapData | OptimizedMapData): SoAMapData {
  const isWater: boolean[][] = [];
  const groundHeight: number[][] = [];
  const waterHeight: (number | undefined)[][] = [];
  const cliffLevel: (number | undefined)[][] = [];
  const flagsMask: (number | undefined)[][] = [];
  const isRamp: (boolean | undefined)[][] = [];
  const isNoWater: (boolean | undefined)[][] = [];

  const width = map.width;
  const height = map.height;

  // Handle both flat and 2D array formats
  const getTile = (x: number, y: number): SimpleTile => {
    if ("tiles" in map && Array.isArray(map.tiles[0])) {
      // OptimizedMapData format
      return (map as OptimizedMapData).tiles[y][x];
    } else {
      // SimpleMapData format
      const idx = y * width + x;
      return (map as SimpleMapData).tiles[idx];
    }
  };

  for (let y = 0; y < height; y++) {
    isWater.push([]);
    groundHeight.push([]);
    waterHeight.push([]);
    cliffLevel.push([]);
    flagsMask.push([]);
    isRamp.push([]);
    isNoWater.push([]);

    for (let x = 0; x < width; x++) {
      const tile = getTile(x, y);
      isWater[y].push(tile.isWater);
      groundHeight[y].push(tile.groundHeight);
      waterHeight[y].push(tile.waterHeight);
      cliffLevel[y].push(tile.cliffLevel);
      flagsMask[y].push(tile.flagsMask);
      isRamp[y].push(tile.isRamp);
      isNoWater[y].push(tile.isNoWater);
    }
  }

  return {
    width,
    height,
    isWater,
    groundHeight,
    waterHeight,
    cliffLevel,
    flagsMask,
    isRamp,
    isNoWater,
  };
}

/**
 * Convert Structure-of-Arrays format back to OptimizedMapData.
 */
export function fromSoAMapData(map: SoAMapData): OptimizedMapData {
  const tiles: SimpleTile[][] = [];

  for (let y = 0; y < map.height; y++) {
    const row: SimpleTile[] = [];
    for (let x = 0; x < map.width; x++) {
      row.push({
        isWater: map.isWater[y][x],
        groundHeight: map.groundHeight[y][x],
        waterHeight: map.waterHeight[y][x],
        cliffLevel: map.cliffLevel[y][x],
        flagsMask: map.flagsMask[y][x],
        isRamp: map.isRamp[y][x],
        isNoWater: map.isNoWater[y][x],
      });
    }
    tiles.push(row);
  }

  return {
    width: map.width,
    height: map.height,
    tiles,
  };
}

/**
 * Helper to get a tile at coordinates (with bounds checking).
 */
export function getTile(map: OptimizedMapData, x: number, y: number): SimpleTile | null {
  if (x < 0 || y < 0 || x >= map.width || y >= map.height) {
    return null;
  }
  return map.tiles[y][x];
}

/**
 * Helper to get neighbor tiles (up, down, left, right).
 * Returns null for out-of-bounds neighbors.
 */
export function getNeighbors(
  map: OptimizedMapData,
  x: number,
  y: number
): {
  up: SimpleTile | null;
  down: SimpleTile | null;
  left: SimpleTile | null;
  right: SimpleTile | null;
} {
  return {
    up: getTile(map, x, y - 1),
    down: getTile(map, x, y + 1),
    left: getTile(map, x - 1, y),
    right: getTile(map, x + 1, y),
  };
}

/**
 * Helper to get all 8 neighbors (including diagonals).
 */
export function getAllNeighbors(
  map: OptimizedMapData,
  x: number,
  y: number
): {
  up: SimpleTile | null;
  down: SimpleTile | null;
  left: SimpleTile | null;
  right: SimpleTile | null;
  upLeft: SimpleTile | null;
  upRight: SimpleTile | null;
  downLeft: SimpleTile | null;
  downRight: SimpleTile | null;
} {
  return {
    up: getTile(map, x, y - 1),
    down: getTile(map, x, y + 1),
    left: getTile(map, x - 1, y),
    right: getTile(map, x + 1, y),
    upLeft: getTile(map, x - 1, y - 1),
    upRight: getTile(map, x + 1, y - 1),
    downLeft: getTile(map, x - 1, y + 1),
    downRight: getTile(map, x + 1, y + 1),
  };
}

/**
 * Iterate all tiles in the map. Useful for filtering operations.
 */
export function* iterateTiles(map: OptimizedMapData): Generator<SimpleTile, void, unknown> {
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      yield map.tiles[y][x];
    }
  }
}

/**
 * Get all tiles as a flat array. Useful for backward compatibility with filter operations.
 */
export function getAllTiles(map: OptimizedMapData): SimpleTile[] {
  const tiles: SimpleTile[] = [];
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      tiles.push(map.tiles[y][x]);
    }
  }
  return tiles;
}
