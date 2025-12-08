# Name Alias System

Documentation for handling students with shortened names in the Excel data processing system.

## 🎯 Problem

When processing Excel files, some student names are shortened (missing middle names), which causes the system to create duplicate student records instead of updating existing ones.

### Example

- **Database**: Ažuolas Jonas Vainilka
- **Excel**: Ažuolas Vainilka
- **Result**: System creates a new student instead of updating the existing one

## ✅ Solution

A **name alias mapping system** that resolves shortened names to full names before processing.

## 📁 Files Involved

```
src/features/modules/edtech/progressReport/student-data/
├── config/
│   └── nameAliases.ts          # Name alias definitions and resolver
├── processors/
│   └── dataProcessor.ts        # Uses alias resolver in findStudent()
└── utils/
    └── studentDataManager.ts   # Passes className to findStudent()
```

## 🔧 How It Works

### 1. Define Aliases

Edit `src/features/modules/edtech/progressReport/student-data/config/nameAliases.ts`:

```typescript
export const NAME_ALIASES: NameAlias[] = [
  {
    excelFirstName: "Ažuolas",
    excelLastName: "Vainilka",
    fullFirstName: "Ažuolas Jonas",
    fullLastName: "Vainilka",
    className: "8 Vydūnas",
  },
  // ... more aliases
];
```

### 2. Resolution Process

```typescript
// 1. Excel contains: Ažuolas Vainilka
// 2. System calls: resolveNameAlias('Ažuolas', 'Vainilka', '8 Vydūnas')
// 3. Returns: { firstName: 'Ažuolas Jonas', lastName: 'Vainilka' }
// 4. Finds existing student with full name
// 5. Updates existing record instead of creating new one
```

### 3. Automatic Logging

When a name alias is resolved, the system logs:

```
[INFO] Resolved name alias {
  excelName: 'Ažuolas Vainilka',
  fullName: 'Ažuolas Jonas Vainilka',
  className: '8 Vydūnas'
}
```

## 🔄 Merging Existing Duplicates

If duplicates already exist, use the merge script:

```bash
npx tsx scripts/mergeStudentDuplicates.ts
```

**What it does:**

1. Identifies duplicate pairs (short name vs full name)
2. Merges assessments from short name file into full name file
3. Removes duplicate assessments (same date + column)
4. Deletes the short name file
5. Keeps the full name file with all data

**Results:**

- ✅ 5 duplicate pairs merged
- ✅ 34 assessments transferred
- ✅ Student count: 80 → 75

## 📋 Current Aliases

| Excel Name              | Full Name                       | Class              |
| ----------------------- | ------------------------------- | ------------------ |
| Ažuolas Vainilka        | Ažuolas Jonas Vainilka          | 8 Vydūnas          |
| Daumantas Van der Molen | Daumantas Jokūbas Van der Molen | 8 A. J. Greimas    |
| Paulius Šulnius         | Paulius Martynas Šulnius        | 8 M. A. Gimbutienė |
| Kristupas Vinča         | Kristupas Augustas Vinča        | 8 M. A. Gimbutienė |
| Bonifacijus Kiela       | Bonifacijus Marijus Kiela       | 8 I. Veisaitė      |

## ➕ Adding New Aliases

When you discover a new shortened name:

1. **Add to nameAliases.ts:**

```typescript
{
    excelFirstName: 'ShortFirst',
    excelLastName: 'ShortLast',
    fullFirstName: 'Full First Name',
    fullLastName: 'Full Last Name',
    className: 'Class Name'
}
```

2. **No other changes needed** - the system automatically uses the new alias on next processing

## 🧪 Testing

### Test Name Resolution

```typescript
import { resolveNameAlias } from "@progressReport/student-data/config/nameAliases";

const result = resolveNameAlias("Ažuolas", "Vainilka", "8 Vydūnas");
console.log(result);
// Output: { firstName: 'Ažuolas Jonas', lastName: 'Vainilka' }
```

### Verify No Duplicates Created

```bash
# Process Excel with shortened names
npx tsx scripts/processStudentData.ts raw_data.xlsx

# Check student count (should remain 75)
npx tsx scripts/exportStudentData.ts test_export.json
# Look for: "total_students: 75"
```

## 🚨 Troubleshooting

### Problem: Duplicate still created

**Check:**

1. Is the alias defined in `nameAliases.ts`?
2. Does the className match exactly?
3. Are first/last names spelled exactly as in Excel?

**Debug:**

- Check logs for "Resolved name alias" messages
- If missing, alias is not being triggered

### Problem: Wrong student updated

**Check:**

- Verify className in alias matches the sheet being processed
- Ensure no typos in full names

## 📊 Statistics

**Current System:**

- Students: 75
- Name aliases: 5
- Duplicate merges performed: 5
- Assessments recovered: 34

## 🔜 Future Enhancements

- [ ] Fuzzy name matching (Levenshtein distance)
- [ ] Auto-detection of potential aliases
- [ ] UI for managing aliases without code changes
- [ ] Bulk alias import from CSV
- [ ] Alias validation on startup

---

**Last Updated:** October 24, 2025  
**Version:** 1.0.0  
**Status:** ✅ Active
