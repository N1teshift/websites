/**
 * Optimized map data structure for easier transformations and manipulations.
 * Uses 2D arrays for direct coordinate access: map.tiles[y][x]
 */

export type SimpleTile = {
  isWater: boolean;
  groundHeight: number;
  waterHeight?: number;
  cliffLevel?: number;
  flagsMask?: number;
  isRamp?: boolean;
  isNoWater?: boolean;
};

/**
 * Optimized map data with 2D tile array for easier coordinate access.
 * Access tiles directly: map.tiles[y][x]
 */
export type OptimizedMapData = {
  width: number;
  height: number;
  tiles: SimpleTile[][]; // 2D array: tiles[y][x]
  /**
   * Format version and metadata.
   * - version: "1.0" = corrected/remapped data (row-shifting applied)
   * - version: undefined = legacy format (needs transformation)
   */
  version?: string;
  /**
   * Indicates this map has been corrected/remapped from raw .w3e data.
   * When true, the row-shifting transformation has already been applied.
   */
  corrected?: boolean;
};

/**
 * Structure-of-Arrays format for maximum performance and transformation ease.
 * Each property is a 2D array, allowing efficient bulk operations.
 * Use this format when you need to:
 * - Apply transformations to specific properties
 * - Resample/resize the map
 * - Apply filters or kernels
 * - Use typed arrays for memory efficiency
 */
export type SoAMapData = {
  width: number;
  height: number;
  // Structure of Arrays - each property is a 2D array
  isWater: boolean[][];
  groundHeight: number[][];
  waterHeight: (number | undefined)[][];
  cliffLevel: (number | undefined)[][];
  flagsMask: (number | undefined)[][];
  isRamp: (boolean | undefined)[][];
  isNoWater: (boolean | undefined)[][];
};
