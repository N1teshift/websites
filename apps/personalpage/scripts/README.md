# Scripts Directory

**Last Updated:** November 10, 2025  
**Current Data Schema:** V5

This directory contains utilities and tools for managing student assessment data. The scripts have been reorganized into a clean, maintainable structure.

---

## 📁 Directory Structure

```
scripts/
├── tools/                      # Production CLI tools
│   ├── inspectExcel.ts         # Excel file analysis
│   ├── analyzeAssessments.ts   # Assessment data analysis
│   ├── importData.ts           # Import from Excel to JSON
│   ├── exportData.ts           # Export data to various formats
│   └── validate.ts             # Validation and auto-fix
├── utilities/                  # Active utilities
│   ├── cleanupDataV5.ts        # V5 data cleanup
│   ├── validateAndFixDatabase.ts  # V5 validator
│   ├── mergeDuplicateStudent.ts   # Merge duplicate records
│   ├── generateMissions.ts     # Generate student missions
│   ├── checkMasteredStudents.cjs  # Cambridge mastery checker
│   ├── deleteAssessments.ts    # Delete specific assessments
│   ├── cleanupMasterJson.ts    # JSON cleanup utility
│   ├── importCambridgeObjectives.ts  # Original Cambridge import
│   ├── importAssessmentData.ts # Original assessment import
│   ├── exportStudentDataV4.ts  # Original V4 export
│   ├── exportStudentData.ts    # Original export
│   └── extractStudentFiles.ts  # Extract individual files
├── web/                        # Web development scripts
│   ├── createNewPage.js        # Next.js page generator
│   ├── checkMissingTranslations.js  # i18n check
│   ├── validateTranslations.js # i18n validation
│   └── addJsExtensions.js      # Add JS extensions
├── archive/                    # Historical scripts (reference)
│   ├── migrations/             # Schema migration scripts
│   ├── normalizations/         # Data normalization scripts
│   └── validations/            # Old validation scripts
├── SCRIPTS_ASSESSMENT.md       # Full assessment document
└── README.md                   # This file
```

---

## 🛠️ Production Tools

These are the main tools you should use for daily operations.

### 1. **Excel Inspector** (`tools/inspectExcel.ts`)

Analyze Excel file structure, columns, and data patterns.

```bash
# Quick summary
npx tsx scripts/tools/inspectExcel.ts data.xlsx

# Detailed analysis with column patterns
npx tsx scripts/tools/inspectExcel.ts data.xlsx --mode=detailed

# Inspect specific sheet
npx tsx scripts/tools/inspectExcel.ts data.xlsx --sheet="Vyd_S" --samples=10

# Raw cell data view
npx tsx scripts/tools/inspectExcel.ts data.xlsx --mode=raw
```

**Options:**

- `--mode=summary` - Quick overview (default)
- `--mode=detailed` - Full analysis with patterns
- `--mode=raw` - Raw cell data with types
- `--sheet=<name>` - Analyze specific sheet
- `--samples=<n>` - Number of sample rows (default: 5)

---

### 2. **Assessment Analyzer** (`tools/analyzeAssessments.ts`)

Analyze assessment data, statistics, and completion rates.

```bash
# Summary statistics
npx tsx scripts/tools/analyzeAssessments.ts data.json

# Detailed breakdown by type
npx tsx scripts/tools/analyzeAssessments.ts data.json --mode=detailed

# Deep analysis with student-level data
npx tsx scripts/tools/analyzeAssessments.ts data.json --mode=deep

# Show only students with missing assessments
npx tsx scripts/tools/analyzeAssessments.ts data.json --mode=deep --missing

# Filter by type and class
npx tsx scripts/tools/analyzeAssessments.ts data.json --type=homework --class="8 Vydūnas"
```

**Options:**

- `--mode=summary` - Quick statistics (default)
- `--mode=detailed` - Detailed breakdown by type
- `--mode=deep` - Deep analysis with student-level data
- `--type=<type>` - Filter by assessment type
- `--class=<name>` - Filter by class name
- `--missing` - Show only missing/incomplete assessments

---

### 3. **Data Importer** (`tools/importData.ts`)

Import assessment data from Excel to JSON.

```bash
# Import Cambridge objectives
npx tsx scripts/tools/importData.ts \
  --excel=data.xlsx \
  --json=current.json \
  --type=cambridge

# Validate before import
npx tsx scripts/tools/importData.ts \
  --excel=data.xlsx \
  --json=current.json \
  --validate-only

# Import without backup (not recommended)
npx tsx scripts/tools/importData.ts \
  --excel=data.xlsx \
  --json=current.json \
  --type=cambridge \
  --no-backup
```

**Options:**

- `--excel=<file>` - Excel file to import from (required)
- `--json=<file>` - JSON file to update (required)
- `--output=<file>` - Output file (default: adds \_updated suffix)
- `--type=assessments` - Import regular assessments (default)
- `--type=cambridge` - Import Cambridge objectives
- `--validate-only` - Only validate, don't import
- `--no-backup` - Skip backup creation

**Note:** For full assessment import, use the original `utilities/importAssessmentData.ts` until this tool is fully implemented.

---

### 4. **Data Exporter** (`tools/exportData.ts`)

Export student data to various formats.

```bash
# Export to JSON
npx tsx scripts/tools/exportData.ts \
  --input=data.json \
  --output=export.json

# Export specific class to CSV
npx tsx scripts/tools/exportData.ts \
  --input=data.json \
  --output=vydūnas.csv \
  --format=csv \
  --class="8 Vydūnas"

# Export with specific fields only
npx tsx scripts/tools/exportData.ts \
  --input=data.json \
  --output=minimal.json \
  --fields=id,first_name,last_name,class_name

# Exclude sensitive fields
npx tsx scripts/tools/exportData.ts \
  --input=data.json \
  --output=public.json \
  --exclude=conduct,communication
```

**Options:**

- `--input=<file>` - Input JSON file
- `--output=<file>` - Output file (required)
- `--format=json|csv` - Export format (default: json)
- `--class=<name>` - Filter by class name
- `--fields=<list>` - Include only these fields (comma-separated)
- `--exclude=<list>` - Exclude these fields (comma-separated)
- `--no-pretty` - Compact JSON output

---

### 5. **Data Validator** (`tools/validate.ts`)

Validate and fix student data according to V5 schema.

```bash
# Quick validation (dry-run)
npx tsx scripts/tools/validate.ts data.json

# Standard validation with auto-fix
npx tsx scripts/tools/validate.ts data.json --fix --no-dry-run

# Deep validation with report
npx tsx scripts/tools/validate.ts data.json \
  --level=deep \
  --report=validation_report.json

# Auto-fix without backup (not recommended)
npx tsx scripts/tools/validate.ts data.json \
  --fix \
  --no-dry-run \
  --no-backup
```

**Options:**

- `--level=quick` - Check only critical fields
- `--level=standard` - Check all important fields (default)
- `--level=deep` - Comprehensive validation
- `--fix` - Auto-fix issues
- `--dry-run` - Report only, don't save (default)
- `--no-dry-run` - Save changes
- `--report=<file>` - Save detailed report
- `--no-backup` - Skip backup creation

**Validation Levels:**

- **quick**: Checks only `assessment_id` fields
- **standard**: Checks all important fields and formats (default)
- **deep**: Comprehensive validation including naming conventions

---

## 🔧 Utilities

Active utility scripts for specific tasks.

### Data Cleanup & Validation

```bash
# Clean V5 data (remove old/duplicate assessments)
npx tsx scripts/utilities/cleanupDataV5.ts data.json

# Validate and auto-fix V5 database
npx tsx scripts/utilities/validateAndFixDatabase.ts data.json

# Cleanup mixed v3/v4 JSON to pure v4
npx tsx scripts/utilities/cleanupMasterJson.ts input.json output.json
```

### Student Management

```bash
# Merge duplicate student records
npx tsx scripts/utilities/mergeDuplicateStudent.ts "CorrectName" "WrongName" "FirstName"

# Generate student missions
npx tsx scripts/utilities/generateMissions.ts input.json output.json

# Check Cambridge mastery status
node scripts/utilities/checkMasteredStudents.cjs

# Delete specific assessments
npx tsx scripts/utilities/deleteAssessments.ts data.json
```

### Import/Export (Original Scripts)

```bash
# Import Cambridge objectives (full implementation)
npx tsx scripts/utilities/importCambridgeObjectives.ts data.xlsx current.json output.json

# Import assessment data
npx tsx scripts/utilities/importAssessmentData.ts data.xlsx current.json output.json

# Export student data (V4)
npx tsx scripts/utilities/exportStudentDataV4.ts output.json

# Extract individual student files
npx tsx scripts/utilities/extractStudentFiles.ts data.json
```

---

## 🌐 Web Development Scripts

Utilities for Next.js development and i18n.

```bash
# Create new Next.js page
node scripts/web/createNewPage.js pageName

# Check for missing translations
node scripts/web/checkMissingTranslations.js

# Validate translation files
node scripts/web/validateTranslations.js

# Add .js extensions to imports
node scripts/web/addJsExtensions.js
```

---

## 📚 Archive

Historical scripts kept for reference. **Do not use these for new work.**

### Migrations (`archive/migrations/`)

- `migrateToV3.ts` - v2 → v3 migration
- `migrateToV4.ts` - v3 → v4 migration (master file)
- `migrateV3toV4.ts` - v3 → v4 migration (individual files)
- `migrateToV4_1.ts` - v4.0 → v4.1 migration
- `migrateAssessmentData.ts` - Assessment data migration

### Normalizations (`archive/normalizations/`)

- `normalizeHomeworkScores.ts` - Normalize homework scores
- `standardizeColumnNames.ts` - Standardize column naming

### Validations (`archive/validations/`)

- `validateV4Database.ts` - V4 validation

---

## 📖 Quick Reference

### Common Workflows

#### 1. **Import New Excel Data**

```bash
# Step 1: Inspect Excel file
npx tsx scripts/tools/inspectExcel.ts data.xlsx --mode=detailed

# Step 2: Validate current data
npx tsx scripts/tools/validate.ts current.json --level=deep

# Step 3: Import (Cambridge objectives)
npx tsx scripts/tools/importData.ts \
  --excel=data.xlsx \
  --json=current.json \
  --type=cambridge

# Step 4: Validate updated data
npx tsx scripts/tools/validate.ts current_updated.json --fix --no-dry-run
```

#### 2. **Analyze Current Data**

```bash
# Overview
npx tsx scripts/tools/analyzeAssessments.ts data.json

# Detailed by type
npx tsx scripts/tools/analyzeAssessments.ts data.json --mode=detailed

# Find students with missing assessments
npx tsx scripts/tools/analyzeAssessments.ts data.json --mode=deep --missing
```

#### 3. **Clean and Validate Data**

```bash
# Step 1: Backup
cp data.json data_backup_$(date +%Y%m%d).json

# Step 2: Clean
npx tsx scripts/utilities/cleanupDataV5.ts data.json

# Step 3: Validate and fix
npx tsx scripts/tools/validate.ts data_cleaned.json \
  --level=deep \
  --fix \
  --no-dry-run \
  --report=validation_report.json

# Step 4: Verify
npx tsx scripts/tools/analyzeAssessments.ts data_cleaned_validated.json
```

#### 4. **Export for Analysis**

```bash
# Export specific class to CSV
npx tsx scripts/tools/exportData.ts \
  --input=data.json \
  --output=vydūnas_class.csv \
  --format=csv \
  --class="8 Vydūnas"

# Export minimal JSON for web
npx tsx scripts/tools/exportData.ts \
  --input=data.json \
  --output=web_data.json \
  --exclude=conduct,communication,notes
```

---

## 🚨 Important Notes

### Data Safety

1. **Always create backups** before running any data modification scripts
2. **Test with dry-run first** - Most tools support `--dry-run` or `--validate-only`
3. **Use version control** - Commit your data files to git before major changes

### Schema Versions

- **Current Version:** V5
- **Validation:** Always validate after import/modifications
- **Migration:** Archived migration scripts are kept for reference only

### Tool Priorities

**Use these tools first (formalized, maintained):**

- `tools/inspectExcel.ts`
- `tools/analyzeAssessments.ts`
- `tools/exportData.ts`
- `tools/validate.ts`

**Use these when needed (specialized utilities):**

- `utilities/cleanupDataV5.ts`
- `utilities/validateAndFixDatabase.ts`
- `utilities/importCambridgeObjectives.ts` (full implementation)

**Avoid these (archived, historical):**

- Anything in `archive/` folder

---

## 🤝 Contributing

When adding new scripts:

1. **Tools** (`tools/`) - Production-ready CLI tools with proper help, error handling, and documentation
2. **Utilities** (`utilities/`) - Specialized utilities for specific tasks
3. **Archive** (`archive/`) - Old scripts kept for reference only
4. **Web** (`web/`) - Web development scripts only

Keep scripts:

- **Modular** - Under 200 lines if possible
- **Documented** - Clear usage and examples
- **Safe** - Always offer dry-run or validation modes

---

## 📞 Help

For detailed information about any tool:

```bash
npx tsx scripts/tools/<tool>.ts --help
```

For comprehensive assessment and cleanup recommendations, see:

- `scripts/SCRIPTS_ASSESSMENT.md`

---

## 📈 Statistics

**Before Cleanup:** 71 scripts  
**After Cleanup:** 26 scripts (63% reduction)

- **Deleted:** 30 one-time fixes
- **Archived:** 7 historical scripts
- **Consolidated:** 6 scripts → 2 powerful tools
- **Formalized:** 4 scripts → production CLI tools
- **Active:** 9 production scripts
- **Web Dev:** 4 scripts

---

**Last cleanup:** November 10, 2025  
**Maintained by:** AI Assistant  
**Data Schema:** V5
