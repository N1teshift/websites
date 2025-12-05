# Database Validation System

## The Problem

When evolving a database schema through multiple versions, old data can have:
- Missing fields (no `assessment_id`, `assessment_title`, `context`)
- Wrong formats (prefixed IDs like `classwork-ext9` instead of `ext9`)
- Outdated structures (binary scores in wrong fields)
- Inconsistent naming (generic "Classwork" instead of "EXT9")

This causes constant issues and slowdowns when working with the data.

## The Solution

Use the **Database Validator** script to automatically scan and fix all inconsistencies.

## Usage

### Basic Validation

```bash
npx tsx scripts/validateAndFixDatabase.ts
```

This will:
1. Read `progress_report_data_2025-11-08_cleaned.json` (default)
2. Scan all student records for issues
3. Auto-fix all problems
4. Save to `progress_report_data_2025-11-08_cleaned_validated.json`

### Validate Specific File

```bash
npx tsx scripts/validateAndFixDatabase.ts myfile.json
```

## What It Fixes

### 1. Missing assessment_id
**Problem**: Old assessments have no `assessment_id`  
**Fix**: Generates ID from column name (EXT1 → ext1, SD6 → sd6)

### 2. Wrong ID Format
**Problem**: IDs have prefixes like `classwork-ext9`, `test-sd6`  
**Fix**: Removes prefixes → `ext9`, `sd6`

### 3. Missing assessment_title
**Problem**: Old assessments missing `assessment_title`  
**Fix**: Generates title from column name

### 4. Generic Titles
**Problem**: EXT columns titled "Classwork"  
**Fix**: Uses column name → "EXT9"

### 5. Old ND Structure
**Problem**: Binary on-time values stored in `score` field  
**Fix**: Moves to `on_time` and `completed_on_time`, clears `score`

### 6. Task Name Mismatch
**Problem**: task_name doesn't follow V5 convention  
**Fix**: Standardizes to format like "EXT9: Exercise Progress"

### 7. Missing Context Field
**Problem**: New `context` field doesn't exist  
**Fix**: Adds empty `context` field

## When to Use

### ✅ Run validator when:
- After importing new Excel data
- Before deploying to production
- When encountering data inconsistency errors
- After manual data edits
- When upgrading schema versions

### ⚠️ Always run after:
- Merging data from multiple sources
- Restoring from old backups
- Manual JSON edits

## Example Output

```
📊 Database info:
   - Students: 75
   - Schema version: 5.0

🔍 Starting database validation...

📊 Validation Report:

❌ Errors: 944
⚠️  Warnings: 1378
ℹ️  Info: 1024
✅ Fixes applied: 6749

Issues by category:
  - missing_field: 1888
  - task_name_mismatch: 785
  - wrong_format: 434
  - generic_title: 239

✨ Done! Your database is now 100% V5 compliant.
```

## V5 Schema Requirements

All assessments must have:
- ✅ `assessment_id` (lowercase, no prefixes)
- ✅ `assessment_title` (matches column or is descriptive)
- ✅ `task_name` (follows convention: "PREFIX##: Description")
- ✅ `context` field (can be empty)
- ✅ For ND1-5: `on_time` and `completed_on_time` (not in `score`)
- ✅ For all: proper `type` classification

## Best Practice Workflow

1. **Import Excel** → New data added
2. **Run Validator** → Fix any issues
3. **Review Report** → Check what was fixed
4. **Use Validated File** → Replace working file
5. **Backup** → Keep validated version

## Future-Proofing

The validator ensures your database stays consistent as you:
- Add new assessment types
- Import data weekly
- Evolve the schema
- Mix old and new data

**No more hunting for inconsistencies! 🎉**


