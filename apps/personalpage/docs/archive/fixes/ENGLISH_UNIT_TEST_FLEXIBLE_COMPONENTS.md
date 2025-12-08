# English Unit Test Flexible Components Fix

## Issue

When selecting "English Unit 1 TEST" template in the Comments Generator, all students were showing as "Missing T1 Grammar" even though they had grammar data. The system was requiring all three grammar components (gr1, gr2, gr3) to be present, but unit tests typically only have gr1 and gr2.

## Root Cause

The `extractEnglishUnit1Data` function had rigid logic that required:

- **Listening**: Both lis1 AND lis2 to be non-null
- **Vocabulary**: Both voc1 AND voc2 to be non-null
- **Grammar**: ALL THREE gr1 AND gr2 AND gr3 to be non-null

But in reality:

- **Unit tests typically don't have gr3** (only gr1 and gr2)
- Some tests might be missing certain components
- Max points vary based on which components are present

This caused the system to mark students as having missing data even when they had partial data.

## Solution

### 1. Flexible Component Extraction

Updated `commentDataExtractors.ts` to dynamically calculate combined scores and max points based on **which components are actually present**:

**Before (Rigid):**

```typescript
// Required ALL components
const t1Gr = t1Gr1 !== null && t1Gr2 !== null && t1Gr3 !== null ? t1Gr1 + t1Gr2 + t1Gr3 : null;
const t1GrMax = 15; // Always 15
```

**After (Flexible):**

```typescript
// Grammar: combine available components (unit tests typically only have gr1 and gr2)
let t1Gr: number | null = null;
let t1GrMax = 0;

if (t1Gr1 !== null || t1Gr2 !== null || t1Gr3 !== null) {
  t1Gr = 0;
  if (t1Gr1 !== null) {
    t1Gr += t1Gr1;
    t1GrMax += 5;
  }
  if (t1Gr2 !== null) {
    t1Gr += t1Gr2;
    t1GrMax += 5;
  }
  if (t1Gr3 !== null) {
    t1Gr += t1Gr3;
    t1GrMax += 5;
  }
}
```

**Applied to:**

- ✅ Listening (lis1 + lis2)
- ✅ Vocabulary (voc1 + voc2)
- ✅ Grammar (gr1 + gr2 + gr3)

### 2. Safe Percentage Calculation

Updated `englishCommentGenerator.ts` to only calculate percentages for components that actually have data:

**Before (Unsafe):**

```typescript
const scores = [
  { section: "Listening", percent: (t1Lis! / t1LisMax!) * 100 },
  { section: "Reading", percent: (t1Read! / t1ReadMax!) * 100 },
  { section: "Vocabulary", percent: (t1Voc! / t1VocMax!) * 100 },
  { section: "Grammar", percent: (t1Gr! / t1GrMax!) * 100 },
];
```

**After (Safe):**

```typescript
const scores: Array<{ section: string; percent: number }> = [];

if (t1Lis !== null && t1LisMax > 0) {
  scores.push({ section: "Listening", percent: (t1Lis / t1LisMax) * 100 });
}
if (t1Read !== null && t1ReadMax > 0) {
  scores.push({ section: "Reading", percent: (t1Read / t1ReadMax) * 100 });
}
// ... etc
```

### 3. Null-Safe Variable Replacement

Updated variable replacement to show "—" for missing values instead of crashing:

```typescript
// Before (would crash on null)
comment = comment.replace(/{Grammar_Score}/g, t1Gr!.toString());

// After (safe)
comment = comment.replace(/{Grammar_Score}/g, t1Gr !== null ? t1Gr.toString() : "—");
```

## Benefits

1. **Flexible Data Structure**
   - Handles tests with different component combinations
   - Works with gr1+gr2 (typical) or gr1+gr2+gr3 (rare)
   - Adapts to missing components gracefully

2. **Accurate Max Points**
   - Max points calculated based on actual components present
   - Example: If only gr1 and gr2 exist, max is 10 (not 15)
   - Percentages reflect actual test structure

3. **No False "Missing Data" Warnings**
   - Students with gr1+gr2 are now recognized as having complete data
   - Only truly missing data triggers warnings
   - Better user experience

4. **Future-Proof**
   - Can handle any combination of components
   - Works for Unit 1, Unit 2, ... Unit 9
   - Adapts to different test formats automatically

## Files Modified

1. **`utils/comments/commentDataExtractors.ts`**
   - Made Listening, Vocabulary, and Grammar extraction flexible
   - Dynamic max point calculation
   - Handles partial data

2. **`utils/comments/englishCommentGenerator.ts`**
   - Safe percentage calculation
   - Null-safe variable replacement
   - Only includes components with data in weak area detection

## Testing

After fix:

- ✅ Select "English Unit 1 TEST" template
- ✅ Students with gr1+gr2 (no gr3) show as having complete data
- ✅ Comments generate successfully
- ✅ Percentages calculated correctly based on actual max points
- ✅ No crash on missing components

## Example Scenarios

### Scenario 1: Typical Unit Test (gr1 + gr2 only)

```json
{
  "gr1": 4,
  "gr2": 3,
  "gr3": null
}
```

**Result:**

- Grammar Score: 7
- Grammar Max: 10 (not 15)
- Grammar %: 70%
- ✅ Shows as complete data

### Scenario 2: Full Components

```json
{
  "gr1": 4,
  "gr2": 3,
  "gr3": 5
}
```

**Result:**

- Grammar Score: 12
- Grammar Max: 15
- Grammar %: 80%
- ✅ Shows as complete data

### Scenario 3: Missing Component

```json
{
  "gr1": 4,
  "gr2": null,
  "gr3": null
}
```

**Result:**

- Grammar Score: 4
- Grammar Max: 5
- Grammar %: 80%
- ✅ Shows as complete data (as long as at least one component exists)

## Related Documentation

- Comments Generator Refactor: `docs/refactoring/COMMENTS_GENERATOR_REFACTOR.md`
- Template Migration Fix: `docs/fixes/COMMENTS_GENERATOR_TEMPLATE_MIGRATION.md`
