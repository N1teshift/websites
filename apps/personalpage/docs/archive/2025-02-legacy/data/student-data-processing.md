# Student Data Processing System

Complete documentation for the student assessment data processing system integrated into the personal page project.

## 🎉 System Overview

A TypeScript-based system for importing and processing student assessment data from Excel files, integrated with the Progress Report Dashboard for viewing and analysis.

## 📁 Project Structure

```
src/features/modules/edtech/progressReport/student-data/
├── config/
│   └── columnMapping.ts          # Assessment column definitions
├── data/
│   ├── _metadata.json            # Collection metadata
│   └── *.json                    # 80 individual student files
├── processors/
│   └── dataProcessor.ts          # Assessment processing with duplicate detection
├── types/
│   └── StudentDataTypes.ts       # TypeScript interfaces
├── utils/
│   ├── excelReader.ts            # Excel parsing (Row 1: dates, Row 2: headers)
│   └── studentDataManager.ts     # Main orchestrator
└── README.md

scripts/
├── processStudentData.ts         # CLI: Process Excel files
└── exportStudentData.ts          # CLI: Export master JSON

src/pages/api/
└── process-student-data.ts       # API endpoint for dashboard

src/features/modules/edtech/components/sections/progressReport/
├── DataManagementSection.tsx     # Enhanced with Excel upload
└── ExcelFileUpload.tsx           # Excel file upload component
```

## 🚀 Usage Methods

### Method 1: Command Line (Development)

```bash
# Process Excel file
npx tsx scripts/processStudentData.ts raw_data.xlsx

# Export collection
npx tsx scripts/exportStudentData.ts master_student_data.json
```

**Results:**

- ✅ 75 students processed
- ✅ 587 assessments added
- ✅ 5 new students created
- ✅ Individual student JSON files updated

### Method 2: Dashboard (Production)

1. Navigate to `/projects/edtech/progressReport`
2. Click **Data Management** tab
3. Upload `raw_data.xlsx` in the **Process New Assessment Data** section
4. Wait for processing (shows progress and results)
5. Click **Download Data** to export updated collection
6. Re-upload the exported JSON to view changes in dashboard

## 📊 Supported Assessment Types

### From `_S` Sheets (Vyd_S, Grei_S, Gim_S, Vei_S)

| Type              | Columns  | Description                                                                                                                           |
| ----------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Classwork**     | EXT1-5   | Exercise completion ("26B", "39A")                                                                                                    |
| **Participation** | LNT1-5   | Board solving points                                                                                                                  |
| **Summative**     | SD1-3    | **Combined assessment with 3 sub-scores:**<br>• **P**: Percentage points<br>• **MYP**: MYP criteria (0-8)<br>• **C**: Cambridge (0-1) |
| **Homework**      | ND, ND K | Completion + comment                                                                                                                  |
| **Consultations** | KONS1-5  | Attendance tracking                                                                                                                   |
| **Social Hours**  | SOC      | Minutes collected                                                                                                                     |

### SD Assessment Structure

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

## 🔄 Processing Logic

### 1. Duplicate Detection

- Unique key: `date + column`
- If found: **Update** existing assessment
- If new: **Add** to assessments array
- Prevents duplicates when re-processing

### 2. Data Flow

```
Excel File (raw_data.xlsx)
    ↓
ExcelReader.ts (parse sheets, extract dates)
    ↓
DataProcessor.ts (process rows, detect duplicates)
    ↓
StudentDataManager.ts (load, update, save)
    ↓
Individual JSON files updated
    ↓
Export to master collection JSON
    ↓
Dashboard (upload JSON to view)
```

### 3. Sheet Processing

**Excel Structure:**

- **Row 1**: Dates for each column
- **Row 2**: Column names (headers)
- **Row 3+**: Student data

**Sheets Processed:**

- `Vyd_S` → 8 Vydūnas (19 students)
- `Grei_S` → 8 A. J. Greimas (19 students)
- `Gim_S` → 8 M. A. Gimbutienė (18 students)
- `Vei_S` → 8 I. Veisaitė (19 students)

## 🛡️ Backup Strategy

Since the dashboard runs serverless (Vercel), traditional file backups aren't feasible. Instead:

### Current Strategy

1. **Export before processing**: Download current data as backup
2. **Individual files as source of truth**: `src/features/modules/edtech/progressReport/student-data/data/*.json`
3. **Version control**: Commit to git before major updates
4. **Master file exports**: Timestamped backups

### Workflow

```
1. Export current data → master_student_data_backup.json
2. Process new Excel → Updates individual files
3. Export updated data → master_student_data_updated.json
4. Compare if needed
5. Upload updated JSON to dashboard
```

## 🎯 Dashboard Integration

### Data Management Section Features

**Excel Processing:**

- Upload Excel file
- Real-time processing status
- Detailed results (students processed, assessments added)
- Error/warning display

**JSON Management:**

- Upload existing collection
- Export current data
- Clear data
- View statistics

**User Experience:**

- Progress indicators
- Success/error messages
- Auto-dismiss notifications
- Helpful tooltips and guides

## 📚 API Reference

### POST `/api/process-student-data`

**Request:**

```typescript
FormData {
  file: File // Excel file (.xlsx or .xls)
}
```

**Response:**

```typescript
{
  success: boolean;
  studentsProcessed?: number;
  assessmentsAdded?: number;
  errors?: string[];
  warnings?: string[];
  message?: string;
}
```

**Example Success:**

```json
{
  "success": true,
  "studentsProcessed": 75,
  "assessmentsAdded": 587,
  "message": "Successfully processed 75 students and added 587 assessments"
}
```

## ⚙️ Configuration

### Adding New Assessment Columns

Edit `src/features/modules/edtech/progressReport/student-data/config/columnMapping.ts`:

```typescript
export const SUMMATIVE_SHEET_COLUMNS: ColumnMapping = {
  NEW_COLUMN: {
    type: "classwork", // or homework, participation, etc.
    task_name: "New Assessment",
    description: "Description",
  },
};
```

### Adding New Classes

```typescript
export const CLASS_SHEET_MAPPING = {
  NewSheet_S: "New Class Name",
};
```

## 🔍 Troubleshooting

### Problem: Excel processing fails

**Solutions:**

- Check sheet names (must be Vyd_S, Grei_S, Gim_S, Vei_S)
- Verify Row 1 has dates, Row 2 has column names
- Ensure Vardas and Pavardė columns exist
- Check file format (.xlsx or .xls)

### Problem: Dashboard doesn't show new assessments

**Solution:**

- Process Excel → Export JSON → Re-upload JSON to dashboard
- Dashboard only shows loaded JSON data, not live files

### Problem: Duplicate assessments

**Solution:**

- System prevents duplicates by date+column
- Re-processing same file updates existing assessments
- Safe to run multiple times

## 📈 Performance

**Current Stats:**

- 80 student files
- ~8 assessments per student average
- Processing time: ~2-3 seconds for full dataset
- File sizes: 13-15KB per student file

## 🔜 Future Enhancements

- [ ] Real-time dashboard updates (WebSocket)
- [ ] Batch processing progress bar
- [ ] Export individual student PDFs
- [ ] Automated backup to cloud storage
- [ ] Data validation rules engine
- [ ] Assessment type customization UI

## 🎓 Testing Results

**Test File:** `raw_data.xlsx`  
**Date:** October 24, 2025

**Results:**

```
✅ 75 students processed
✅ 587 new assessments added
✅ 5 new students created
✅ All SD assessments with sub-scores working
✅ EXT1-5, LNT1-5, KONS1-5 columns processed
✅ Duplicate detection operational
✅ Date extraction from Row 1 working
✅ Comments linked to parent columns
```

**Sample Output:**

```json
{
  "column": "SD1",
  "summative_details": {
    "percentage_score": 9,
    "myp_score": 8,
    "cambridge_score": 1
  }
}
```

## 📞 Support

For issues or questions:

- Check `/src/features/modules/edtech/progressReport/student-data/README.md`
- Review logs in browser console
- Check individual student JSON files
- Verify Excel file structure with a sample

## 📝 Notes

- All dates stored as `YYYY-MM-DD`
- Scores stored as strings to preserve formats ("26B", "7C")
- Lithuanian characters supported
- `max_points` field is placeholder for future use
- Dashboard uses localStorage for data persistence

---

**Last Updated:** October 24, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
