# Excel Column Preview & Selection Feature

Preview and select specific columns before importing Excel data into the student database.

## 🎯 Feature Overview

When uploading Excel files through the dashboard, you can now:
1. **Preview** all available columns from your Excel file
2. **Select/Deselect** which columns to import
3. **Filter by type** (classwork, homework, summative, etc.)
4. **Confirm** and import only the selected columns

## 📊 Dashboard Workflow

### Step 1: Upload Excel File
- Navigate to `/projects/edtech/progressReport`
- Go to **Data Management** tab
- Click **"Select & Preview Excel File"**
- Choose your Excel file (e.g., `stud_data3.xlsx`)

### Step 2: Preview & Select Columns
After upload, you'll see:
- **Sheet information** (class name, student count)
- **All available columns** organized by sheet
- **Column details**:
  - Column name (e.g., `EXT1`, `SD1 P`)
  - Type badge (classwork, homework, summative, etc.)
  - Task name
  - Date (if available)
  - Sample values
  - Data availability indicator

### Step 3: Select Columns
Use the interactive controls:
- **Select/Deselect All** - Toggle all columns at once
- **Quick filters by type** - Select/deselect all columns of a specific type
- **Individual checkboxes** - Fine-tune your selection
- Columns with no data are highlighted

### Step 4: Confirm Import
- Click **"Import Selected Columns (X)"** button
- Only selected columns will be processed
- Results show students updated and assessments added

## 🖥️ Command Line Workflow

The CLI script also supports column filtering:

### Import All Columns (default)
```bash
npx tsx scripts/processStudentData.ts stud_data3.xlsx
```

### Import Specific Columns
```bash
npx tsx scripts/processStudentData.ts stud_data3.xlsx EXT1 EXT2 "SD1 P" "SD1 MYP"
```

**Note:** Use quotes for column names with spaces (e.g., `"SD1 P"`).

## 🎨 UI Features

### Visual Indicators
- **Blue highlight** - Selected columns
- **Gray/faded** - Deselected columns
- **Yellow badge** - Columns with no data
- **Type badges** - Color-coded by assessment type

### Quick Actions
- **Toggle All** - Select/deselect everything
- **Type filters** - Quick select by assessment type
- **Reset** - Start over with new file

## 🔧 Technical Details

### API Endpoints

#### Preview Endpoint
**POST** `/api/preview-student-data`
- Reads Excel file
- Returns column metadata
- Does NOT save any data

#### Process Endpoint (Updated)
**POST** `/api/process-student-data`
- Accepts `selectedColumns` parameter (JSON array)
- Filters columns during processing
- Updates student data files

### Data Flow
```
Excel File Upload
    ↓
Preview API (read-only)
    ↓
Column Selection UI
    ↓
User selects columns
    ↓
Process API (with selectedColumns)
    ↓
Filtered processing
    ↓
Update student data
```

## 📋 Supported Column Types

| Type | Color | Examples |
|------|-------|----------|
| **Classwork** | Blue | EXT1-5 |
| **Participation** | Purple | LNT1-5 |
| **Summative** | Red | SD1 P, SD2 MYP, SD3 C |
| **Homework** | Green | ND, ND K |
| **Consultation** | Yellow | KONS1-5 |
| **Social Hours** | Pink | SOC |
| **Comment** | Gray | ND K |

## 💡 Use Cases

### Scenario 1: Partial Updates
You have new data only for `EXT1` and `EXT2`:
- Upload Excel
- Deselect all other columns
- Import only classwork columns
- Faster processing, targeted updates

### Scenario 2: Excluding Empty Columns
Your Excel has columns with no data:
- Preview shows "No data" badges
- Deselect empty columns
- Avoid unnecessary processing

### Scenario 3: Testing
You want to test with a subset of data:
- Select only a few columns
- Import and verify
- Re-upload and select more columns if needed

## 🚀 Benefits

1. **Selective Import** - Import only what you need
2. **Visual Verification** - See what data exists before importing
3. **Avoid Duplicates** - Skip columns you've already imported
4. **Faster Processing** - Less data to process
5. **Better Control** - Fine-grained control over imports

## 📝 Notes

- All columns are **selected by default**
- System prevents duplicates using `date + column` as unique key
- You can safely re-import the same columns (updates existing data)
- Comment columns (like `ND K`) require their parent column (like `ND`) to be selected
- SD sub-scores are grouped (selecting `SD1 P` enables the SD1 assessment)

## 🔜 Future Enhancements

- [ ] Save column selection presets
- [ ] Preview data statistics (min/max/avg)
- [ ] Compare with existing database
- [ ] Bulk column actions
- [ ] Search/filter columns

---

**Last Updated:** November 3, 2025  
**Status:** ✅ Production Ready






