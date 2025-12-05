# Assessment Deletion Tool

**Created:** November 5, 2025  
**Script:** `scripts/deleteAssessments.ts`  
**Purpose:** Remove unwanted assessments from the progress report database

---

## 🎯 Overview

This tool allows you to selectively delete assessments from your student data by specifying criteria like:
- Date
- Column name
- Assessment ID
- Assessment title
- Assessment type

---

## 🚀 How to Use

### 1. Edit Deletion Rules

Open `scripts/deleteAssessments.ts` and modify the `DELETION_RULES` array:

```typescript
const DELETION_RULES: DeletionRule[] = [
    {
        date: '2025-10-06',
        assessment_id: 'exercise-progress-weekly',
        description: 'Oct 6 - Exercise Progress - Weekly Check'
    },
    {
        date: '2025-09-25',
        column: 'EXT1',
        description: 'Sep 25 - EXT1 Experimental'
    }
    // Add more rules here...
];
```

### 2. Run the Script

```bash
npx tsx scripts/deleteAssessments.ts
```

The script will:
- Read the current data file
- Apply all deletion rules
- Generate a new cleaned file
- Show detailed deletion statistics

---

## 📝 Deletion Rule Format

### Available Criteria

```typescript
{
    date?: string;              // Exact date match (YYYY-MM-DD)
    column?: string;            // Column name (e.g., 'EXT1', 'ND1')
    assessment_id?: string;     // Assessment ID (exact match)
    assessment_title?: string;  // Title (case-insensitive partial match)
    type?: string;             // Assessment type (e.g., 'classwork')
    description: string;        // Human-readable description (required)
}
```

### Matching Logic

An assessment is deleted if **ALL specified criteria match**. For example:

```typescript
{
    date: '2025-10-06',
    column: 'EXT1',
    description: 'Oct 6 EXT1 only'
}
```

This will delete assessments that match **BOTH** Oct 6 **AND** column EXT1.

---

## 📊 Recent Deletion (Nov 5, 2025)

### Assessments Deleted

| Rule | Count | Status |
|------|-------|--------|
| Oct 6 - Exercise Progress - Weekly Check (Experimental) | 54 | ✅ Deleted |
| Sep 25 - EXT*1 Experimental Classwork | 0 | ⚠️ Not found |
| Oct 6 - EXT1 Assessment | 3 | ✅ Deleted |
| Oct 9 - EXT Weekly Assessment (Experimental) | 0 | ⚠️ Not found |
| Oct 9 - EXT Assessment (Classwork) | 18 | ✅ Deleted |
| Oct 10 - EXT2 Weekly Assessment (Experimental) | 0 | ⚠️ Not found |
| Oct 10 - ND1 Assessment (Experimental) | 75 | ✅ Deleted |
| Oct 10 - EXT*2 Classwork | 18 | ✅ Deleted |

**Total Deleted:** 168 assessments

### Generated File

- **Input:** `progress_report_data_2025-11-03_v8_final.json`
- **Output:** `progress_report_data_2025-11-03_v9_cleaned.json`
- **Schema Version:** 4.5
- **Export Version:** v9.0-cleaned

---

## 💡 Common Use Cases

### Delete by Date and Column

```typescript
{
    date: '2025-10-06',
    column: 'EXT1',
    description: 'Remove Oct 6 EXT1'
}
```

### Delete by Assessment ID

```typescript
{
    assessment_id: 'exercise-progress-weekly',
    description: 'Remove all weekly progress checks'
}
```

### Delete by Type

```typescript
{
    type: 'weekly_assessment',
    description: 'Remove all weekly assessments'
}
```

### Delete by Title Pattern

```typescript
{
    assessment_title: 'experimental',
    description: 'Remove all experimental assessments'
}
```

### Delete Specific Date + Type

```typescript
{
    date: '2025-10-10',
    column: 'ND1',
    type: 'homework',
    description: 'Remove Oct 10 ND1 homework'
}
```

---

## ⚠️ Safety Features

1. **Non-destructive:** Creates a new file, original remains untouched
2. **Detailed logging:** Shows exactly what was deleted and from which students
3. **Verification:** Reports how many matches were found for each rule
4. **Rollback:** Keep old versions as backups

---

## 🔧 Customization

### Add New Deletion Rule

1. Open `scripts/deleteAssessments.ts`
2. Add to `DELETION_RULES` array:

```typescript
{
    date: '2025-11-01',
    column: 'TEST',
    description: 'Nov 1 TEST column'
}
```

3. Run the script

### Modify Input/Output Files

Change these lines in the script:

```typescript
const inputFilePath = path.join(__dirname, '..', 'your_input_file.json');
const outputFilePath = path.join(__dirname, '..', 'your_output_file.json');
```

---

## 📁 File Versioning

The script automatically updates:
- **Schema version** (incremented)
- **Export version** (e.g., v9.0-cleaned)
- **Exported timestamp**

This helps track which deletions have been applied.

---

## ✅ Best Practices

1. **Test first:** Run on a copy of your data
2. **Be specific:** Use multiple criteria to avoid accidental deletions
3. **Document:** Always provide clear descriptions for each rule
4. **Backup:** Keep the previous version before applying deletions
5. **Verify:** Check the output statistics to ensure expected deletions
6. **Iterate:** Run the script multiple times if needed (it's safe)

---

## 🐛 Troubleshooting

### "0 entries found"

This means:
- Assessment doesn't exist in the data
- Criteria don't match (check spelling, case, date format)
- Assessment was already deleted in a previous run

### Too many deletions

If more assessments are deleted than expected:
- Make your criteria more specific
- Add additional criteria to narrow the match
- Check the matching logic

### Assessment still present

If an assessment isn't deleted:
- Verify the criteria match exactly
- Check the assessment structure in the JSON
- Try matching by assessment_id instead of title

---

## 🔄 Reverting Deletions

If you deleted something by mistake:

1. Use the previous version file (e.g., v8_final)
2. Modify the deletion rules
3. Re-run the script

The tool is non-destructive, so your original data is always safe.

---

## 📚 Related Scripts

- `mergeND4ReflectionHomework.ts` - Merge duplicate assessments
- `cleanupDuplicateEXT1.ts` - Cleanup specific duplicates
- `createFinalV8.ts` - Combine multiple fixes

---

## 🎉 Success Indicators

When the script runs successfully, you'll see:

```
✅ Deletion Complete!

📊 Deletion Summary:
   ✓ [Rule description]: X entries deleted
   TOTAL DELETED: XXX assessments

📄 Output file: progress_report_data_2025-11-03_vX_cleaned.json
```

The cleaned file is ready to use in your dashboard!



