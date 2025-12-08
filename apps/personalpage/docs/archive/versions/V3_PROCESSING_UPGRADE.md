# Student Data Processing - V3 Upgrade

## Overview

The student data processing system has been upgraded to support v3 schema format. This document describes the updated processing logic and dashboard integration.

## Updated Components

### 1. Processing Logic

#### **DataProcessorV3** (`src/features/modules/edtech/progressReport/student-data/processors/dataProcessorV3.ts`)

- **Purpose**: Processes Excel assessment data and updates student records in v3 format
- **Key Features**:
  - Supports v3 schema with unique student IDs
  - Handles summative assessments with P/MYP/Cambridge sub-scores
  - Implements duplicate detection (same date + column)
  - Integrates name alias resolution
  - Creates new students with proper v3 structure

**New Assessment Types Supported**:

- `EXT1-5`: Classwork exercises
- `LNT1-5`: Participation/presentations
- `SD1-3`: Summative assessments with three score types:
  - **P** (Percentage): Points scored on percentage-based tests
  - **MYP**: Middle Years Programme assessment scores (1-8 scale)
  - **C** (Cambridge): Cambridge objective mastery (1 = knows, 0 = doesn't know)
- `ND`: Homework assignments
- `ND K`: Special homework comments
- `KONS1-5`: Consultation sessions
- `SOC`: Social hours

**SD Assessment Structure**:

```typescript
{
  date: "2024-10-15",
  column: "SD1",
  type: "summative",
  task_name: "Summative assessment 1",
  score: "85", // Primary score for display
  summative_details: {
    percentage_score: 85,
    max_points: undefined, // Placeholder for future
    myp_score: 6,
    cambridge_score: 1
  }
}
```

#### **StudentDataManagerV3** (`src/features/modules/edtech/progressReport/student-data/utils/studentDataManagerV3.ts`)

- **Purpose**: Orchestrates the entire data processing workflow
- **Key Features**:
  - Loads v3 student JSON files
  - Validates schema version (3.0)
  - Processes Excel files using ExcelReader
  - Saves updated student data
  - Exports master collection files
  - Generates unique student IDs for new students (format: `ST00001`)

**Processing Workflow**:

1. Load all existing v3 student files
2. Read Excel data from \_S sheets
3. For each student row:
   - Find student by name (with alias resolution)
   - Create new student if not found
   - Process assessments with duplicate detection
   - Update student metadata timestamps
4. Save all modified students
5. Return statistics (students updated, assessments added, new students)

### 2. CLI Scripts

#### **processStudentData.ts**

```bash
npx tsx scripts/processStudentData.ts raw_data.xlsx
```

- Processes Excel file and updates individual student JSON files
- Outputs detailed statistics
- Uses v3 manager and processor

#### **exportStudentData.ts**

```bash
npx tsx scripts/exportStudentData.ts master_student_data_v3.json
```

- Exports all student data to a single master JSON file
- Includes v3 metadata
- Sorts by class name and last name

### 3. API Endpoint

#### **POST /api/process-student-data**

- **Purpose**: Handles Excel file uploads from dashboard
- **Request**: Multipart form data with Excel file
- **Response**:

```typescript
{
  success: boolean;
  studentsUpdated: number;
  assessmentsAdded: number;
  newStudents: number;
  message: string;
}
```

- **Features**:
  - 10MB file size limit
  - Automatic temp file cleanup
  - Comprehensive error handling
  - Logging integration

### 4. Dashboard Integration

#### **ExcelFileUpload Component**

- **Location**: `src/features/modules/edtech/components/sections/progressReport/ExcelFileUpload.tsx`
- **Features**:
  - File selection with validation (.xlsx, .xls)
  - Upload progress indication
  - Detailed result display:
    - Students updated count
    - Assessments added count
    - New students count (if any)
  - Error handling and user feedback
  - Auto-reset after upload

**Updated UI Messages**:

- ✅ "Successfully processed: X students updated, Y assessments added, Z new students created"
- 👥 Students updated
- 📝 Assessments added
- ✨ New students (only shown if > 0)

#### **DataManagementSection**

- **Location**: `src/features/modules/edtech/components/sections/progressReport/DataManagementSection.tsx`
- **Features**:
  - Excel processing section with instructions
  - Current data status display
  - JSON upload/download/clear actions
  - Workflow guidance for users

## Key Improvements

### 1. **Schema Version Validation**

All v3 files are validated to ensure they have `metadata.schema_version: "3.0"`

### 2. **Unique Student IDs**

New students are assigned sequential IDs:

- Format: `ST00001`, `ST00002`, etc.
- Automatically incremented from highest existing ID

### 3. **Enhanced Academic Tracking**

New students include:

```typescript
academic: {
  year: "2024-2025",
  grade: 8,
  class_id: "8-vydnas",
  enrolled_date: "2024-09-01"
}
```

### 4. **Structured Profile Attributes**

```typescript
profile: {
  learning_attributes: {
    writing_quality: "developing",
    notebook_organization: "developing",
    reflective_practice: "developing",
    math_communication: "developing",
    seeks_tutoring: false
  },
  notes: {
    strengths: [],
    challenges: [],
    interests: []
  }
}
```

### 5. **Computed Metrics Placeholder**

```typescript
computed_metrics: {
  // Future: average scores, completion rates, etc.
}
```

### 6. **Normalized Cambridge Objectives**

Individual student files no longer contain duplicate Cambridge objective definitions. They reference a centralized `_cambridge_objectives.json` file.

## Migration Path

### From V2 to V3

1. **Run migration script**:

```bash
npx tsx scripts/migrateToV3.ts
```

2. **Verify migration**:

- Check student count remains consistent
- Verify all assessments preserved
- Confirm metadata fields added

3. **Export master file**:

```bash
npx tsx scripts/exportStudentData.ts master_student_data_v3.json
```

### Processing New Data

1. **Upload Excel file** via dashboard or CLI
2. **Review results**: Check students updated and assessments added
3. **Export updated collection** for backup and dashboard viewing
4. **Re-upload JSON** to dashboard to see new data

## Testing Results

**Initial V3 Test (October 24, 2025)**:

- ✅ 72 students updated
- ✅ 34 new assessments added
- ✅ 5 new students created
- ✅ All data preserved from v2 migration
- ✅ Name alias system working correctly
- ✅ No duplicate assessments created

## File Structure

```
src/features/modules/edtech/progressReport/student-data/
├── config/
│   ├── columnMapping.ts      # Excel column definitions
│   └── nameAliases.ts         # Name resolution system
├── data/
│   ├── _cambridge_objectives.json  # Centralized objectives
│   └── *.json                 # Individual student files (v3)
├── processors/
│   └── dataProcessorV3.ts     # V3 assessment processor
├── types/
│   └── StudentDataTypesV3.ts  # V3 type definitions
└── utils/
    ├── excelReader.ts         # Excel file parser
    └── studentDataManagerV3.ts # V3 workflow orchestrator

scripts/
├── processStudentData.ts      # CLI processing script
├── exportStudentData.ts       # CLI export script
└── migrateToV3.ts            # V2 to V3 migration

src/pages/api/
└── process-student-data.ts    # API endpoint for uploads

src/features/modules/edtech/components/sections/progressReport/
├── ExcelFileUpload.tsx        # Upload component
└── DataManagementSection.tsx  # Dashboard section
```

## Future Enhancements

### Planned Features

1. **Computed Metrics**:
   - Average scores by assessment type
   - Completion rates
   - Trend analysis
   - Attendance patterns

2. **Max Points Tracking**:
   - Add UI for entering max points for SD assessments
   - Calculate percentage scores automatically
   - Track score distributions

3. **Advanced Reporting**:
   - Per-student progress reports
   - Class-wide analytics
   - Assessment difficulty analysis
   - Learning objective mastery tracking

4. **Data Validation**:
   - Score range validation
   - Date consistency checks
   - Missing data detection
   - Duplicate warning system

5. **Backup System**:
   - Automated backup creation
   - Version history tracking
   - Rollback capability
   - Cloud storage integration

## Notes

- All v2 files are preserved in backups
- The system supports both v2 (legacy) and v3 (current) formats
- Name aliases prevent duplicate student creation
- Excel processing is idempotent (can be run multiple times safely)
- Duplicate detection ensures no data duplication

## Support

For issues or questions about the v3 processing system, refer to:

- `docs/V3_MIGRATION_COMPLETE.md` - Migration details
- `docs/JSON_STRUCTURE_ANALYSIS.md` - Structure improvements
- `docs/LOGGING.md` - Logging system documentation
