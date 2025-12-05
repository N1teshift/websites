# 🔧 Preview API Fix - Column Selection Now Works!

## Problem
When uploading Excel files, ND6, ND6 K, ND6 T, and other dynamic columns were **not showing up** in the column selection UI.

## Root Cause
The `preview-student-data.ts` API was using the old hardcoded `SUMMATIVE_SHEET_COLUMNS` mapping and **skipping any column not in that list**:

```typescript
// OLD CODE (Lines 113-119)
const columnConfig = SUMMATIVE_SHEET_COLUMNS[columnName];

// Skip unmapped columns
if (!columnConfig) {
    Logger.warn(`Column not in mapping, skipping`, { columnName });
    continue;  // ❌ This was hiding ND6, EXT13, SD9, etc.
}
```

Since we removed the hardcoded definitions (EXT1-12, SD1-8, etc.), **new columns were being skipped**!

## Solution
Updated the preview API to use **dynamic column detection first**, then fallback to static mappings:

```typescript
// NEW CODE
// Try dynamic detection first (handles EXT, ND, SD, LNT, etc.)
const dynamicInfo = detectColumnType(columnName);

// Fallback to static mapping for special columns
const columnConfig = dynamicInfo?.mapping || SUMMATIVE_SHEET_COLUMNS[columnName];

// Now recognizes: ND6, ND6 K, ND6 T, EXT13, SD9, TVARK, TAIS, etc.
```

## What's Fixed
Now when you upload Excel, you'll see:
- ✅ **ND6** (main homework column)
- ✅ **ND6 K** (comment column)
- ✅ **ND6 T** (score column)
- ✅ **TVARK** (notebook tracking)
- ✅ **TAIS** (corrections tracking)
- ✅ **EXT13, EXT14, EXT15...** (any EXT number)
- ✅ **SD9, SD10, SD11...** (any SD number)
- ✅ **LNT9, LNT10...** (any LNT number)

## Files Updated
- ✅ `src/pages/api/preview-student-data.ts`
  - Added `detectColumnType` import
  - Uses dynamic detection before static mapping
  - Logs dynamic column detection for debugging

## Testing
1. Upload your Excel with ND6, ND6 K, ND6 T columns
2. You should now see all three in the column selection preview
3. Can select/deselect them individually
4. Import will process them correctly with V5 processor

---

**Status:** ✅ Fixed  
**Date:** November 9, 2025

