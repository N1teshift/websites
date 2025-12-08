# Chart Component Refactoring

## Overview

**Date**: November 10, 2025  
**Status**: ✅ Complete

Refactored `ClassPerformanceChartEnhanced.tsx` from a 559-line monolithic component into a modular, maintainable architecture.

---

## Problem Statement

The original `ClassPerformanceChartEnhanced.tsx` had grown to 559 lines with multiple issues:

### Issues Identified:

1. **Multiple Responsibilities**: Chart rendering, assessment grouping, score type detection, and calculation logic all in one file
2. **Complex Logic Mixed with UI**: Business logic intertwined with rendering
3. **Large useMemo Hooks**: Some hooks exceeded 50+ lines with nested conditionals
4. **Hard to Test**: Adding new assessment types required understanding the entire 559-line file
5. **Duplicate Logic**: English test detection happened in multiple places
6. **Difficult Maintenance**: Changes required careful navigation through deeply nested logic

---

## Solution: Modular Architecture

### New Structure

```
src/features/modules/edtech/progressReport/
├── utils/
│   └── chartAssessmentUtils.ts          # Assessment grouping & English test detection
├── hooks/
│   ├── useAvailableScoreTypes.ts        # Score type options logic
│   └── useChartData.ts                  # Chart data calculation
└── components/common/
    ├── chart/
    │   ├── ChartModeSelector.tsx        # Assessment dropdown UI
    │   ├── ScoreTypeSelector.tsx        # Score type dropdown UI
    │   └── HomeworkViewSelector.tsx     # Homework view dropdown UI
    └── ClassPerformanceChartEnhanced.tsx # Main component (reduced to 274 lines)
```

---

## Files Created

### 1. **chartAssessmentUtils.ts** (Utility Functions)

**Purpose**: Centralize assessment logic

**Functions**:

- `isEnglishTest()` - Detect if assessment has English-specific fields
- `hasFieldData()` - Check if students have data for a specific field
- `groupAssessmentsByType()` - Group assessments into categories (English diagnostic, English unit, math summative, etc.)

**Benefits**:

- Single source of truth for English test detection
- Reusable across components
- Easy to unit test

### 2. **useAvailableScoreTypes.ts** (Custom Hook)

**Purpose**: Determine available score type options for an assessment

**Features**:

- Detects English tests vs regular math tests
- Returns appropriate score types (Papers, Listening, Reading, etc. for English; Percentage, MYP, Cambridge for math)
- Only includes score types with actual data

**Benefits**:

- Encapsulates complex score type logic
- Automatically filters options based on data availability
- Clean separation of concerns

### 3. **useChartData.ts** (Custom Hook)

**Purpose**: Calculate chart data based on assessment type and score type

**Handles**:

- English test components (raw scores and percentages)
- Cambridge scoring (0, 0.5, 1)
- Homework (completion vs scores)
- Regular assessments (percentage, MYP)
- Legacy English test type

**Benefits**:

- All calculation logic in one place
- Easier to debug data issues
- Testable in isolation

### 4. **Chart UI Components**

#### ChartModeSelector.tsx

- Dropdown for selecting which assessment to display
- Handles optgroups (English Diagnostic, English Unit, Summative, etc.)

#### ScoreTypeSelector.tsx

- Dropdown for selecting score type (Percentage, MYP, Papers, etc.)
- Conditionally rendered based on availability

#### HomeworkViewSelector.tsx

- Dropdown for homework view mode (completion vs scores)
- Only shown for homework assessments

**Benefits**:

- Each component has a single responsibility
- Easy to style and maintain
- Can be tested independently

### 5. **ClassPerformanceChartEnhanced.tsx** (Refactored)

**Reduced from 559 to 274 lines** (51% reduction)

**Now focuses on**:

- State management
- Coordinating hooks and components
- Rendering the chart

**No longer contains**:

- Complex assessment grouping logic
- Score type detection logic
- Chart data calculation
- Dropdown rendering details

---

## Benefits of Refactoring

### Maintainability

- ✅ Each file has a clear, single purpose
- ✅ Easy to locate and fix bugs
- ✅ Changes are localized to specific files

### Testability

- ✅ Utility functions can be unit tested independently
- ✅ Hooks can be tested with React Testing Library
- ✅ Components can be tested in isolation

### Extensibility

- ✅ Adding new assessment types: Update `groupAssessmentsByType()`
- ✅ Adding new score types: Update `useAvailableScoreTypes()`
- ✅ Adding new chart types: Update `useChartData()`

### Code Reusability

- ✅ `isEnglishTest()` can be used in other components
- ✅ `hasFieldData()` can be used for column building
- ✅ Hooks can be reused in other chart components

### Developer Experience

- ✅ Clearer file structure
- ✅ Easier onboarding for new developers
- ✅ Self-documenting code organization

---

## Migration Notes

### Breaking Changes

**None** - This is a pure refactor with no API changes

### Backward Compatibility

✅ All functionality preserved  
✅ All props work the same way  
✅ No changes required in parent components

### Testing Checklist

- [x] Diagnostic tests appear in dropdown
- [x] Unit tests show correct score type options
- [x] English test data displays correctly
- [x] Regular math assessments still work
- [x] Homework view modes work
- [x] Chart data calculates correctly for all types
- [x] No linter errors

---

## Performance Impact

**No negative impact**:

- useMemo hooks still prevent unnecessary recalculations
- Component re-renders unchanged
- Hook overhead is negligible

---

## Future Improvements

### Potential Enhancements:

1. **Add Unit Tests**: Now that logic is modular, add comprehensive tests
2. **TypeScript Strictness**: Add stricter types to utility functions
3. **Memoization**: Consider React.memo for UI components if performance becomes an issue
4. **Documentation**: Add JSDoc comments to all exported functions
5. **Error Boundaries**: Add error handling for data calculation failures

### Other Components to Refactor:

- `ActivityTimelineChart.tsx` (222 lines) - Similar patterns could benefit from extraction
- `AssessmentTimelineChart.tsx` (95 lines) - Smaller but could share utilities

---

## Lessons Learned

1. **Refactor Early**: Don't wait until a component reaches 500+ lines
2. **Extract Hooks**: Custom hooks are excellent for complex calculations
3. **Utility Functions**: Pure functions are easier to test and reuse
4. **UI Decomposition**: Break down complex UIs into smaller components
5. **Keep Main Component Thin**: Main component should orchestrate, not implement

---

## Related Documentation

- [English Test Integration](../data/teacher-j-integration-complete.md)
- [Chart Scaling Fix](../../../archive/fixes/ENGLISH_TEST_CHART_SCALING_FIX.md)
- [Chart Upgrade](../features/english-test-chart-upgrade.md)
