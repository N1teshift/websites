# Student Data Processing System

- **Type**: Module (shared data provider)
- **Purpose**: Backing processors + contracts for EdTech progress reporting and related analytics.
- **Status**: Production-ready; exports consumed primarily by `features/modules/edtech/progressReport`.

A TypeScript-based system for importing and processing student assessment data from Excel files into individual student JSON files.

## 📁 Directory Structure

```
src/features/modules/edtech/progressReport/student-data/
├── config/
│   ├── columnMapping.ts          # Column definitions and class mappings
│   └── nameAliases.ts            # Name alias resolution (for shortened names)
├── data/
│   ├── _metadata.json            # Collection metadata
│   └── *.json                    # 75 individual student files
├── processors/
│   └── dataProcessor.ts          # Assessment processing logic
├── types/
│   └── StudentDataTypes.ts       # TypeScript type definitions
├── utils/
│   ├── excelReader.ts            # Excel file parsing
│   └── studentDataManager.ts     # Main orchestrator
└── README.md                     # This file
```

## 🚀 Quick Start

### Processing Excel Data

```bash
# Process raw_data.xlsx and update student files
npx tsx scripts/processStudentData.ts raw_data.xlsx

# Export all data to a master JSON file
npx tsx scripts/exportStudentData.ts master_student_data.json

# Merge duplicate students (if needed)
npx tsx scripts/mergeStudentDuplicates.ts
```

## 📊 Supported Assessment Types

### From `_S` Sheets (Summative Assessment Sheets)

| Column Type       | Columns         | Description                                                                                                                                           |
| ----------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Classwork**     | EXT1-5          | Exercise completion (e.g., "26B", "39A")                                                                                                              |
| **Participation** | LNT1-5          | Board solving points                                                                                                                                  |
| **Summative**     | SD1-3 (P/MYP/C) | Combined assessments with sub-scores:<br>• **P**: Percentage points earned<br>• **MYP**: MYP criteria points (0-8)<br>• **C**: Cambridge points (0-1) |
| **Homework**      | ND, ND K        | Homework completion + comment                                                                                                                         |
| **Consultations** | KONS1-5         | Consultation tracking                                                                                                                                 |
| **Social Hours**  | SOC             | Social hours in minutes                                                                                                                               |

### Summative Assessment Structure

SD assessments are stored as a single assessment with sub-scores:

```json
{
  "date": "2025-10-24",
  "column": "SD1",
  "type": "summative",
  "task_name": "Summative assessment 1",
  "score": "9",
  "summative_details": {
    "percentage_score": 9,
    "max_points": null,
    "myp_score": 8,
    "cambridge_score": 1
  }
}
```

## 🏫 Class Mappings

| Sheet Name | Class Display Name |
| ---------- | ------------------ |
| `Vyd_S`    | 8 Vydūnas          |
| `Grei_S`   | 8 A. J. Greimas    |
| `Gim_S`    | 8 M. A. Gimbutienė |
| `Vei_S`    | 8 I. Veisaitė      |

## 👤 Name Alias System

Handles students with shortened names in Excel (missing middle names).

**Example:**

- Excel: `Ažuolas Vainilka`
- Database: `Ažuolas Jonas Vainilka`
- **Result**: System correctly updates existing student instead of creating duplicate

**Configuration**: Edit `config/nameAliases.ts`

See [NAME_ALIAS_SYSTEM.md](/docs/NAME_ALIAS_SYSTEM.md) for complete documentation.

## 📝 Excel File Structure

**Required format:**

- **Row 1**: Dates for each assessment column
- **Row 2**: Column names (headers)
- **Row 3+**: Student data

**Required columns:**

- `Vardas` (First Name)
- `Pavardė` (Last Name)

## 🔄 Processing Logic

### Duplicate Detection

- Assessments are uniquely identified by **date + column name**
- If a duplicate is found, the existing assessment is **updated** instead of creating a new one
- This prevents duplicate entries when re-processing the same Excel file

### Name Resolution

- System checks for name aliases before finding/creating students
- Resolves shortened names to full names automatically
- Logs all name resolutions for transparency

### New Student Creation

- If a student is found in Excel but not in the data folder, a new student file is automatically created
- The student receives a minimal profile structure that can be filled in later

### Data Preservation

- Existing student data (profile, communication log, etc.) is preserved
- Only assessment data is updated/added based on the Excel file

## 🔧 API Usage

### StudentDataManager

```typescript
import { StudentDataManager } from "@progressReport/student-data/utils/studentDataManager";

const manager = new StudentDataManager();

// Process from file path
const result = await manager.processExcelFile("path/to/excel.xlsx");

// Process from buffer (for browser/API)
const result = await manager.processExcelBuffer(arrayBuffer);

// Export collection
await manager.exportCollection("output.json");
```

### ProcessingResult

```typescript
interface ProcessingResult {
  success: boolean;
  studentsProcessed: number;
  assessmentsAdded: number;
  errors: string[];
  warnings: string[];
}
```

## 🎯 Dashboard Integration

The system integrates with the Progress Report Dashboard at `/projects/edtech/progressReport`.

### Data Flow

1. User uploads `raw_data.xlsx` via dashboard
2. System processes Excel and updates individual student JSON files
3. User can export updated master collection JSON
4. Dashboard loads data from localStorage or uploaded JSON

### Backup Strategy

- **No automatic backups** in production (serverless environment)
- User should **export current data** before processing new data
- Exported files serve as backups
- Individual student JSON files act as the source of truth

## 📚 Type Definitions

See `types/StudentDataTypes.ts` for complete type definitions including:

- `StudentData` - Complete student record
- `Assessment` - Assessment with optional summative_details
- `ProcessingResult` - Processing operation result
- And more...

## ⚠️ Important Notes

1. **Character Encoding**: The system handles Lithuanian characters (ą, č, ė, etc.) in student names
2. **Date Format**: All dates are stored in `YYYY-MM-DD` format
3. **Score Types**: Scores are stored as strings to preserve formats like "26B", "9", "7C"
4. **Max Points**: The `max_points` field in summative_details is currently `null` - this is a placeholder for future use
5. **Name Aliases**: If you have shortened names in Excel, add them to `config/nameAliases.ts` to prevent duplicates

## 🧹 Maintenance

### Handling Duplicate Students

If duplicate students are created (80 instead of 75):

```bash
# 1. Run merge script to combine duplicates
npx tsx scripts/mergeStudentDuplicates.ts

# 2. Export clean data
npx tsx scripts/exportStudentData.ts master_student_data_clean.json

# 3. Add name aliases to prevent future duplicates
# Edit: src/features/modules/edtech/progressReport/student-data/config/nameAliases.ts
```

### Adding New Assessment Columns

Edit `config/columnMapping.ts`:

```typescript
export const SUMMATIVE_SHEET_COLUMNS: ColumnMapping = {
  NEW_COL: {
    type: "classwork",
    task_name: "New Assessment",
    description: "Description",
  },
};
```

## 🔜 Future Enhancements

- [ ] Web-based dashboard integration with file upload ✅
- [ ] API endpoint for processing ✅
- [ ] Real-time progress indicators during processing ✅
- [ ] Validation and error reporting in UI ✅
- [ ] Name alias management UI
- [ ] Automated fuzzy name matching
- [ ] Export individual student PDFs

## 📖 Related Documentation

- **Name Alias System**: `/docs/NAME_ALIAS_SYSTEM.md`
- **Main System Docs**: `/docs/STUDENT_DATA_PROCESSING.md`
- **Progress Report Dashboard**: `/docs/progress-report-dashboard/`
- **Logging system**: `/src/features/infrastructure/logging/`

---

**Current Status:**

- ✅ 75 students
- ✅ 5 name aliases configured
- ✅ CLI and dashboard integration complete
- ✅ Duplicate prevention active

**Last Updated:** October 24, 2025
