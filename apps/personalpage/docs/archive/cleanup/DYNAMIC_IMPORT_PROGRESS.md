# Dynamic Excel Import - Implementation Progress

## 📋 Overview

Implementing dynamic column detection for Excel imports to replace hardcoded column mappings.

## ✅ Completed Tasks

### 1. **Assessment ID Consistency Check**

- ✅ Checked all assessment IDs in `progress_report_data_2025-11-09.json`
- ✅ Found inconsistencies:
  - EXT9-12: using `classwork-ext9` instead of `ext9`
  - SD6-8: using `test-sd6` instead of `sd6`
- ✅ Created migration script to standardize IDs

### 2. **Assessment Type Definitions Updated**

- ✅ Added `tracking` type to AssessmentType enum
- ✅ Added `context`, `on_time`, `completed_on_time` fields to Assessment interface
- File: `src/features/modules/edtech/progressReport/types/ProgressReportTypes.ts`

### 3. **Excel Reader Enhanced**

- ✅ Added `columnContext` Map to SheetData interface
- ✅ Implemented context row reading (Row 21/22 - dynamically detected after last student)
- ✅ Context is now read and available for each column
- File: `src/features/modules/edtech/progressReport/student-data/utils/excelReader.ts`

### 4. **Dynamic Column Detector Created**

- ✅ Created `dynamicColumnMapper.ts` with pattern detection
- ✅ Supports patterns:
  - **EXT\d+**: Classwork (EXT1, EXT2, ..., EXT99)
  - **LNT\d+**: Board participation (LNT1, LNT2, ..., LNT99)
  - **ND\d+**: Homework base column
  - **ND\d+ K**: Homework comment
  - **ND\d+ T**: Homework score (for ND6+)
  - **SD\d+ (P|MYP|C|C1|C2)**: Test scores
  - **KD\d+ (P|MYP|C)**: Cambridge summatives
  - **D\d+**: Diagnostic assessments
  - **TVARK**: Notebook organization tracking
  - **TAIS**: Corrections practice tracking
- File: `src/features/modules/edtech/progressReport/student-data/utils/dynamicColumnMapper.ts`

### 5. **StudentDataTypes Updated**

- ✅ Added `homework_score` and `tracking` to ColumnMapping types
- ✅ Added `tracking_attribute` field for TVARK/TAIS
- File: `src/features/modules/edtech/progressReport/student-data/types/StudentDataTypes.ts`

### 6. **Migration Script Created**

- ✅ Created `scripts/migrateAssessmentData.ts`
- ✅ Fixes assessment IDs (removes `classwork-` and `test-` prefixes)
- ✅ Migrates ND structure (score → on_time for binary 0/1 values)
- ✅ Initial run results:
  - 434 assessment IDs fixed
  - 380 ND assessments migrated (only 0/1 values)

---

## ⚠️ CRITICAL QUESTION - NEEDS USER CLARIFICATION

### ND4 Data Issue

**Problem:** ND4 is typed as `homework_reflection` but contains **ACTUAL SCORES** (10, 9, 8, 7, etc.) instead of binary 0/1 values.

**Examples from data:**

- Adomas Bagdonavičius: ND4 score = "10"
- Adomas Kančauskas: ND4 score = "9"
- Agota Akromė: ND4 score = "8"
- Benas Matijošaitis: ND4 score = "7"
- Many students have scores like "?", "n" (not submitted)

**Current Migration Behavior:**

- Script skips ND4 entries with scores other than 0/1
- Only migrates ND1, ND2, ND5 with binary values
- ND4 with scores remains unchanged

**Questions:**

1. Was ND4 actually a GRADED reflection homework (keep scores)?
2. Should ND4 be changed to `homework_graded` type?
3. Or should we ignore ND4 migration entirely?

---

## 🚧 Pending Tasks

### 1. **Migrate Existing Data** (ID: 2)

**Status:** Waiting for user clarification on ND4

**Action needed:**

- Run migration on `progress_report_data_2025-11-09.json`
- Replace current JSON with migrated version

### 2. **Implement ND Complex Structure Handler** (ID: 6)

**Status:** Ready to implement

**What's needed:**
Update `DataProcessorV4` to handle:

```typescript
// ND6 example:
ND6      → on_time (0/1)
ND6 K    → comment (string)
ND6 T    → score (actual grade)

// Result assessment:
{
    column: "ND6",
    on_time: 1,
    completed_on_time: 1,
    score: "8.5",
    comment: "Good work",
    context: "Equations homework from chapter 3"
}
```

### 3. **Add TVARK/TAIS Handlers** (ID: 7)

**Status:** Ready to implement

**What's needed:**

- Update `profile.learning_attributes` when TVARK/TAIS processed
- Create assessment record for tracking history
- Map values:
  - TVARK 1 → notebook_organization: "proficient"
  - TVARK 0 → notebook_organization: "needs_support"
  - TAIS 1 → reflective_practice: "proficient"
  - TAIS 0 → reflective_practice: "needs_support"

### 4. **Hide TVARK/TAIS from Class View** (ID: 9)

**Status:** Need to identify where to filter

**What's needed:**

- Find class view table column builder
- Filter out columns with type === 'tracking'
- Keep visible in student view assessment records

### 5. **Update columnMapping.ts** (ID: 10)

**Status:** Can be simplified

**What's needed:**

- Remove hardcoded EXT1-12, LNT1-8, SD1-8 definitions
- Keep only special cases (SPEC, SOC, KONS, etc.)
- Let dynamic detector handle standard patterns

---

## 📂 Files Modified

### Core Types

- ✅ `src/features/modules/edtech/progressReport/types/ProgressReportTypes.ts`
- ✅ `src/features/modules/edtech/progressReport/student-data/types/StudentDataTypes.ts`

### Excel Processing

- ✅ `src/features/modules/edtech/progressReport/student-data/utils/excelReader.ts`
- ✅ `src/features/modules/edtech/progressReport/student-data/utils/dynamicColumnMapper.ts` (NEW)

### Migration

- ✅ `scripts/migrateAssessmentData.ts` (NEW)

### To Update

- ⏳ `src/features/modules/edtech/progressReport/student-data/processors/dataProcessorV4.ts`
- ⏳ `src/features/modules/edtech/progressReport/student-data/config/columnMapping.ts`
- ⏳ Class view table column filtering

---

## 🎯 Next Steps

1. **URGENT:** Get user clarification on ND4 data
2. Run final migration script on database
3. Implement ND complex structure handler in DataProcessorV4
4. Implement TVARK/TAIS profile updating logic
5. Filter tracking columns from class view table
6. Clean up columnMapping.ts
7. Test with new Excel file containing ND6, TVARK, TAIS

---

## 📊 Current Assessment ID Standard

After migration, all IDs will follow this pattern:

| Type          | Pattern  | Example         |
| ------------- | -------- | --------------- |
| Homework      | `nd\d+`  | `nd1`, `nd6`    |
| Classwork     | `ext\d+` | `ext1`, `ext12` |
| Board Solving | `lnt\d+` | `lnt1`, `lnt8`  |
| Tests         | `sd\d+`  | `sd1`, `sd8`    |
| Summatives    | `kd\d+`  | `kd1`, `kd2`    |
| Diagnostic    | `d\d+`   | `d1`, `d2`      |
| Generated     | `p1`     | `p1`            |

---

## 💾 Migration Command

```bash
# When ready, run:
npx tsx scripts/migrateAssessmentData.ts progress_report_data_2025-11-09.json progress_report_data_2025-11-09_migrated.json

# Backup original:
cp progress_report_data_2025-11-09.json progress_report_data_2025-11-09_backup.json

# Replace with migrated:
cp progress_report_data_2025-11-09_migrated.json progress_report_data_2025-11-09.json
```

---

**Last Updated:** 2025-11-09  
**Status:** 50% Complete - Waiting for ND4 clarification
