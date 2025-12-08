# Scripts Assessment & Cleanup Recommendations

**Date:** November 10, 2025  
**Total Scripts:** 71 files  
**Analysis Status:** Complete

---

## 📊 Overview

Your scripts folder contains utilities for managing student assessment data across multiple schema versions (v2 → v5). Many scripts were created for one-time migrations and fixes during data structure evolution.

---

## 🗂️ Script Categories

### 1. **Migration Scripts** (Schema Version Changes)

These handle data structure migrations between versions:

| Script                     | Purpose                              | Status     | Recommendation                        |
| -------------------------- | ------------------------------------ | ---------- | ------------------------------------- |
| `migrateToV3.ts`           | v2 → v3 migration                    | ✅ Archive | Keep for reference, unlikely to reuse |
| `migrateToV4.ts`           | v3 → v4 migration (master file)      | ✅ Archive | Keep for reference                    |
| `migrateV3toV4.ts`         | v3 → v4 migration (individual files) | ✅ Archive | Keep for reference                    |
| `migrateToV4_1.ts`         | v4.0 → v4.1 migration                | ✅ Archive | Keep for reference                    |
| `migrateAssessmentData.ts` | Assessment data migration            | ⚠️ Review  | Check if still needed                 |

**Recommendation:** Archive all completed migration scripts to `scripts/archive/migrations/` folder. They serve as documentation but shouldn't be reused.

---

### 2. **Data Cleanup Scripts**

Remove duplicates, old data, and inconsistencies:

| Script                            | Purpose                        | Status      | Recommendation         |
| --------------------------------- | ------------------------------ | ----------- | ---------------------- |
| `cleanupMasterJson.ts`            | Convert mixed v3/v4 to pure v4 | ⚠️ Keep     | May still be useful    |
| `cleanupDataV5.ts`                | V5 cleanup rules               | ✅ **Keep** | Active utility         |
| `validateAndFixDatabase.ts`       | V5 validation & auto-fix       | ✅ **Keep** | Critical utility       |
| `cleanupDuplicateEXT1.ts`         | Remove duplicate EXT1 entries  | ❌ Delete   | One-time fix completed |
| `removeDuplicateNDAssessments.ts` | Remove duplicate ND entries    | ❌ Delete   | One-time fix completed |
| `removeDuplicateND1Oct10.ts`      | Remove specific duplicate      | ❌ Delete   | One-time fix completed |

**Recommendation:**

- **Keep:** `cleanupDataV5.ts`, `validateAndFixDatabase.ts` (actively used)
- **Delete:** All `remove*` and one-time cleanup scripts

---

### 3. **Fix Scripts** (Specific Data Corrections)

Scripts created to fix specific data issues:

| Script                      | Purpose                    | Status    | Recommendation |
| --------------------------- | -------------------------- | --------- | -------------- |
| `fixJurgisSD5.ts`           | Fix one student's SD5      | ❌ Delete | One-time fix   |
| `fixSD678.ts`               | Standardize SD6/7/8 format | ❌ Delete | One-time fix   |
| `fixND3ND4Inconsistency.ts` | Fix ND naming              | ❌ Delete | One-time fix   |
| `fixND1Oct10TaskName.ts`    | Fix task name              | ❌ Delete | One-time fix   |
| `fixND5TaskName.ts`         | Fix task name              | ❌ Delete | One-time fix   |
| `fixAssessmentIds.ts`       | Fix assessment IDs         | ❌ Delete | One-time fix   |
| `updateND3ToGraded.ts`      | Update ND3 status          | ❌ Delete | One-time fix   |
| `convertND4ToBinary.ts`     | Convert ND4 scores         | ❌ Delete | One-time fix   |
| `normalizeND4ToBinary.ts`   | Normalize ND4              | ❌ Delete | One-time fix   |

**Recommendation:** **Delete all fix scripts.** They were for specific historical issues that are now resolved.

---

### 4. **Normalization Scripts**

Standardize data formats:

| Script                                  | Purpose                   | Status     | Recommendation     |
| --------------------------------------- | ------------------------- | ---------- | ------------------ |
| `normalizeDiagnosticScores.ts`          | Normalize diagnostic data | ❌ Delete  | One-time fix       |
| `normalizeHomeworkScores.ts`            | Normalize homework scores | ⚠️ Archive | Keep for reference |
| `standardizeColumnNames.ts`             | Standardize column naming | ⚠️ Archive | Keep for reference |
| `convertWeeklyAssessmentToClasswork.ts` | Type conversion           | ❌ Delete  | One-time fix       |

**Recommendation:** Delete one-time fixes, archive reusable patterns.

---

### 5. **Merge Scripts**

Handle duplicate records:

| Script                          | Purpose                  | Status      | Recommendation     |
| ------------------------------- | ------------------------ | ----------- | ------------------ |
| `mergeDuplicateStudent.ts`      | Merge duplicate students | ✅ **Keep** | Reusable utility   |
| `mergeStudentDuplicates.ts`     | Alternative merge script | ⚠️ Compare  | Check if duplicate |
| `mergeWeeklyComments.ts`        | Merge comments           | ❌ Delete   | One-time fix       |
| `mergeND4ReflectionHomework.ts` | Merge ND4 data           | ❌ Delete   | One-time fix       |
| `mergeND1KComments.ts`          | Merge ND1K comments      | ❌ Delete   | One-time fix       |
| `mergeND1Oct10IntoND5.ts`       | Merge assessments        | ❌ Delete   | One-time fix       |
| `mergeNewDataToV4.ts`           | Merge new data           | ❌ Delete   | One-time fix       |

**Recommendation:**

- **Keep:** `mergeDuplicateStudent.ts` (general-purpose)
- **Delete:** All specific merge scripts

---

### 6. **Import/Export Scripts**

Handle data transfer between Excel and JSON:

| Script                         | Purpose                          | Status                  | Recommendation     |
| ------------------------------ | -------------------------------- | ----------------------- | ------------------ |
| `importCambridgeObjectives.ts` | Import Cambridge data from Excel | ✅ **Keep & Formalize** | Very useful        |
| `importAssessmentData.ts`      | Import assessments from Excel    | ✅ **Keep & Formalize** | Very useful        |
| `exportStudentDataV4.ts`       | Export to master JSON            | ✅ **Keep**             | Active utility     |
| `exportStudentData.ts`         | Alternative export               | ⚠️ Check                | May be old version |
| `exportStudentData.js`         | JS version                       | ❌ Delete               | Use TS version     |
| `extractStudentFiles.ts`       | Extract individual files         | ⚠️ Review               | Check if needed    |

**Recommendation:**

- **Formalize:** Import scripts should become proper CLI tools
- **Delete:** JavaScript versions

---

### 7. **Inspection/Analysis Scripts**

Diagnostic and debugging tools:

| Script                         | Purpose                 | Status                  | Recommendation          |
| ------------------------------ | ----------------------- | ----------------------- | ----------------------- |
| `inspectDataJ.ts`              | Inspect Excel structure | ✅ **Keep & Formalize** | Very useful             |
| `inspectExcel.ts`              | Simple Excel inspector  | ⚠️ Consolidate          | Merge with inspectDataJ |
| `inspectExcelColumns.ts`       | Column analysis         | ⚠️ Consolidate          | Merge with inspectDataJ |
| `inspectExcelRaw.ts`           | Raw data inspection     | ⚠️ Consolidate          | Merge with inspectDataJ |
| `analyzeAssessmentData.ts`     | Assessment analysis     | ✅ **Keep**             | Useful diagnostic       |
| `analyzeAssessmentDataDeep.ts` | Deep analysis           | ⚠️ Consolidate          | Merge with above        |
| `analyzeHomeworkColumns.ts`    | Homework analysis       | ❌ Delete               | One-time analysis       |
| `analyzeND4Values.ts`          | ND4 analysis            | ❌ Delete               | One-time analysis       |
| `checkMasteredStudents.cjs`    | Cambridge mastery check | ✅ **Keep**             | Useful diagnostic       |
| `checkStudentCounts.ts`        | Count checker           | ⚠️ Review               | May be obsolete         |
| `checkValuaSheet.ts`           | Sheet checker           | ❌ Delete               | One-time check          |
| `checkExtra.ts`                | Extra data check        | ❌ Delete               | One-time check          |
| `checkHomework.ts`             | Homework check          | ❌ Delete               | One-time check          |
| `checkMissingHomework.ts`      | Missing homework check  | ❌ Delete               | One-time check          |
| `checkND1TaskNames.ts`         | Task name check         | ❌ Delete               | One-time check          |

**Recommendation:**

- **Keep:** Core inspection tools (`inspectDataJ`, `analyzeAssessmentData`, `checkMasteredStudents`)
- **Consolidate:** Merge similar inspect scripts into one powerful tool
- **Delete:** All one-time check scripts

---

### 8. **Validation Scripts**

| Script                      | Purpose       | Status      | Recommendation     |
| --------------------------- | ------------- | ----------- | ------------------ |
| `validateAndFixDatabase.ts` | V5 validation | ✅ **Keep** | Critical utility   |
| `validateV4Database.ts`     | V4 validation | ⚠️ Archive  | Keep for reference |

**Recommendation:** Keep current version, archive old versions.

---

### 9. **Utility Scripts**

| Script                           | Purpose                     | Status      | Recommendation          |
| -------------------------------- | --------------------------- | ----------- | ----------------------- |
| `generateMissions.ts`            | Generate student missions   | ✅ **Keep** | Active feature          |
| `populateAssessmentTemplates.ts` | Template population         | ⚠️ Review   | Check if still needed   |
| `addExtraActivities.ts`          | Add activities              | ❌ Delete   | One-time operation      |
| `addTeacherTypeToMainData.ts`    | Add teacher type            | ❌ Delete   | One-time operation      |
| `fillMissingHomework.ts`         | Fill missing data           | ❌ Delete   | One-time operation      |
| `createFinalV8.ts`               | Create v8 file              | ⚠️ Review   | Check version relevance |
| `deleteAssessments.ts`           | Delete specific assessments | ⚠️ Keep     | Potentially useful      |

---

### 10. **Web Scripts** (Non-student-data)

| Script                        | Purpose             | Status      | Recommendation  |
| ----------------------------- | ------------------- | ----------- | --------------- |
| `createNewPage.js`            | Create Next.js page | ✅ **Keep** | Web dev utility |
| `checkMissingTranslations.js` | Check i18n          | ✅ **Keep** | Web dev utility |
| `validateTranslations.js`     | Validate i18n       | ✅ **Keep** | Web dev utility |
| `addJsExtensions.js`          | Add extensions      | ⚠️ Review   | May be obsolete |

**Recommendation:** Keep translation/page creation scripts as they're for web development.

---

### 11. **Test/Verification Scripts**

| Script                    | Purpose               | Status    | Recommendation  |
| ------------------------- | --------------------- | --------- | --------------- |
| `testChartForMainData.ts` | Test chart generation | ⚠️ Review | Check if needed |
| `verifyChartOptions.ts`   | Verify charts         | ⚠️ Review | Check if needed |
| `verifyTeacherA.ts`       | Verify teacher data   | ❌ Delete | One-time check  |
| `processStudentData.ts`   | Process data          | ⚠️ Review | Check purpose   |
| `processStudentData.js`   | JS version            | ❌ Delete | Use TS version  |

---

## 🎯 Action Plan

### Phase 1: Delete (Safe - One-time Fixes) ✂️

**These are completed one-time fixes that will never be needed again:**

```
fixJurgisSD5.ts
fixSD678.ts
fixND3ND4Inconsistency.ts
fixND1Oct10TaskName.ts
fixND5TaskName.ts
fixAssessmentIds.ts
updateND3ToGraded.ts
convertND4ToBinary.ts
normalizeND4ToBinary.ts
normalizeDiagnosticScores.ts
convertWeeklyAssessmentToClasswork.ts
cleanupDuplicateEXT1.ts
removeDuplicateNDAssessments.ts
removeDuplicateND1Oct10.ts
mergeWeeklyComments.ts
mergeND4ReflectionHomework.ts
mergeND1KComments.ts
mergeND1Oct10IntoND5.ts
mergeNewDataToV4.ts
analyzeHomeworkColumns.ts
analyzeND4Values.ts
checkValuaSheet.ts
checkExtra.ts
checkHomework.ts
checkMissingHomework.ts
checkND1TaskNames.ts
verifyTeacherA.ts
addExtraActivities.ts
addTeacherTypeToMainData.ts
fillMissingHomework.ts
exportStudentData.js
processStudentData.js
```

**Count:** ~30 scripts

---

### Phase 2: Archive (Reference Only) 📁

**Create `scripts/archive/` with subfolders:**

```
scripts/archive/
├── migrations/
│   ├── migrateToV3.ts
│   ├── migrateToV4.ts
│   ├── migrateV3toV4.ts
│   └── migrateToV4_1.ts
├── normalizations/
│   ├── normalizeHomeworkScores.ts
│   └── standardizeColumnNames.ts
└── validations/
    └── validateV4Database.ts
```

**Count:** ~7 scripts

---

### Phase 3: Consolidate (Merge Similar Scripts) 🔧

**Create `scripts/tools/` with consolidated utilities:**

#### A. **Excel Inspector Tool** (`scripts/tools/inspectExcel.ts`)

Merge these into one comprehensive Excel inspection tool:

- `inspectDataJ.ts` ✅ (use as base)
- `inspectExcel.ts`
- `inspectExcelColumns.ts`
- `inspectExcelRaw.ts`

**Features:**

- View sheet structure
- Analyze column patterns
- Sample data preview
- Multiple output formats (summary/detailed/raw)
- CLI flags for different modes

#### B. **Assessment Analyzer Tool** (`scripts/tools/analyzeAssessments.ts`)

Merge these:

- `analyzeAssessmentData.ts` ✅ (use as base)
- `analyzeAssessmentDataDeep.ts`

**Features:**

- Assessment statistics
- Missing data detection
- Score distribution
- Deep dive mode

---

### Phase 4: Formalize (Production-Ready Scripts) 🎨

**Create `scripts/tools/` with proper CLI tools:**

#### 1. **Import Tool** (`scripts/tools/importData.ts`)

Formalize these into one comprehensive import tool:

- `importCambridgeObjectives.ts`
- `importAssessmentData.ts`

**Features:**

- Import Cambridge objectives from Excel
- Import regular assessments from Excel
- Validate before import
- Rollback capability
- Proper error handling
- Progress indicators
- CLI flags: `--type=cambridge|assessments`, `--validate-only`, etc.

#### 2. **Export Tool** (`scripts/tools/exportData.ts`)

Consolidate:

- `exportStudentDataV4.ts`
- `exportStudentData.ts`

**Features:**

- Export to various formats (JSON, CSV)
- Filter by class/student
- Include/exclude fields
- CLI flags: `--format`, `--class`, `--fields`, etc.

#### 3. **Inspect Tool** (`scripts/tools/inspect.ts`)

Consolidated inspection utility with:

- Excel file inspection
- JSON data inspection
- Schema validation
- Data quality checks

#### 4. **Validate Tool** (`scripts/tools/validate.ts`)

Enhanced version of `validateAndFixDatabase.ts` with:

- Different validation levels
- Report generation
- Auto-fix mode
- Dry-run mode

---

### Phase 5: Keep As-Is (Production Scripts) ✅

**Current working scripts to keep:**

```
scripts/
├── cleanupDataV5.ts              # Active cleanup utility
├── validateAndFixDatabase.ts      # Critical validation
├── mergeDuplicateStudent.ts       # General-purpose merger
├── generateMissions.ts            # Active feature
├── checkMasteredStudents.cjs      # Useful diagnostic
├── deleteAssessments.ts           # Potentially useful
├── createNewPage.js               # Web dev utility
├── checkMissingTranslations.js    # Web dev utility
└── validateTranslations.js        # Web dev utility
```

**Count:** ~9 scripts

---

## 📈 Final Structure

```
scripts/
├── archive/                       # Historical scripts (reference only)
│   ├── migrations/
│   ├── normalizations/
│   └── validations/
├── tools/                         # Production CLI tools
│   ├── inspectExcel.ts           # Consolidated Excel inspector
│   ├── analyzeAssessments.ts     # Consolidated analyzer
│   ├── importData.ts             # Unified import tool
│   ├── exportData.ts             # Unified export tool
│   └── validate.ts               # Enhanced validator
├── utilities/                     # Current working scripts
│   ├── cleanupDataV5.ts
│   ├── validateAndFixDatabase.ts
│   ├── mergeDuplicateStudent.ts
│   ├── generateMissions.ts
│   ├── checkMasteredStudents.cjs
│   └── deleteAssessments.ts
├── web/                          # Web development scripts
│   ├── createNewPage.js
│   ├── checkMissingTranslations.js
│   └── validateTranslations.js
└── README.md                     # Documentation
```

---

## 📊 Summary

| Category        | Current | After Cleanup | Action                          |
| --------------- | ------- | ------------- | ------------------------------- |
| **Delete**      | 30      | 0             | Remove completed one-time fixes |
| **Archive**     | 7       | 7             | Move to archive/ for reference  |
| **Consolidate** | 6       | 2             | Merge similar tools             |
| **Formalize**   | 4       | 4             | Enhance into proper CLI tools   |
| **Keep**        | 9       | 9             | Active production scripts       |
| **Web Scripts** | 4       | 4             | Keep in web/ folder             |
| **TOTAL**       | **71**  | **26**        | **63% reduction**               |

---

## ✅ Benefits

1. **Clarity:** Clear separation between active tools and historical scripts
2. **Maintainability:** Fewer scripts to understand and maintain
3. **Professionalism:** Formalized tools with proper CLI interfaces
4. **Documentation:** Archive serves as project history
5. **Efficiency:** Consolidated tools are more powerful and easier to use

---

## 🚀 Next Steps

1. **Review this assessment** - Do these recommendations align with your needs?
2. **Answer questions:**
   - Are there any scripts I marked for deletion that you still need?
   - Do you want me to implement the consolidation/formalization now?
   - Should we keep any backup before deletion?
3. **Execute cleanup** - I can automate most of this restructuring
4. **Create documentation** - Add README.md with usage examples

---

## ❓ Questions for You

1. **Current data version:** Are you currently on V5 schema? Or still using V4?
2. **Active workflows:** Which scripts do you use regularly (daily/weekly)?
3. **Future migrations:** Do you anticipate another schema migration soon?
4. **Import frequency:** How often do you import data from Excel?
5. **Backup preference:** Should I create a full backup before any changes?
6. **Consolidation priority:** Which tools would you like me to consolidate first?

Would you like me to proceed with the cleanup, or do you have questions about any of these recommendations?
