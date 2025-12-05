# Name Alias System Fix - V3 Integration

## Issue

After implementing the V3 processing logic, the name alias system was not working correctly. When processing `raw_data.xlsx`, 5 duplicate students were created instead of using the name aliases to resolve shortened names to full names.

## Root Cause

**Location**: `src/features/modules/edtech/progressReport/student-data/utils/studentDataManagerV3.ts` (line 105)

The V3 manager was passing `sheet.sheetName` (e.g., "Vyd_S", "Grei_S") to the `findStudent` method instead of `sheet.className` (e.g., "8 Vydūnas", "8 A. J. Greimas").

```typescript
// ❌ WRONG - Using sheetName
let student = this.processor.findStudent(studentsList, firstName, lastName, sheet.sheetName);

// ✅ CORRECT - Using className
let student = this.processor.findStudent(studentsList, firstName, lastName, sheet.className);
```

## Impact

The name alias resolver (`resolveNameAlias`) compares the className parameter against the aliases defined in `nameAliases.ts`, which use full class names:

```typescript
{
    excelFirstName: 'Ažuolas',
    excelLastName: 'Vainilka',
    fullFirstName: 'Ažuolas Jonas',
    fullLastName: 'Vainilka',
    className: '8 Vydūnas'  // ← Full class name
}
```

When comparing "Vyd_S" (sheetName) to "8 Vydūnas" (className in alias), no match was found, causing the system to:
1. Not resolve the alias
2. Not find the existing student with the full name
3. Create a new duplicate student with the shortened name

## Solution

**File**: `src/features/modules/edtech/progressReport/student-data/utils/studentDataManagerV3.ts`

### Changes Made

**Line 105**: Updated `findStudent` call
```typescript
// Before
let student = this.processor.findStudent(studentsList, firstName, lastName, sheet.sheetName);

// After
let student = this.processor.findStudent(studentsList, firstName, lastName, sheet.className);
```

**Lines 108-112**: Updated `createNewStudent` call
```typescript
// Before
Logger.info('Creating new student', { firstName, lastName, class: sheet.sheetName });
student = this.processor.createNewStudent(
    firstName,
    lastName,
    sheet.sheetName,
    `ST${String(nextStudentId).padStart(5, '0')}`
);

// After
Logger.info('Creating new student', { firstName, lastName, class: sheet.className });
student = this.processor.createNewStudent(
    firstName,
    lastName,
    sheet.className,
    `ST${String(nextStudentId).padStart(5, '0')}`
);
```

## Testing & Verification

### Before Fix
```
Processing: raw_data.xlsx
- ❌ 5 new students created (duplicates with shortened names)
- Total students: 80 (75 original + 5 duplicates)
- Name aliases: Not working
```

### After Fix
```
Processing: raw_data.xlsx
- ✅ 0 new students created
- ✅ All 5 name aliases resolved:
  [INFO] Resolved name alias {
    excelName: 'Ažuolas Vainilka',
    fullName: 'Ažuolas Jonas Vainilka',
    className: '8 Vydūnas'
  }
  [INFO] Resolved name alias {
    excelName: 'Daumantas Van der Molen',
    fullName: 'Daumantas Jokūbas Van der Molen',
    className: '8 A. J. Greimas'
  }
  [INFO] Resolved name alias {
    excelName: 'Paulius Šulnius',
    fullName: 'Paulius Martynas Šulnius',
    className: '8 M. A. Gimbutienė'
  }
  [INFO] Resolved name alias {
    excelName: 'Kristupas Vinča',
    fullName: 'Kristupas Augustas Vinča',
    className: '8 M. A. Gimbutienė'
  }
  [INFO] Resolved name alias {
    excelName: 'Bonifacijus Kiela',
    fullName: 'Bonifacijus Marijus Kiela',
    className: '8 I. Veisaitė'
  }
- Total students: 75 (correct count)
- Name aliases: Fully functional ✅
```

## Affected Students

The 5 students with name aliases:

1. **Ažuolas Vainilka** → **Ažuolas Jonas Vainilka** (8 Vydūnas)
2. **Daumantas Van der Molen** → **Daumantas Jokūbas Van der Molen** (8 A. J. Greimas)
3. **Paulius Šulnius** → **Paulius Martynas Šulnius** (8 M. A. Gimbutienė)
4. **Kristupas Vinča** → **Kristupas Augustas Vinča** (8 M. A. Gimbutienė)
5. **Bonifacijus Kiela** → **Bonifacijus Marijus Kiela** (8 I. Veisaitė)

## Related Files

- `src/features/modules/edtech/progressReport/student-data/utils/studentDataManagerV3.ts` - Fixed
- `src/features/modules/edtech/progressReport/student-data/config/nameAliases.ts` - Alias definitions
- `src/features/modules/edtech/progressReport/student-data/processors/dataProcessorV3.ts` - Uses resolver
- `scripts/extractStudentFiles.ts` - Helper to restore from master file

## Prevention

To prevent similar issues in the future:

1. **Always use `className` for alias resolution**, not `sheetName`
2. **Test with known aliases** after any changes to processing logic
3. **Check student count** after processing (should remain at 75)
4. **Review logs** for "Resolved name alias" messages

## Date Fixed
**October 24, 2025**

