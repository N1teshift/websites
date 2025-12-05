# ND5 Reflection Homework Merge Fix

**Date:** November 5, 2025  
**Issue:** Duplicate reflection homework columns showing as "ND4" and "REFLECTION HOMEWORK"

---

## Problem Statement

In the Progress Report Class view tab, there were two columns appearing for the same Oct 3, 2025 reflection homework:

1. **ND4 Column** (homework_reflection type)
   - assessment_id: `homework-reflection-nd4`
   - Scores displayed as: `0` or `1`
   - Label: "ND4"

2. **PA Column** (homework type)
   - assessment_id: `homework-pa`
   - assessment_title: "Reflection homework"
   - Scores displayed as: "Not completed" or "Completed"
   - Label: "Reflection homework"

Both columns represented the same reflection homework but were stored with different structures and displayed separately, causing confusion.

---

## Root Cause

1. **Data Structure Mismatch**: The reflection homework was recorded in two different ways:
   - As `ND4` with `homework_reflection` type
   - As `PA` with `homework` type but "Reflection homework" title

2. **Score Format Inconsistency**: 
   - ND4 used binary scores (0/1)
   - PA used text scores ("Not completed"/"Completed")

3. **Column Generation**: Both were being picked up as separate assessments by `getUniqueAssessments()` and displayed as distinct columns

---

## Solution Implemented

### 1. Data Migration Script

Created `scripts/mergeND4ReflectionHomework.ts` to:

- **Merge ND4 → ND5**: Changed all ND4 (homework_reflection) entries to ND5
- **Remove PA duplicates**: Removed PA "Reflection homework" entries (75 total)
- **Normalize scores**: Ensured all scores are in 0/1 binary format
- **Update metadata**: Changed assessment_id to `homework-reflection-nd5` and title to "Mathematical Skills Reflection - ND5"

**Results:**
- 75 ND4 entries changed to ND5
- 75 PA duplicate entries removed
- Generated new data file: `progress_report_data_2025-11-03_v6.json`

### 2. Code Updates

#### a. Column Builder (`columnBuilder.ts`)
Updated `shortenColumnTitle()` function to handle ND5:

```typescript
// Shorten reflection homework (e.g., "Mathematical Skills Reflection - ND5" → "ND5")
if (shortened.includes('ND5')) {
    return 'ND5';
}

// Legacy ND4 support (if any old data still exists)
if (shortened.includes('ND4')) {
    return 'ND4';
}
```

#### b. Type Definitions (`ProgressReportTypes.ts`)
Updated `AssessmentType` to properly document homework_reflection:

```typescript
export type AssessmentType = 
    | 'summative'        // KD, KD1 columns - unit summatives
    | 'test'             // SD columns - small topic tests
    | 'homework'         // ND1, ND2, ND6 - regular homework (binary: 0/1)
    | 'homework_graded'  // ND3 - graded homework (scored 0-10)
    | 'homework_reflection' // ND5 - reflection homework (binary: 0/1, was ND4)
    | ...
```

#### c. Migration Script (`migrateToV4_1.ts`)
Updated assessment template mapping:

```typescript
// HOMEWORK REFLECTION
if (type === 'homework_reflection') {
    if (column === 'ND5' && date === '2025-10-03') {
        return { id: 'homework-reflection-nd5', title: 'Mathematical Skills Reflection - ND5' };
    }
}
```

### 3. Documentation Updates

Updated `docs/fixes/ND_COLUMNS_FIX_COMPLETE.md` to reflect the merge and new ND5 column.

---

## Current State

### After Fix

| Column | Type | Date | Count | Display | Status |
|--------|------|------|-------|---------|--------|
| ND5 | homework_reflection | Oct 03, 2025 | 75 | "ND5" | ✅ Single merged column |

### Data Structure Example

```json
{
  "date": "2025-10-03",
  "column": "ND5",
  "type": "homework_reflection",
  "task_name": "Reflection homework",
  "score": "0",
  "comment": "",
  "added": "2025-10-04",
  "updated": "2025-10-04",
  "assessment_id": "homework-reflection-nd5",
  "assessment_title": "Mathematical Skills Reflection - ND5"
}
```

---

## Verification Steps

To verify the fix:

1. Load `progress_report_data_2025-11-03_v6.json` in the Progress Report page
2. Navigate to **Class View** tab
3. Check the homework columns - should see:
   - ND1, ND2, ND3, **ND5**, ND6
   - No duplicate ND4 or "REFLECTION HOMEWORK" columns
4. ND5 should display binary values (0 or 1)
5. Tooltip should show "Mathematical Skills Reflection - ND5"

---

## Files Modified

1. `scripts/mergeND4ReflectionHomework.ts` (NEW)
2. `src/features/modules/edtech/progressReport/utils/processing/columnBuilder.ts`
3. `src/features/modules/edtech/progressReport/types/ProgressReportTypes.ts`
4. `scripts/migrateToV4_1.ts`
5. `docs/fixes/ND_COLUMNS_FIX_COMPLETE.md`
6. `docs/fixes/ND5_REFLECTION_HOMEWORK_MERGE.md` (THIS FILE)

---

## Summary

✅ **Problem Solved**: Duplicate reflection homework columns merged into single ND5 column  
✅ **Data Migrated**: All 75 student records updated in v6 data file  
✅ **Code Updated**: Column builder and types properly handle ND5  
✅ **Documentation**: All docs updated to reflect the change  

The reflection homework now appears as a single, properly labeled **ND5** column with consistent binary (0/1) scoring.



