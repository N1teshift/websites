# Progress Report Dashboard - Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [User Guide](#user-guide)
5. [Technical Implementation](#technical-implementation)
6. [Data Structure](#data-structure)
7. [Component Reference](#component-reference)

---

## Overview

The **Progress Report Dashboard** is a comprehensive student data visualization and analysis tool built for educational settings. It allows teachers to upload student assessment data via JSON files and view it through multiple perspectives: individual student view, class-level analysis, and aggregated metrics.

### Key Capabilities
- 📊 **Multi-perspective data viewing**: Individual students, class groups, and aggregate views
- 📈 **Smart timeline visualization**: Dual-mode timeline that adapts based on filter selection
- 🎯 **Individual assessment tracking**: View specific test scores and homework completion
- 📉 **Class performance analysis**: Distribution charts for different assessment types
- 💾 **Local data persistence**: Browser localStorage for data retention
- 🌍 **Multi-language support**: English, Lithuanian, and Russian translations

---

## Features

### Phase 1: Foundation & Data Management ✅

#### Data Management
- **JSON File Upload**: Drag-and-drop or click-to-upload interface
- **localStorage Persistence**: Automatic saving of uploaded data
- **Data Validation**: Basic validation of JSON structure
- **Export Functionality**: Download current data as JSON
- **Clear Data**: Remove all stored data

#### Page Structure
- Navigation tabs for different views
- Responsive layout
- Translation support (EN/LT/RU)
- Guide section with instructions

---

### Phase 2: Student & Class Views ✅

#### Student View
**Student Selection:**
- Search students by name
- Filter by class
- Visual selection with highlighting

**Data Display:**
- Student profile information
- Assessment records table
- Material completion tracking
- Cambridge test history
- Consultation log
- Attendance records

**Advanced Features:**
- Date range filtering
- Assessment type filtering (multi-select)
- Sortable tables (by date, score)
- Collapsible sections

#### Class View
**Class Selection:**
- Dropdown to select specific class
- "All Classes" option to view combined data
- Student search within class

**Metrics Display:**
- Total student count
- Dynamic assessment metric (changes based on chart selection)

**Student Table:**
- Individual assessment columns (KD1, KD, ND1, ND2, ND4)
- Total assessments count
- Sortable columns
- Column customization (show/hide)
- Clickable rows to jump to student detail

**Distribution Charts:**
- Dropdown to select assessment type
- 5 chart options: KD1, KD, ND1, ND2, ND4
- KD/ND4: 10-bar histograms (scores 1-10)
- ND1/ND2: Binary completion (0% / 100%)

---

### Phase 3: UI Polish & Refinements ✅

#### Activity Timeline (Student View)
**Dual-Mode System:**

**1. Activity Mode (GitHub Pulse Style)**
- Triggered when: No filters OR 2+ types selected
- Display: Line chart with points showing activity count
- Data sources: Assessments, Consultations, Cambridge Tests
- Y-axis: Number of activities
- Visual: Blue line with prominent dots

**2. Score Mode**
- Triggered when: Exactly 1 assessment type selected
- Display: Line chart showing score progression
- Y-axis: Score values (0-10 scale)
- Visual: Type-specific color with line and dots

**Enhanced Tooltips:**
- **Activity Mode**: Shows all activities on that date with details
- **Score Mode**: Shows assessment details, score, and comments

#### Styling Improvements
- Fixed gray text/background issues in all dropdowns
- Fixed search input text visibility
- Consistent white backgrounds with black text
- Proper focus states on all form controls
- Medium font weight for better readability

#### Dynamic Class Stats
- Stats card updates based on chart selection
- Synchronized with distribution chart
- Shows relevant metric (average score or completion rate)
- Contextual descriptions

---

## Architecture

### File Structure

```
src/features/modules/edtech/
├── components/
│   ├── progressReport/
│   │   ├── ActivityTimelineChart.tsx          # Smart dual-mode timeline
│   │   ├── ClassPerformanceChartEnhanced.tsx  # Class distribution charts
│   │   ├── CollapsibleSection.tsx             # Reusable collapsible UI
│   │   ├── ColumnCustomizer.tsx               # Table column visibility control
│   │   ├── DateRangeFilter.tsx                # Date filtering component
│   │   └── MultiSelectFilter.tsx              # Multi-select filter UI
│   └── sections/
│       └── progressReport/
│           ├── GuideSection.tsx               # Instructions and overview
│           ├── DataManagementSection.tsx      # Import/export/clear
│           ├── StudentViewSectionEnhanced.tsx # Individual student view
│           └── ClassViewSectionRefined.tsx    # Class-level view
├── hooks/
│   └── useProgressReportData.ts               # State management hook
├── types/
│   └── ProgressReportTypes.ts                 # TypeScript interfaces
├── utils/
│   ├── progressReportUtils.ts                 # General utilities
│   ├── assessmentMetrics.ts                   # KD/ND calculations (legacy)
│   └── assessmentColumnUtils.ts               # Individual assessment utilities
├── ProgressReportPage.tsx                     # Main orchestrator component
└── pages/projects/edtech/
    └── progressReport.tsx                     # Next.js page wrapper

src/features/infrastructure/shared/components/ui/
└── JSONFileUpload.tsx                         # Reusable file upload component

locales/
├── en/progress-report.json                    # English translations
├── lt/progress-report.json                    # Lithuanian translations
└── ru/progress-report.json                    # Russian translations

scripts/
└── analyzeStudentData.js                      # Data analysis utility
```

### Technology Stack

- **Framework**: Next.js (React)
- **Language**: TypeScript
- **Charts**: Recharts
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (useState, useMemo, useCallback)
- **Storage**: Browser localStorage
- **i18n**: Custom translation system

---

## User Guide

### Getting Started

1. **Navigate to the Dashboard**
   - Go to `/projects/edtech/progressReport`

2. **Upload Student Data**
   - Click "Data Management" tab
   - Drag and drop JSON file or click to browse
   - Data is automatically saved to localStorage

3. **View Students**
   - Click "Student View" tab
   - Search or select a student
   - Explore different data sections

4. **Analyze Classes**
   - Click "Class View" tab
   - Select a class or "All Classes"
   - Use chart dropdown to analyze different assessments

### Class View Usage

#### Viewing Class Performance

1. **Select Class**: Choose from dropdown or select "All Classes"
2. **View Metrics**: See student count and selected assessment metric
3. **Analyze Distribution**: 
   - Use chart dropdown to select assessment type
   - View histogram of score distribution
   - Metric card updates automatically

#### Understanding the Table

**Columns:**
- **KD1**: Unit 1 Test scores (1-10)
- **KD**: Unit 2 Test (Cambridge) scores (1-10)
- **ND1**: Latest homework completion (0% or 100%)
- **ND2**: Homework completion (0% or 100%)
- **ND4**: Homework scores (1-10)
- **Total Assessments**: Count of all recorded assessments

**Actions:**
- Click column headers to sort
- Click student row to jump to their detailed view
- Use column customizer (⚙️) to show/hide columns
- Search within class using search field

#### Chart Options

| Assessment | Display | Y-Axis | Description |
|------------|---------|--------|-------------|
| KD1 | 10 bars (1-10) | Student count | Unit 1 test distribution |
| KD | 10 bars (1-10) | Student count | Unit 2 test distribution |
| ND1 | 2 bars (0%, 100%) | Student count | Latest homework completion |
| ND2 | 2 bars (0%, 100%) | Student count | Homework completion |
| ND4 | 10 bars (1-10) | Student count | Homework score distribution |

### Student View Usage

#### Selecting a Student

1. **Search**: Type name in search field (text is black, clearly visible)
2. **Filter by Class**: Select class from dropdown
3. **Click Student**: Select from filtered list

#### Understanding the Timeline

**Activity Mode** (No filters or multiple types):
- Shows all activities as line chart with points
- Each point represents activities on that date
- Hover to see detailed list of activities
- Includes: assessments, consultations, Cambridge tests

**Score Mode** (Single type selected):
- Shows score progression as line chart
- Y-axis shows score values
- Hover to see full assessment details
- Color-coded by assessment type

#### Using Filters

1. **Date Range**: Select start/end dates to focus on specific period
2. **Assessment Type**: 
   - Click multi-select to choose types
   - No selection = Activity Mode (all data)
   - 1 selection = Score Mode (score timeline)
   - 2+ selections = Activity Mode (combined)

#### Assessment Record Table

- **Sort**: Use dropdown to sort by date or score (ascending/descending)
- **View Details**: See task name, type, score, and comments
- **Filter**: Applies date range and type filters

---

## Technical Implementation

### Data Flow

```
JSON File Upload
    ↓
Validation & Parsing
    ↓
localStorage (PROGRESS_REPORT_DATA_v1)
    ↓
useProgressReportData Hook
    ↓
ProgressReportPage (Main Component)
    ↓
├─ DataManagementSection
├─ StudentViewSectionEnhanced
└─ ClassViewSectionRefined
```

### State Management

**Primary Hook: `useProgressReportData`**

```typescript
const {
    data,                    // Full dataset
    isLoading,              // Loading state
    error,                  // Error state
    loadData,               // Manual load from localStorage
    clearData,              // Clear all data
    exportToJSON,           // Export as JSON
    getUniqueClasses,       // Get list of classes
    getStudentsByClass,     // Filter students by class
    getStudentByName,       // Find specific student
    searchStudents,         // Search by name
    validateData            // Validate data structure
} = useProgressReportData();
```

### Key Algorithms

#### 1. Assessment Score Retrieval
```typescript
// Get latest score for specific assessment column
const getAssessmentScore = (student: StudentData, columnName: string): string | null => {
    const assessments = student.assessments.filter(a => 
        a.column?.toUpperCase() === columnName.toUpperCase()
    );
    
    if (assessments.length === 0) return null;
    
    assessments.sort((a, b) => b.date.localeCompare(a.date));
    return assessments[0].score;
};
```

#### 2. Timeline Mode Detection
```typescript
// Determine if timeline should be in activity or score mode
const isActivityMode = selectedTypes.length === 0 || selectedTypes.length > 1;

// Activity Mode: Show all activities (consultations, tests, assessments)
// Score Mode: Show only scores for selected type
```

#### 3. Dynamic Class Statistics
```typescript
// Calculate stats based on chart selection
const calculateStat = (mode: ChartMode) => {
    const columnName = mode.toUpperCase();
    
    if (mode === 'kd1' || mode === 'kd' || mode === 'nd4') {
        // Average score (0-10 scale)
        const scores = students
            .map(s => parseFloat(getAssessmentScore(s, columnName) || '0'))
            .filter(score => score > 0);
        
        return scores.length > 0
            ? Math.round((scores.reduce((sum, s) => sum + s, 0) / scores.length) * 10) / 10
            : 0;
    } else {
        // Completion rate (0 or 1 → percentage)
        const scores = students
            .map(s => parseFloat(getAssessmentScore(s, columnName) || '0'))
            .filter(score => !isNaN(score));
        
        const completed = scores.filter(s => s === 1).length;
        return scores.length > 0
            ? Math.round((completed / scores.length) * 100 * 10) / 10
            : 0;
    }
};
```

### Chart Configuration

#### Class Distribution Chart
- **Library**: Recharts BarChart / LineChart
- **Color Coding**: 
  - Red (1-2): Needs improvement
  - Orange (3-4): Below average
  - Yellow (5-6): Average
  - Green (7-8): Good
  - Dark Green (9-10): Excellent

#### Activity Timeline Chart
- **Library**: Recharts LineChart
- **Activity Mode**: Blue line (#3B82F6)
- **Score Mode**: Type-specific colors
- **Dot Size**: 6px (normal), 8px (hover)
- **White border**: For better visibility

---

## Data Structure

### Student Record

```typescript
interface StudentData {
    first_name: string;
    last_name: string;
    class_name: string;
    assessments: Assessment[];
    consultation_log: ConsultationRecord[];
    cambridge_tests: CambridgeTest[];
    material_completion: MaterialCompletion;
    attendance_records: AttendanceRecord[];
    profile: StudentProfile;
    // ... other fields
}
```

### Assessment Record

```typescript
interface Assessment {
    date: string;           // ISO date format
    column: string;         // Assessment column (KD, KD1, ND1, etc.)
    type: string;          // homework, classwork, summative, etc.
    task_name: string;     // Description of task
    score: string;         // Score value (can be numeric or '?', 'n')
    comment: string;       // Teacher comments
    added: string;         // Date added
    updated?: string;      // Last update date
}
```

### Assessment Types

| Type | Description | Scoring |
|------|-------------|---------|
| `homework` | Regular homework assignments | 0-1 or 0-10 |
| `classwork` | In-class work | Varies |
| `summative` | Unit tests (KD, KD1) | 0-10 |
| `diagnostic` | Diagnostic assessments | Varies |
| `weekly_assessment` | Weekly check-ins | Varies |
| `consultation` | 1-on-1 meetings | N/A |

### Assessment Columns

| Column | Type | Scale | Description |
|--------|------|-------|-------------|
| KD1 | Summative | 0-10 | Unit 1 Test (2025-09-16) |
| KD | Summative | 0-10 | Unit 2 Test / Cambridge (2025-10-09/10) |
| ND1 | Homework | 0-1 | Binary completion (multiple dates) |
| ND2 | Homework | 0-1 | Binary completion (2025-09-12) |
| ND4 | Homework | 0-10 | Scored homework (2025-09-26) |

---

## Component Reference

### Core Components

#### `ProgressReportPage`
**Path**: `src/features/modules/edtech/ProgressReportPage.tsx`

Main orchestrator component that manages:
- Active section state
- Data loading via `useProgressReportData`
- Section rendering (Guide, Data Management, Student View, Class View)
- Navigation between sections

**Key Props**: None (top-level component)

---

#### `ClassViewSectionRefined`
**Path**: `src/features/modules/edtech/components/sections/progressReport/ClassViewSectionRefined.tsx`

Displays class-level analytics.

**Props**:
```typescript
{
    students: StudentData[];
    classes: string[];
    onSelectStudent: (student: StudentData) => void;
    onSwitchToStudentView: () => void;
}
```

**Features**:
- Class selection dropdown (including "All Classes")
- Student search within class
- Dynamic stats cards
- Distribution chart with mode selector
- Student table with individual assessments
- Column customization
- Sortable columns

---

#### `StudentViewSectionEnhanced`
**Path**: `src/features/modules/edtech/components/sections/progressReport/StudentViewSectionEnhanced.tsx`

Displays individual student data.

**Props**:
```typescript
{
    students: StudentData[];
    selectedStudent: StudentData | null;
    onSelectStudent: (student: StudentData) => void;
}
```

**Features**:
- Student search and selection
- Profile information display
- Activity timeline chart (dual-mode)
- Date range filtering
- Assessment type filtering
- Assessment records table
- Material completion tracking
- Cambridge test history
- Consultation log

---

#### `ActivityTimelineChart`
**Path**: `src/features/modules/edtech/components/progressReport/ActivityTimelineChart.tsx`

Smart timeline that adapts based on filter selection.

**Props**:
```typescript
{
    student: StudentData;
    selectedTypes: string[];
    dateRange?: { startDate: string | null; endDate: string | null };
    height?: number;
}
```

**Modes**:
- **Activity Mode**: Line chart showing activity count (no filters or 2+ types)
- **Score Mode**: Line chart showing score values (1 type selected)

**Data Sources**:
- Assessments (all types)
- Consultation attendance
- Cambridge tests

---

#### `ClassPerformanceChartEnhanced`
**Path**: `src/features/modules/edtech/components/progressReport/ClassPerformanceChartEnhanced.tsx`

Distribution chart for class performance analysis.

**Props**:
```typescript
{
    students: StudentData[];
    height?: number;
    onModeChange?: (mode: ChartMode) => void;
}
```

**Chart Types**:
- KD1, KD, ND4: 10-bar histograms (scores 1-10)
- ND1, ND2: 2-bar charts (0% / 100% completion)

---

### Utility Components

#### `JSONFileUpload`
**Path**: `src/features/infrastructure/shared/components/ui/JSONFileUpload.tsx`

Reusable JSON file upload component with drag-and-drop.

**Props**:
```typescript
{
    onUpload: (data: any) => void;
    onError: (error: string) => void;
    accept?: string;
    maxSize?: number;
}
```

---

#### `CollapsibleSection`
Wrapper component for collapsible content sections.

**Props**:
```typescript
{
    title: string;
    icon?: string;
    defaultOpen?: boolean;
    badge?: number;
    children: React.ReactNode;
}
```

---

#### `ColumnCustomizer`
UI component for showing/hiding table columns.

**Props**:
```typescript
{
    columns: ColumnConfig[];
    onChange: (columns: ColumnConfig[]) => void;
}
```

---

#### `MultiSelectFilter`
Multi-select dropdown for filtering by type.

**Props**:
```typescript
{
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    label: string;
}
```

---

#### `DateRangeFilter`
Date range selector component.

**Props**:
```typescript
{
    onRangeChange: (range: DateRange) => void;
    currentRange: DateRange;
}
```

---

### Utility Functions

#### `assessmentColumnUtils.ts`

```typescript
// Get latest score for specific assessment column
getAssessmentScore(student: StudentData, columnName: string): string | null

// Get all assessments for a column across students
getAssessmentsByColumn(students: StudentData[], columnName: string): Assessment[]

// Format score for display (handles '?', 'n', etc.)
formatAssessmentScore(score: string | null): string

// Format 0/1 scores as percentages
formatHomeworkCompletion(score: string | null): string

// Get unique assessment columns from students
getUniqueAssessmentColumns(students: StudentData[]): string[]
```

#### `progressReportUtils.ts`

```typescript
// Get full student name
getStudentFullName(student: StudentData): string

// Format date for display
formatDate(date: string): string

// Format number as percentage
formatPercentage(value: number): string

// Get unique assessment types
getAssessmentTypes(assessments: Assessment[]): string[]

// Filter assessments by types
filterAssessmentsByTypes(assessments: Assessment[], types: string[]): Assessment[]

// Filter assessments by date range
filterAssessmentsByDateRange(
    assessments: Assessment[], 
    startDate: string | null, 
    endDate: string | null
): Assessment[]

// Sort assessments
sortAssessments(
    assessments: Assessment[], 
    sortBy: 'date_desc' | 'date_asc' | 'score_desc' | 'score_asc'
): Assessment[]
```

---

## Styling Guidelines

### Color Palette

**Assessment Type Colors:**
```typescript
homework: '#3B82F6',        // Blue
classwork: '#10B981',       // Green
summative: '#F59E0B',       // Orange
diagnostic: '#8B5CF6',      // Purple
participation: '#06B6D4',   // Cyan
consultation: '#EC4899',    // Pink
cambridge_test: '#14B8A6',  // Teal
weekly_assessment: '#6366F1' // Indigo
```

**Performance Colors:**
```typescript
Red (1-2): '#EF4444'         // Needs improvement
Orange (3-4): '#F59E0B'      // Below average
Yellow (5-6): '#FCD34D'      // Average
Green (7-8): '#10B981'       // Good
Dark Green (9-10): '#059669' // Excellent
```

### Form Controls

All form inputs (search, select, dropdowns) use:
```css
bg-white           /* White background */
text-gray-900      /* Black text */
font-medium        /* Medium weight for selects */
border-gray-300    /* Gray border */
focus:ring-blue-500 /* Blue focus ring */
```

---

## Performance Considerations

### Optimization Strategies

1. **useMemo for Expensive Calculations**
   - Filtered student lists
   - Chart data transformations
   - Statistics calculations

2. **useCallback for Event Handlers**
   - Sort handlers
   - Filter change handlers
   - Student selection handlers

3. **localStorage Caching**
   - Automatic save on data change
   - Load on mount
   - No network calls required

4. **Lazy Component Loading**
   - Collapsible sections default closed
   - Chart rendering only when visible
   - Table virtualization for large datasets (future)

### Data Size Limits

- **localStorage**: ~1MB JSON file supported
- **Students**: Tested with 75 students
- **Assessments**: No practical limit per student
- **Rendering**: Smooth with current dataset size

---

## Future Enhancements

### Planned Features (Phase 4)

1. **All Classes Comparison View**
   - Side-by-side class metrics
   - Comparative charts
   - Export comparison reports

2. **Advanced Filtering**
   - Score range filters
   - Custom date presets
   - Multiple class selection

3. **Data Editing**
   - Inline editing of scores
   - Add new assessments
   - Update student profiles

4. **Export Options**
   - PDF report generation
   - Excel/CSV export
   - Filtered data export

5. **Advanced Charts**
   - Progress over time (longitudinal)
   - Radar charts for student profiles
   - Heat maps for class attendance

6. **Reporting Checkpoints**
   - AI-generated insights
   - Progress summaries
   - Recommendation engine

---

## Troubleshooting

### Common Issues

**Q: Data not loading after page refresh**
- Check browser localStorage
- Verify localStorage is not disabled
- Check console for errors

**Q: Chart not displaying**
- Ensure students have data for selected assessment
- Check browser console for Recharts errors
- Verify data format matches expected structure

**Q: Student count mismatch**
- Run `scripts/analyzeStudentData.js` to verify data
- Check for duplicate names
- Verify class name consistency

**Q: Gray text in dropdowns**
- Ensure Tailwind classes include `bg-white text-gray-900`
- Check for conflicting CSS
- Clear browser cache

### Debug Tools

**Analysis Script:**
```bash
node scripts/analyzeStudentData.js
```

Shows:
- Student count per class
- Data quality issues
- Missing fields
- Assessment column distribution

**Console Logging:**
The app uses a Logger utility:
```typescript
Logger.info('Message');
Logger.error('Error message', { context });
```

---

## Credits & License

**Developed for**: Educational assessment tracking and analysis  
**Built with**: Next.js, TypeScript, Recharts, Tailwind CSS  
**Data Source**: Progress Report Python system (external)  
**Version**: 1.0.0  
**Last Updated**: October 2025

---

## Changelog

### Version 1.0.0 (October 2025)

#### Phase 1 - Foundation
- ✅ Page structure and routing
- ✅ Data upload and localStorage persistence
- ✅ Multi-language support (EN/LT/RU)
- ✅ Basic data validation
- ✅ Reusable JSONFileUpload component

#### Phase 2 - Core Features
- ✅ Student View with profile and assessments
- ✅ Class View with table and metrics
- ✅ Assessment timeline chart
- ✅ Date range filtering
- ✅ Assessment type filtering
- ✅ Column customization
- ✅ Sortable tables

#### Phase 3 - Refinements
- ✅ Activity Timeline with dual-mode (Activity/Score)
- ✅ Enhanced tooltips with full details
- ✅ Individual assessment columns (KD1, KD, ND1, ND2, ND4)
- ✅ Dynamic class statistics based on chart selection
- ✅ 10-bar histograms for scored assessments
- ✅ Binary completion charts for homework
- ✅ Fixed all styling issues (gray text/backgrounds)
- ✅ Consultation and Cambridge test integration in timeline
- ✅ Improved chart aesthetics (line with points instead of bars)

---

**End of Documentation**

For questions or support, please refer to the codebase or contact the development team.

