# Weekly Assessment Migration Summary

## Overview

This migration converts all `weekly_assessment` type records to `classwork` type and marks them as experimental, ensuring they are filtered out from timeline displays.

## What Changed

### Database Changes (v4.1 → v4.2)

**Records Affected:** 103 `weekly_assessment` records across all students

**Changes Made:**
1. **Type Change**: `weekly_assessment` → `classwork`
2. **Task Name Update**: Appends "(experimental)" to task names that don't already have it
3. **Assessment Title Update**: Appends "(Experimental)" to assessment titles
4. **Schema Version**: Updated to `4.2`

**Example Before:**
```json
{
  "date": "2025-10-06",
  "column": "EXT1",
  "type": "weekly_assessment",
  "task_name": "EXT1 assessment",
  "score": "1",
  "assessment_id": "exercise-progress-weekly",
  "assessment_title": "Exercise Progress - Weekly Check"
}
```

**Example After:**
```json
{
  "date": "2025-10-06",
  "column": "EXT1",
  "type": "classwork",
  "task_name": "EXT1 assessment (experimental)",
  "score": "1",
  "assessment_id": "exercise-progress-weekly",
  "assessment_title": "Exercise Progress - Weekly Check (Experimental)"
}
```

### Code Changes

#### 1. Type Definitions (`ProgressReportTypes.ts`)
- **Removed** `weekly_assessment` from `AssessmentType` union
- Updated comment for `classwork` to indicate it includes experimental classwork

#### 2. Filter Logic (Timeline & Student View)
Enhanced experimental filtering to exclude:
- EXT classwork from September 2025
- EXT classwork from October 2025
- Any classwork with "experimental" in the task name

**Filter Logic:**
```typescript
if (assessment.column?.startsWith('EXT') && 
    assessment.type === 'classwork' &&
    (assessment.date.startsWith('2025-09') || 
     assessment.date.startsWith('2025-10') ||
     assessment.task_name?.toLowerCase().includes('experimental'))) {
    return; // Filter out
}
```

## Migration Process

### Step 1: Run the Migration Script

```bash
npm run migrate:weekly-to-classwork
```

Or directly:
```bash
npx ts-node scripts/convertWeeklyAssessmentToClasswork.ts
```

### Step 2: Review Output

The script will:
1. ✅ Create a backup: `master_student_data_v4_1_backup_YYYY-MM-DD.json`
2. ✅ Generate new database: `master_student_data_v4_2.json`
3. ✅ Display conversion statistics

**Expected Output:**
```
🔄 Starting migration: weekly_assessment -> classwork (experimental)
📂 Reading from: master_student_data_v4_1_final.json
💾 Creating backup: master_student_data_v4_1_backup_2025-10-26.json
  ✓ Student Name: 2 assessments converted
  ...
💾 Writing migrated data to: master_student_data_v4_2.json

✅ Migration completed successfully!
📊 Summary:
   - Total assessments converted: 103
   - Students affected: ~50
   - Backup created: master_student_data_v4_1_backup_2025-10-26.json
   - New database: master_student_data_v4_2.json
```

### Step 3: Update Application Configuration

Update any configuration or environment variables that reference the database file:

```typescript
// Before (if you had it hardcoded anywhere)
const DATABASE_FILE = 'master_student_data_v4_1_final.json';

// After
const DATABASE_FILE = 'master_student_data_v4_2.json';

// Note: The Progress Report loads data via file upload in the browser,
// so no code changes are needed - just upload the new v4_2 file.
```

### Step 4: Verify Changes

1. Load the new database in your application
2. Navigate to Student View
3. Filter by "classwork" type
4. Verify that EXT records from Sept/Oct are not displayed
5. Check that legitimate classwork still displays correctly

## Safety Features

✅ **Automatic Backup**: Original database is backed up before any changes
✅ **No Data Loss**: All records are preserved, only types are changed
✅ **Graceful Degradation**: Filters handle both old and new data structures
✅ **Idempotent**: Script can be run multiple times safely (won't duplicate "(experimental)")

## Rollback Procedure

If you need to revert the migration:

1. In the Progress Report UI, simply upload the original backup file:
   - `master_student_data_v4_1_final.json` OR
   - `master_student_data_v4_1_backup_YYYY-MM-DD.json`
2. The data is stored in browser localStorage, so just re-upload the old file
3. Revert code changes using git:
   ```bash
   git checkout HEAD -- src/features/modules/edtech/types/ProgressReportTypes.ts
   git checkout HEAD -- src/features/modules/edtech/components/progressReport/ActivityTimelineChart.tsx
   git checkout HEAD -- src/features/modules/edtech/components/sections/progressReport/StudentViewSectionEnhanced.tsx
   ```
4. Restart your application

## Impact Assessment

### ✅ What Will Work
- All existing data display functionality
- Timeline charts (experimental data hidden)
- Assessment tables (experimental data hidden)
- Filtering by type (weekly_assessment converted to classwork)
- Board solving cumulative calculation
- All other assessment types

### ⚠️ What Changed
- Weekly assessments now appear as classwork (but are filtered out as experimental)
- `weekly_assessment` type no longer exists in the system
- EXT classwork from Sept/Oct is hidden from display

### ❌ No Breaking Changes
- No API changes
- No UI changes (except filtered data)
- No data loss

## Files Modified

### Migration Script
- `scripts/convertWeeklyAssessmentToClasswork.ts` (new)
- `package.json` (added migration command)

### Type Definitions
- `src/features/modules/edtech/types/ProgressReportTypes.ts`

### Components
- `src/features/modules/edtech/components/progressReport/ActivityTimelineChart.tsx`
- `src/features/modules/edtech/components/sections/progressReport/StudentViewSectionEnhanced.tsx`

### Documentation
- `WEEKLY_ASSESSMENT_MIGRATION.md` (this file)

## Support

If you encounter any issues during migration:

1. Check that the backup file was created
2. Verify the script output for errors
3. Review the new database file structure
4. Check browser console for any runtime errors
5. Verify that filters are working correctly in Student View

## Future Considerations

- Consider creating a centralized "experimental data" flag in the database schema
- Implement an admin UI for managing experimental data visibility
- Create automated tests for filter logic
- Consider date-range based filtering instead of hardcoded months

---

**Migration Status**: Ready to run
**Database Version**: v4.1 → v4.2
**Breaking Changes**: None
**Data Loss Risk**: None (backup created)

