# Map Data Structure Optimization Proposal

## Problem with Current Structure

The current `SimpleMapData` uses a **flat array** (`tiles: SimpleTile[]`) which makes transformations difficult:

### Current Issues:

1. **Coordinate Access**: Requires manual calculation `tiles[y * width + x]` everywhere
2. **Neighbor Access**: Hard to get adjacent tiles (need 4 separate index calculations)
3. **Transformations**: Difficult to rotate, flip, resample, or apply filters
4. **Code Duplication**: Same coordinate calculation repeated throughout codebase

### Example of Current Pain:

```typescript
// Getting a tile
const tile = map.tiles[y * map.width + x];

// Getting neighbors (tedious!)
const up = map.tiles[(y - 1) * map.width + x];
const down = map.tiles[(y + 1) * map.width + x];
const left = map.tiles[y * map.width + (x - 1)];
const right = map.tiles[y * map.width + (x + 1)];
```

## Proposed Solution: Optimized 2D Array Structure

### Option 1: `OptimizedMapData` (Recommended)

**2D array format**: `tiles[y][x]` for direct coordinate access

**Benefits:**

- ✅ Direct coordinate access: `map.tiles[y][x]`
- ✅ Easy neighbor access with helper functions
- ✅ Simple transformations (rotation, flipping, resampling)
- ✅ Easy to understand and migrate to
- ✅ Maintains object structure (backward compatible)

**Usage:**

```typescript
import { toOptimizedMapData, getTile, getNeighbors } from "./utils/mapOptimizationUtils";

// Convert existing map
const optimized = toOptimizedMapData(simpleMap);

// Direct access
const tile = optimized.tiles[y][x];

// Helper functions
const tile = getTile(optimized, x, y);
const neighbors = getNeighbors(optimized, x, y);
```

### Option 2: `SoAMapData` (Structure of Arrays)

**Separate 2D arrays for each property** - Maximum performance

**Benefits:**

- ✅ Extremely memory efficient
- ✅ Perfect for bulk property transformations
- ✅ Can use TypedArrays (Float32Array, Uint8Array, etc.)
- ✅ Best for resampling and filters

**Usage:**

```typescript
import { toSoAMapData, transformGroundHeights } from "./utils/mapOptimizationUtils";

const soaMap = toSoAMapData(map);

// Transform just ground heights efficiently
const transformed = transformGroundHeights(soaMap, (height, x, y) => {
  return height * 1.5; // Scale heights
});
```

## Migration Path

1. **Phase 1**: Add optimized types and utilities (✅ Done)
2. **Phase 2**: Update transformation code to use `OptimizedMapData`
3. **Phase 3**: Gradually migrate rendering code
4. **Phase 4**: Use `SoAMapData` for heavy transformations

## Transformation Examples

With the optimized structure, transformations become much simpler:

### Rotation

```typescript
import { rotate90Clockwise } from "./utils/mapTransformUtils";
const rotated = rotate90Clockwise(optimizedMap);
```

### Resampling

```typescript
import { resample } from "./utils/mapTransformUtils";
const resized = resample(optimizedMap, newWidth, newHeight);
```

### Smoothing Filter

```typescript
import { smoothHeights } from "./utils/mapTransformUtils";
const smoothed = smoothHeights(optimizedMap, radius);
```

### Extract Region

```typescript
import { extractRegion } from "./utils/mapTransformUtils";
const region = extractRegion(optimizedMap, x, y, width, height);
```

## Recommendation

**Start with `OptimizedMapData`** for your remapping/transformation work:

- Easier to work with than flat arrays
- Simple migration path
- Can convert back to flat array format when needed
- Use `SoAMapData` later if you need maximum performance

## Files Created

- `types/mapOptimized.ts` - New optimized type definitions
- `utils/mapOptimizationUtils.ts` - Conversion utilities and helpers
- `utils/mapTransformUtils.ts` - Example transformation functions

All utilities maintain backward compatibility - you can convert between formats as needed!
