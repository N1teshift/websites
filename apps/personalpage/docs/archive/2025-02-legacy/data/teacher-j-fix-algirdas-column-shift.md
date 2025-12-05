# Teacher J - Algirdas Column Shift Fix ✅

## Issue Found

The Algirdas class sheet in `dataJ.xlsx` had all Unit Test columns shifted by **1 column to the right** compared to other classes.

### Comparison:
**M. R. Juodasis** (first sheet):
- Column 45: Listening
- Column 46: Reading  
- Column 47: VOC 1
- ...
- Column 52: %

**Algirdas**:
- Column 46: Listening (shifted +1)
- Column 47: Reading (shifted +1)
- Column 48: VOC 1 (shifted +1)
- ...
- Column 53: % (shifted +1)

## Root Cause

The original `importDataJ.ts` script used **hardcoded column numbers** which only worked for the first sheet structure:

```typescript
// Hardcoded - only works for first sheet
{ name: 'Listening', field: 'lis1', col: 45 },
{ name: 'Reading', field: 'read', col: 46 },
// ...
```

This caused Algirdas data to be read from wrong columns, resulting in:
- Unit 1 TEST% showing Total data
- Actual percentage not visible
- All component scores shifted

## Solution

Created a **dynamic column detection system** that:

1. Scans row 1 for section markers ("UNIT 1", "Unit 1 TEST", "Diagnostic TEST 1", etc.)
2. Identifies column ranges for each test
3. Maps columns by reading row 2 headers within each range
4. Works correctly regardless of column shifts between sheets

### New Detection Logic:

```typescript
// Find unit test sections dynamically
const unitRanges: { unitNum: number; startCol: number; endCol: number }[] = [];

// Scan for "UNIT X" markers in row1
for (let col = 1; col <= 120; col++) {
    const section = getCellVal(row1.getCell(col)).toLowerCase();
    const unitMatch = section.match(/unit\s*(\d+)/i);
    if (unitMatch) {
        // Track range for this unit
    }
}

// Map columns within each range by header names
for (const range of unitRanges) {
    for (let col = range.startCol; col <= range.endCol; col++) {
        const header = getCellVal(row2.getCell(col)).toLowerCase();
        if (header.includes('listening')) colMap[`t${unitNum}_lis1`] = col;
        // ...
    }
}
```

## Verification

**Before (Algirdas - Ariana):**
- T1%: showing "13" (total)
- Actual %: not visible ❌

**After (Algirdas - Ariana):**
```json
{
  "lis1": 4,
  "voc1": 4,
  "voc2": 3,
  "gr1": 1,
  "gr2": 1,
  "total_score": 13,
  "total_percent": 39.39
}
```
✅ Correct!

## Files Changed

1. **`scripts/importDataJ.ts`** - Replaced with dynamic column detection version
2. **`scripts/importDataJ_old.ts`** - Backup of old hardcoded version
3. **`master_student_data_J_v5.json`** - Regenerated with correct data

## How to Use

```bash
# Import with automatic column detection
npx tsx scripts/importDataJ.ts

# Output: master_student_data_J_v5.json
# All sheets now import correctly regardless of column positions
```

## Result

✅ All 4 class sheets now import correctly  
✅ 64 columns detected per sheet  
✅ Unit test data properly aligned  
✅ Diagnostic test data unaffected (was already correct)  
✅ Ready to upload to dashboard

