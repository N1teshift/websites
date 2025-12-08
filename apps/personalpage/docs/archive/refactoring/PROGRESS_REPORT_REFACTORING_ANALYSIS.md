# Progress Report Components - Refactoring Analysis

## Executive Summary

After analyzing both `progressReport/` directories, I've identified significant opportunities for refactoring. The main issues are:

1. **Files exceeding 200 lines** (7 files, largest is 1018 lines)
2. **Substantial code duplication** across similar components
3. **Missing reusable components** for common UI patterns
4. **Large complex functions** that should be extracted
5. **Duplicated business logic** across multiple files

---

## 1. FILE SIZE ISSUES

### Critical (500+ lines)

- **ClassViewSectionRefined.tsx**: 1018 lines ⚠️ URGENT
  - Main table component with inline editing, sorting, filtering
  - Contains complex column generation, cell editing, English test handling
  - Multiple nested useMemo hooks with 100+ line calculations

### High Priority (300-500 lines)

- **StudentViewSectionEnhanced.tsx**: 473 lines
- **ClassPerformanceChartEnhanced.tsx**: 405 lines
- **GradeGeneratorSection.tsx**: 389 lines
- **StudentViewSection.tsx**: 364 lines
- **ActivityTimelineChart.tsx**: 354 lines

### Medium Priority (200-335 lines)

- **ClassViewSectionEnhanced.tsx**: 335 lines
- **ClassViewSection.tsx**: 283 lines

### Already Good

- **ColumnCustomizer.tsx**: 108 lines ✓
- **MultiSelectFilter.tsx**: 90 lines ✓
- **DateRangeFilter.tsx**: 162 lines ✓
- **CollapsibleSection.tsx**: 63 lines ✓

---

## 2. CODE DUPLICATION

### A. Duplicate Components (70-90% similarity)

#### StudentViewSection vs StudentViewSectionEnhanced

**Duplication**: ~70% overlap

- Student selector UI (identical)
- Basic profile display
- Assessment filtering/sorting
- Material completion table
- Cambridge tests table
- Attendance records table

**Differences**:

- Enhanced version adds: ActivityTimelineChart, CollapsibleSection, DateRangeFilter
- Enhanced version has more advanced filtering logic
- Enhanced version handles experimental data filtering

**Recommendation**: Merge into one component with feature flags or props

#### ClassViewSection vs ClassViewSectionEnhanced vs ClassViewSectionRefined

**Duplication**: ~60% overlap

- Class selector + search
- Student filtering and sorting
- Class statistics cards
- Student table structure

**Differences**:

- Refined: Adds inline editing, column customization, assessment columns, English tests
- Enhanced: Adds CollapsibleSection, ColumnCustomizer, ClassPerformanceChart
- Basic: Simple table with stats

**Recommendation**: Create a base component with composition pattern

### B. Repeated Code Patterns

#### 1. **Student Filtering & Sorting** (appears in 6 files)

```typescript
// Repeated in: ClassViewSection, ClassViewSectionEnhanced, ClassViewSectionRefined,
// StudentViewSection, StudentViewSectionEnhanced, GradeGeneratorSection

const filteredStudents = useMemo(() => {
    let filtered = students;

    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(s =>
            s.first_name.toLowerCase().includes(query) ||
            s.last_name.toLowerCase().includes(query) ||
            getStudentFullName(s).toLowerCase().includes(query)
        );
    }

    if (selectedClass !== 'all') {
        filtered = filtered.filter(s => s.class_name === selectedClass);
    }

    // Sorting logic...
    return filtered.sort(...);
}, [students, searchQuery, selectedClass, sortBy, sortDirection]);
```

#### 2. **Class Statistics Calculation** (appears in 3 files)

```typescript
// Repeated in: ClassViewSection, ClassViewSectionEnhanced, ClassViewSectionRefined

const classStats = useMemo(() => {
    if (classStudents.length === 0) return null;

    const allStats = classStudents.map(calculateStudentStats);
    const avgScore = allStats.reduce((sum, s) => sum + s.averageScore, 0) / allStats.length;
    const avgAttendance = allStats.reduce((sum, s) => sum + s.attendanceRate, 0) / allStats.length;
    // ... more calculations

    return { studentCount, averageScore, averageAttendance, ... };
}, [classStudents]);
```

#### 3. **Sort Handler & Icon** (appears in 5 files)

```typescript
const handleSort = (field: SortField) => {
  if (sortBy === field) {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  } else {
    setSortBy(field);
    setSortDirection("asc");
  }
};

const getSortIcon = (field: SortField) => {
  if (sortBy !== field) return "↕️";
  return sortDirection === "asc" ? "↑" : "↓";
};
```

#### 4. **Class Selector + Search UI** (appears in 6 files)

```typescript
<div className="bg-white border border-gray-200 rounded-lg p-4">
    <select value={selectedClass} onChange={...}>
        <option value="all">All Classes</option>
        {classes.map(className => ...)}
    </select>

    <input
        type="text"
        placeholder="Search student"
        value={searchQuery}
        onChange={...}
    />
</div>
```

#### 5. **Statistics Cards Display** (appears in 3 files)

```typescript
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <div className="text-sm text-blue-600 font-medium mb-1">Students</div>
        <div className="text-3xl font-bold text-blue-900">{count}</div>
    </div>
    // ... more cards
</div>
```

---

## 3. LARGE FUNCTIONS TO EXTRACT

### ClassViewSectionRefined.tsx

#### A. Column Generation Logic (lines 155-307)

**Size**: 152 lines
**Purpose**: Build dynamic columns from assessments
**Extract to**: `hooks/useColumnGenerator.ts` or `utils/columnBuilder.ts`

#### B. Cell Value Getter (lines 637-699)

**Size**: 62 lines
**Purpose**: Get cell display value with pending edits
**Extract to**: `utils/cellValueUtils.ts`

#### C. Save Changes Handler (lines 528-628)

**Size**: 100 lines
**Purpose**: Apply pending edits to student data
**Extract to**: `hooks/useInlineEditing.ts` or separate component

#### D. Chart Options Builder (lines 98-146)

**Size**: 48 lines
**Purpose**: Build chart dropdown options including English tests
**Extract to**: `utils/chartOptionsBuilder.ts`

### ClassPerformanceChartEnhanced.tsx

#### Chart Data Calculation (lines 84-220)

**Size**: 136 lines
**Purpose**: Transform student data into chart format
**Extract to**: `utils/chartDataCalculator.ts`

### ActivityTimelineChart.tsx

#### Timeline Events Gathering (lines 41-152)

**Size**: 111 lines
**Purpose**: Collect and filter timeline events
**Extract to**: `utils/timelineEventsBuilder.ts`

### GradeGeneratorSection.tsx

#### Grade Calculation Logic (lines 28-62)

**Size**: 34 lines
**Purpose**: Calculate grades from test scores
**Extract to**: `utils/gradeCalculations.ts`

---

## 4. MISSING REUSABLE COMPONENTS

### A. ClassSelectorWithSearch

**Usage**: 6 files
**Props**:

```typescript
interface ClassSelectorWithSearchProps {
  classes: string[];
  selectedClass: string;
  onClassChange: (className: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showAllOption?: boolean;
}
```

### B. StudentSelectorList

**Usage**: 2 files (StudentViewSection, StudentViewSectionEnhanced)
**Props**:

```typescript
interface StudentSelectorListProps {
  students: StudentData[];
  selectedStudent: StudentData | null;
  onSelectStudent: (student: StudentData) => void;
  maxHeight?: string;
}
```

### C. StatisticsCards

**Usage**: 3 files
**Props**:

```typescript
interface StatisticsCardsProps {
  cards: Array<{
    label: string;
    value: string | number;
    color: "blue" | "green" | "purple" | "orange" | "red";
    icon?: string;
  }>;
}
```

### D. SortableTableHeader

**Usage**: 5 files
**Props**:

```typescript
interface SortableTableHeaderProps {
  label: string;
  field: string;
  currentSortField: string;
  currentDirection: "asc" | "desc";
  onSort: (field: string) => void;
  sortable?: boolean;
  tooltip?: string;
}
```

### E. EditableCell

**Usage**: 1 file (but needed for table editing)
**Props**:

```typescript
interface EditableCellProps {
  value: string;
  isEditing: boolean;
  hasEdit: boolean;
  onEdit: (value: string) => void;
  onStartEdit: () => void;
  onEndEdit: () => void;
  onCancel: () => void;
}
```

### F. AssessmentTable

**Usage**: 2 files (StudentViewSection, StudentViewSectionEnhanced)
**Props**:

```typescript
interface AssessmentTableProps {
  assessments: Assessment[];
  onSort?: (sortBy: string) => void;
  filters?: React.ReactNode;
}
```

---

## 5. UTILITY FUNCTIONS TO CREATE

### A. Student Filtering/Sorting

**File**: `utils/studentFilters.ts`

```typescript
export function filterStudentsBySearch(students: StudentData[], query: string): StudentData[];
export function filterStudentsByClass(students: StudentData[], className: string): StudentData[];
export function sortStudents(
  students: StudentData[],
  sortBy: string,
  direction: "asc" | "desc"
): StudentData[];
export function useStudentFiltering(students: StudentData[], filters: FilterConfig): StudentData[];
```

### B. Class Statistics

**File**: `utils/classStatistics.ts`

```typescript
export function calculateClassStats(students: StudentData[]): ClassStats;
export function calculateAverageScore(students: StudentData[]): number;
export function calculateAverageAttendance(students: StudentData[]): number;
export function calculateAverageCompletion(students: StudentData[]): number;
```

### C. Table Sorting Hook

**File**: `hooks/useTableSorting.ts`

```typescript
export function useTableSorting<T>(
  data: T[],
  defaultSort: string,
  comparators: Record<string, (a: T, b: T) => number>
): {
  sortedData: T[];
  sortBy: string;
  sortDirection: "asc" | "desc";
  handleSort: (field: string) => void;
  getSortIcon: (field: string) => string;
};
```

### D. Column Visibility Hook

**File**: `hooks/useColumnVisibility.ts`

```typescript
export function useColumnVisibility(initialColumns: ColumnConfig[]): {
  columns: ColumnConfig[];
  visibleColumns: ColumnConfig[];
  toggleColumn: (id: string) => void;
  showAll: () => void;
  isVisible: (id: string) => boolean;
};
```

---

## 6. TYPE DEFINITIONS TO EXTRACT

### Shared Types File

**File**: `types/progressReportUI.ts`

```typescript
export type SortDirection = "asc" | "desc";
export type SortField = string;

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface FilterConfig {
  searchQuery?: string;
  selectedClass?: string;
  selectedTypes?: string[];
  dateRange?: DateRange;
}

export interface ClassStats {
  studentCount: number;
  averageScore: number;
  averageAttendance: number;
  averageCompletion: number;
}

export interface CellEdit {
  studentKey: string;
  assessmentId: string;
  scoreType: "percentage" | "myp" | "cambridge" | null;
  newValue: string;
}
```

---

## 7. PROPOSED REFACTORING STRUCTURE

```
src/features/modules/edtech/components/progressReport/
├── charts/
│   ├── ClassPerformanceChartEnhanced.tsx (keep, extract data calc)
│   ├── ActivityTimelineChart.tsx (keep, extract event builder)
│   └── AssessmentTimelineChart.tsx (keep)
├── filters/
│   ├── DateRangeFilter.tsx (keep - already good)
│   ├── MultiSelectFilter.tsx (keep - already good)
│   └── ClassSelectorWithSearch.tsx (NEW)
├── tables/
│   ├── EditableCell.tsx (NEW)
│   ├── SortableTableHeader.tsx (NEW)
│   └── AssessmentTable.tsx (NEW)
├── cards/
│   ├── StatisticsCards.tsx (NEW)
│   └── StudentCard.tsx (NEW)
├── shared/
│   ├── CollapsibleSection.tsx (keep - already good)
│   ├── ColumnCustomizer.tsx (keep - already good)
│   ├── StudentSelectorList.tsx (NEW)
│   └── StudentSummaryCards.tsx (keep)

src/features/modules/edtech/components/sections/progressReport/
├── ClassViewSection.tsx (CONSOLIDATE - merge all 3 class views)
├── StudentViewSection.tsx (CONSOLIDATE - merge 2 student views)
├── GradeGeneratorSection.tsx (keep, extract calculations)
├── ObjectivesSection.tsx (keep)
├── DataManagementSection.tsx (keep)
├── ExcelFileUpload.tsx (keep)
└── GuideSection.tsx (keep)

src/features/modules/edtech/hooks/
├── useStudentFiltering.ts (NEW)
├── useTableSorting.ts (NEW)
├── useColumnVisibility.ts (NEW)
├── useInlineEditing.ts (NEW)
└── useClassStatistics.ts (NEW)

src/features/modules/edtech/utils/progressReport/
├── studentFilters.ts (NEW)
├── classStatistics.ts (NEW)
├── columnBuilder.ts (NEW)
├── chartDataCalculator.ts (NEW)
├── timelineEventsBuilder.ts (NEW)
├── gradeCalculations.ts (NEW)
└── cellValueUtils.ts (NEW)
```

---

## 8. REFACTORING PRIORITIES

### Phase 1: Extract Utilities & Hooks (2-3 hours)

1. Create `useTableSorting` hook
2. Create `useStudentFiltering` hook
3. Create `studentFilters.ts` utils
4. Create `classStatistics.ts` utils

### Phase 2: Create Reusable Components (3-4 hours)

1. `ClassSelectorWithSearch` component
2. `StatisticsCards` component
3. `SortableTableHeader` component
4. `StudentSelectorList` component
5. `EditableCell` component

### Phase 3: Refactor Large Files (5-6 hours)

1. **ClassViewSectionRefined.tsx** (highest priority)
   - Extract column generation to utils
   - Extract cell editing to hook
   - Extract chart options to utils
   - Use new shared components
   - Target: reduce from 1018 to ~300 lines

2. **StudentViewSectionEnhanced.tsx**
   - Extract timeline building
   - Use new shared components
   - Target: reduce from 473 to ~200 lines

3. **ClassPerformanceChartEnhanced.tsx**
   - Extract chart data calculation
   - Target: reduce from 405 to ~200 lines

### Phase 4: Consolidate Duplicate Components (3-4 hours)

1. Merge StudentViewSection + StudentViewSectionEnhanced
2. Merge ClassViewSection + ClassViewSectionEnhanced + ClassViewSectionRefined
3. Use composition pattern with feature props

### Phase 5: Extract from Medium Files (2-3 hours)

1. GradeGeneratorSection - extract calculations
2. ActivityTimelineChart - extract event builder

---

## 9. BENEFITS OF REFACTORING

### Code Quality

- **Maintainability**: 70% reduction in code duplication
- **Readability**: Files under 200 lines (per user preference)
- **Testability**: Isolated utilities and hooks are easier to test
- **Type Safety**: Shared types prevent inconsistencies

### Performance

- Reusable components can be memoized once
- Extracted utilities can be optimized independently
- Reduced re-renders from smaller components

### Developer Experience

- Faster feature development with reusable components
- Easier debugging with smaller, focused files
- Clear separation of concerns
- Self-documenting code structure

---

## 10. ESTIMATED TIME

| Phase     | Task                       | Time            |
| --------- | -------------------------- | --------------- |
| 1         | Extract utilities & hooks  | 2-3 hours       |
| 2         | Create reusable components | 3-4 hours       |
| 3         | Refactor large files       | 5-6 hours       |
| 4         | Consolidate duplicates     | 3-4 hours       |
| 5         | Extract from medium files  | 2-3 hours       |
| **Total** |                            | **15-20 hours** |

---

## 11. RISK MITIGATION

### Testing Strategy

1. Create snapshot tests for existing components before refactoring
2. Test utilities in isolation
3. Test hooks with React Testing Library
4. Integration tests for consolidated components

### Incremental Approach

1. Start with utilities (no component changes)
2. Add new components alongside old ones
3. Migrate one section at a time
4. Keep old components until migration complete
5. Remove old components in final cleanup

### Rollback Plan

- Keep all changes in a feature branch
- Use git tags for each phase completion
- Maintain backup of original files
- Document breaking changes

---

## 12. NEXT STEPS

Would you like me to:

1. ✅ Start with Phase 1 (Extract utilities & hooks)?
2. ✅ Begin with the largest file (ClassViewSectionRefined.tsx)?
3. ✅ Create the reusable components first?
4. ✅ Consolidate duplicate components first?
5. ❓ Something else?

Please let me know which approach you'd prefer, and I'll begin the refactoring work immediately.
