import type { OptimizedMapData, SoAMapData } from "../types/mapOptimized";
import { getNeighbors } from "./mapOptimizationUtils";

/**
 * Example transformation utilities that are much easier with the optimized format.
 * These demonstrate the benefits of the 2D array structure.
 */

/**
 * Rotate map 90 degrees clockwise.
 * With 2D arrays, this is straightforward coordinate remapping.
 */
export function rotate90Clockwise(map: OptimizedMapData): OptimizedMapData {
  const newWidth = map.height;
  const newHeight = map.width;
  const newTiles: typeof map.tiles = [];

  for (let y = 0; y < newHeight; y++) {
    const row: (typeof map.tiles)[0] = [];
    for (let x = 0; x < newWidth; x++) {
      // Rotate: new[x][y] = old[height-1-y][x]
      const oldX = y;
      const oldY = map.height - 1 - x;
      row.push(map.tiles[oldY][oldX]);
    }
    newTiles.push(row);
  }

  return {
    width: newWidth,
    height: newHeight,
    tiles: newTiles,
  };
}

/**
 * Flip map horizontally.
 */
export function flipHorizontal(map: OptimizedMapData): OptimizedMapData {
  const newTiles = map.tiles.map((row) => [...row].reverse());
  return {
    width: map.width,
    height: map.height,
    tiles: newTiles,
  };
}

/**
 * Flip map vertically.
 */
export function flipVertical(map: OptimizedMapData): OptimizedMapData {
  const newTiles = [...map.tiles].reverse();
  return {
    width: map.width,
    height: map.height,
    tiles: newTiles,
  };
}

/**
 * Resample/resize map using nearest-neighbor interpolation.
 * Much easier with 2D coordinate access.
 */
export function resample(
  map: OptimizedMapData,
  newWidth: number,
  newHeight: number
): OptimizedMapData {
  const newTiles: typeof map.tiles = [];
  const scaleX = map.width / newWidth;
  const scaleY = map.height / newHeight;

  for (let y = 0; y < newHeight; y++) {
    const row: (typeof map.tiles)[0] = [];
    for (let x = 0; x < newWidth; x++) {
      const srcX = Math.floor(x * scaleX);
      const srcY = Math.floor(y * scaleY);
      // Clamp to bounds
      const clampedX = Math.min(srcX, map.width - 1);
      const clampedY = Math.min(srcY, map.height - 1);
      row.push(map.tiles[clampedY][clampedX]);
    }
    newTiles.push(row);
  }

  return {
    width: newWidth,
    height: newHeight,
    tiles: newTiles,
  };
}

/**
 * Apply a smoothing filter to ground heights using neighbor averaging.
 * Demonstrates how easy neighbor access is with 2D arrays.
 */
export function smoothHeights(map: OptimizedMapData, _radius: number = 1): OptimizedMapData {
  const newTiles: typeof map.tiles = [];

  for (let y = 0; y < map.height; y++) {
    const row: (typeof map.tiles)[0] = [];
    for (let x = 0; x < map.width; x++) {
      const neighbors = getNeighbors(map, x, y);
      const heights: number[] = [map.tiles[y][x].groundHeight];

      if (neighbors.up) heights.push(neighbors.up.groundHeight);
      if (neighbors.down) heights.push(neighbors.down.groundHeight);
      if (neighbors.left) heights.push(neighbors.left.groundHeight);
      if (neighbors.right) heights.push(neighbors.right.groundHeight);

      const avgHeight = heights.reduce((a, b) => a + b, 0) / heights.length;

      row.push({
        ...map.tiles[y][x],
        groundHeight: avgHeight,
      });
    }
    newTiles.push(row);
  }

  return {
    width: map.width,
    height: map.height,
    tiles: newTiles,
  };
}

/**
 * Extract a sub-region of the map.
 * Simple coordinate slicing with 2D arrays.
 */
export function extractRegion(
  map: OptimizedMapData,
  x: number,
  y: number,
  width: number,
  height: number
): OptimizedMapData {
  const newTiles: typeof map.tiles = [];

  for (let dy = 0; dy < height; dy++) {
    const srcY = y + dy;
    if (srcY < 0 || srcY >= map.height) continue;

    const row: (typeof map.tiles)[0] = [];
    for (let dx = 0; dx < width; dx++) {
      const srcX = x + dx;
      if (srcX < 0 || srcX >= map.width) continue;
      row.push(map.tiles[srcY][srcX]);
    }
    if (row.length > 0) {
      newTiles.push(row);
    }
  }

  return {
    width: width,
    height: height,
    tiles: newTiles,
  };
}

/**
 * Transform coordinates using a custom mapping function.
 * Useful for coordinate system conversions or custom projections.
 */
export function transformCoordinates(
  map: OptimizedMapData,
  transformFn: (x: number, y: number) => { x: number; y: number }
): OptimizedMapData {
  // This is a simplified example - you'd need to handle the mapping more carefully
  // depending on your specific transformation needs
  const newTiles: typeof map.tiles = [];

  for (let y = 0; y < map.height; y++) {
    const row: (typeof map.tiles)[0] = [];
    for (let x = 0; x < map.width; x++) {
      const transformed = transformFn(x, y);
      const srcX = Math.max(0, Math.min(transformed.x, map.width - 1));
      const srcY = Math.max(0, Math.min(transformed.y, map.height - 1));
      row.push(map.tiles[srcY][srcX]);
    }
    newTiles.push(row);
  }

  return {
    width: map.width,
    height: map.height,
    tiles: newTiles,
  };
}

/**
 * Bulk transform a specific property using SoA format.
 * This is extremely efficient for property-specific operations.
 */
export function transformGroundHeights(
  map: SoAMapData,
  transformFn: (height: number, x: number, y: number) => number
): SoAMapData {
  const newGroundHeight: number[][] = [];

  for (let y = 0; y < map.height; y++) {
    const row: number[] = [];
    for (let x = 0; x < map.width; x++) {
      row.push(transformFn(map.groundHeight[y][x], x, y));
    }
    newGroundHeight.push(row);
  }

  return {
    ...map,
    groundHeight: newGroundHeight,
  };
}
