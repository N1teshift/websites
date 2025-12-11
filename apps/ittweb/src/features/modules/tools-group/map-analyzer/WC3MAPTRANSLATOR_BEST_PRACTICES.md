# WC3MapTranslator Best Practices Analysis

## Current Implementation Review

### ✅ What You're Doing Well

1. **Correct API Usage**: You're correctly using `TerrainTranslator.warToJson()` and accessing `result.json`
2. **Error Handling**: Good error handling with try-catch blocks
3. **Format Normalization**: Handling different JSON formats returned by the library
4. **Water Flag Detection**: Correctly detecting water flags using bitwise operations

### ⚠️ Areas for Improvement

## 1. Import Pattern

**Current (MapFileUploader.tsx):**

```typescript
const [{ Buffer }, wc3] = await Promise.all([import("buffer"), import("wc3maptranslator")]);
const { TerrainTranslator } = wc3 as unknown as {
  TerrainTranslator: { warToJson: (buf: Buffer) => { json: unknown } };
};
```

**Recommended:**

```typescript
// At top of file (static import)
import { TerrainTranslator } from "wc3maptranslator";
import { Buffer } from "buffer";

// Or if you need dynamic import for code splitting:
import type { TerrainTranslator } from "wc3maptranslator";
const { TerrainTranslator } = await import("wc3maptranslator");
```

**Why:**

- Static imports provide better TypeScript support and tree-shaking
- Avoids unsafe type casting
- Better IDE autocomplete and type checking
- The library exports proper TypeScript types

## 2. Type Safety

**Current:**

```typescript
const { TerrainTranslator } = wc3 as unknown as {
  TerrainTranslator: { warToJson: (buf: Buffer) => { json: unknown } };
};
```

**Recommended:**

```typescript
import { TerrainTranslator } from "wc3maptranslator";
import type { TerrainJson } from "wc3maptranslator"; // If available

// The library should export proper types
const result = TerrainTranslator.warToJson(buf);
// result.json should be properly typed
```

**Why:**

- Avoids unsafe type assertions
- Better compile-time error detection
- IDE support for autocomplete

## 3. Constants Import

**Current (mapUtils.ts):**

```typescript
const WATER_FLAG = 0x20000000; // from wc3maptranslator WATER.FLAG
```

**Recommended:**

```typescript
// Check if the library exports constants
import { TerrainTranslator, WATER } from "wc3maptranslator";

// Or check the library's source for exported constants
// If not exported, consider creating a constants file:
// constants/terrainFlags.ts
export const WATER_FLAG = 0x20000000;
export const RAMP_FLAG = 0x00000002;
export const NO_WATER_FLAG = 0x00000004;
```

**Why:**

- Single source of truth
- Easier to update if library changes
- Better maintainability

## 4. Return Value Handling

**Current:**

```typescript
const result = TerrainTranslator.warToJson(buf);
if (!result || !("json" in result)) throw new Error("Translator returned no JSON");
const rawJson = result.json;
```

**Recommended:**

```typescript
const result = TerrainTranslator.warToJson(buf);
if (!result?.json) {
  throw new Error("TerrainTranslator.warToJson returned invalid result");
}
const rawJson = result.json;
```

**Why:**

- More concise
- Better null/undefined handling
- Optional chaining is safer

## 5. Format Normalization

**Current:** Complex normalization logic handling multiple formats

**Recommendation:** The library should return a consistent format. If it doesn't, consider:

1. **Check library version**: Ensure you're using the latest version (v4.0.4)
2. **Document expected format**: Create a type guard function:

```typescript
type TerrainJsonFormat =
  | {
      map: { width: number; height: number };
      flags: number[];
      groundHeight: number[];
      waterHeight?: number[];
    }
  | {
      width: number;
      height: number;
      flags: number[];
      groundHeight: number[];
      waterHeight?: number[];
    }
  | { tiles: Array<{ isWater: boolean; groundHeight: number; waterHeight?: number }> };

function isTerrainJsonFormat(obj: unknown): obj is TerrainJsonFormat {
  // Type guard implementation
}
```

## 6. Error Messages

**Current:** Generic error messages

**Recommended:** More specific error messages:

```typescript
try {
  const result = TerrainTranslator.warToJson(buf);
  if (!result?.json) {
    throw new Error("TerrainTranslator.warToJson failed: result.json is missing");
  }
  // ... rest of processing
} catch (error) {
  if (error instanceof Error) {
    console.error(`Failed to parse terrain file ${file.name}:`, error.message);
    throw new Error(`Terrain parsing failed: ${error.message}`, { cause: error });
  }
  throw error;
}
```

## 7. Library Documentation Reference

According to [WC3MapTranslator documentation](https://github.com/ChiefOfGxBxL/WC3MapTranslator):

- **All translators have**: `.jsonToWar()` and `.warToJson()` functions
- **Return format**: `{ buffer }` for `jsonToWar`, `{ json }` for `warToJson`
- **Node requirement**: Node ≥ 14 (you're likely fine here)

## Recommended Refactored Code

### MapFileUploader.tsx

```typescript
import { TerrainTranslator } from "wc3maptranslator";
import { Buffer } from "buffer";
import { normalizeJsonToSimpleMap, correctIsWaterFromFlags } from "../../utils/mapUtils";

// ... rest of component

const handleChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
  const file = e.target.files?.[0];
  setFileName(file ? file.name : "");
  if (!file) return;

  const lower = file.name.toLowerCase();
  try {
    setIsProcessing(true);

    if (lower.endsWith(".json")) {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const id = `${file.name.replace(/\.[^/.]+$/, "")}_${Date.now().toString(36)}`;

      try {
        localStorage.setItem(`itt_map_data_${id}`, JSON.stringify(parsed));
      } catch {
        // Ignore localStorage errors
      }

      persistList([{ id, name: file.name }, ...saved.filter((s) => s.id !== id)].slice(0, 50));
      onJsonLoaded?.(parsed);
      setIsMinimized(true);
    } else if (lower.endsWith(".w3e")) {
      const arrayBuf = await file.arrayBuffer();
      const buf = Buffer.from(arrayBuf);

      // Use static import - better type safety
      const result = TerrainTranslator.warToJson(buf);

      if (!result?.json) {
        throw new Error("TerrainTranslator.warToJson returned invalid result");
      }

      const rawJson = result.json;

      // Normalize the JSON to ensure water flags are correctly extracted
      let normalizedJson: unknown;
      try {
        const normalized = normalizeJsonToSimpleMap(rawJson);
        const corrected = correctIsWaterFromFlags(normalized);
        normalizedJson = corrected;

        const waterTiles = corrected.tiles.filter((t) => t.isWater === true);
        console.log(
          `[Map Upload] After normalization: ${waterTiles.length} water tiles detected out of ${corrected.tiles.length} total`
        );
      } catch (normalizeError) {
        console.warn("[Map Upload] Failed to normalize JSON, using raw format:", normalizeError);
        normalizedJson = rawJson;
      }

      const id = `${file.name.replace(/\.[^/.]+$/, "")}_${Date.now().toString(36)}`;
      try {
        localStorage.setItem(`itt_map_data_${id}`, JSON.stringify(normalizedJson));
      } catch {
        // Ignore localStorage errors
      }

      persistList([{ id, name: file.name }, ...saved.filter((s) => s.id !== id)].slice(0, 50));
      onJsonLoaded?.(normalizedJson);
      setIsMinimized(true);
    } else {
      console.warn("Unsupported file type:", file.name);
    }
  } catch (err) {
    console.error("Failed to process file:", err);
    // Consider showing user-friendly error message
  } finally {
    setIsProcessing(false);
  }
};
```

### mapUtils.ts - Constants

```typescript
// Consider creating a separate constants file or importing from library if available
export const TERRAIN_FLAGS = {
  WATER: 0x20000000,
  RAMP: 0x00000002,
  NO_WATER: 0x00000004,
} as const;

// Then use:
const WATER_FLAG = TERRAIN_FLAGS.WATER;
const RAMP = TERRAIN_FLAGS.RAMP;
const NO_WATER = TERRAIN_FLAGS.NO_WATER;
```

## Summary of Recommendations

1. ✅ **Use static imports** instead of dynamic imports with type casting
2. ✅ **Improve type safety** - avoid `as unknown as` assertions
3. ✅ **Extract constants** to a shared constants file
4. ✅ **Better error handling** with specific error messages
5. ✅ **Simplify return value checks** using optional chaining
6. ✅ **Consider type guards** for format validation
7. ✅ **Check library exports** - see if constants/types are exported

## Next Steps

1. Check if `wc3maptranslator` exports TypeScript types and constants
2. Refactor imports to use static imports
3. Create a constants file for terrain flags
4. Add type guards for format validation
5. Improve error messages for better debugging

## References

- [WC3MapTranslator GitHub](https://github.com/ChiefOfGxBxL/WC3MapTranslator)
- [WC3MapTranslator npm](https://www.npmjs.com/package/wc3maptranslator)
- Library version in use: `^4.0.4` (from package.json)
