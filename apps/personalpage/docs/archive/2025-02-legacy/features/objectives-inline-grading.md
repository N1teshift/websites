# Objectives Tab: Inline Grade Entry Feature

**Date**: 2025-11-02
**Feature**: Direct grade entry in mission cards
**Status**: Implemented ✅

## Overview

The Objectives tab now allows teachers to enter grades directly where students with missing data are displayed. This eliminates the need to switch between tabs when adding assessment data for students identified in missions.

## Features

### 1. **Input Fields for Missing Assessments**

Each student card in a mission now displays input boxes for the specific assessments they're missing:

- **KD2 Mission**: Shows a single input field for the KD2 summative assessment
- **SD Tests Mission**: Shows separate input fields for each missing test (SD1, SD2, SD3)

### 2. **Real-time Input Tracking**

- Counter badge shows number of pending grade entries
- Input values are tracked in component state
- All inputs are retained until saved or discarded

### 3. **Save/Discard Actions**

Action buttons appear in the header when grades are entered:

- **Discard Button**: Clears all pending inputs without saving
- **Save All Grades Button**: Commits all entered grades to student records

### 4. **Automatic Mission Updates**

After saving:

- Student assessment records are updated
- Missions dynamically recalculate
- Students with newly added data automatically disappear from the mission list
- Data persists in localStorage

## User Interface

### Mission Card Layout

```
┌─────────────────────────────────────────────────────────┐
│  📝 KD2 Test Completion                        [5]       │
│  Students with blank KD2 data must complete this test   │
├─────────────────────────────────────────────────────────┤
│  📅 Deadline: October 31, 2025 (Overdue)                │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  8 Vydūnas                                     (3) │ │
│  ├────────────────────────────────────────────────────┤ │
│  │  • Adomas Bagdonavičius                           │ │
│  │    KD2: [____]  (0-10)                            │ │
│  │                                                    │ │
│  │  • Jonas Petrauskas                               │ │
│  │    KD2: [_8.5_]  (0-10)                           │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Header Controls (When Grades Pending)

```
Objectives & Missions                    2 grades pending  [Discard]  [Save All Grades]
```

## Technical Implementation

### Component Structure

**File**: `src/features/modules/edtech/progressReport/components/sections/ObjectivesSection.tsx`

### Key State Management

```typescript
// Track grade inputs for each student/assessment
const [gradeInputs, setGradeInputs] = useState<Map<string, GradeInput>>(new Map());
const [isSaving, setIsSaving] = useState(false);

interface GradeInput {
  studentId: string;
  assessmentType: "KD" | "SD1" | "SD2" | "SD3";
  value: string;
}
```

### Input Handling

```typescript
// Update input state when user types
handleGradeInput(studentId, assessmentType, value);

// Save all inputs to student records
handleSaveGrades();

// Clear all inputs without saving
handleDiscardGrades();
```

### Assessment Creation/Update

When saving grades:

1. **Parse and validate** input values (must be numeric)
2. **Find or create** assessment record for each student
3. **Update existing** records if assessment already exists
4. **Create new** assessment records for first-time entries
5. **Set metadata**: timestamps, assessment IDs, evaluation details
6. **Propagate changes** to parent component via `onDataChange` callback

### Assessment IDs Used

| Assessment | ID                             | Type      | Column |
| ---------- | ------------------------------ | --------- | ------ |
| KD2        | `summative-cambridge-unit2`    | summative | KD     |
| SD1        | `test-u1s1-irrational-numbers` | test      | SD1    |
| SD2        | `test-u1s2-standard-form`      | test      | SD2    |
| SD3        | `test-u1s3-indices`            | test      | SD3    |

## Usage Workflow

### Example: Adding KD2 Grades

1. Navigate to **Objectives** tab
2. See students missing KD2 data in the "KD2 Test Completion" mission
3. Enter grades in the input boxes next to each student's name
4. Click **"Save All Grades"** button
5. Students with valid grades disappear from the mission (now have data)
6. Data is saved to localStorage and persists across sessions

### Example: Adding Multiple SD Test Grades

1. Navigate to **Objectives** tab
2. See students missing SD1, SD2, and/or SD3 tests
3. Enter grades for whichever tests each student is missing
4. Note: You can enter grades for some tests and leave others blank
5. Click **"Save All Grades"**
6. Students fully completed → removed from mission
7. Students partially completed → mission updates to show only remaining missing tests

## Input Validation

- **Type**: Number input fields
- **Range**: 0-10
- **Step**: 0.1 (allows decimal grades like 8.5)
- **Format**: Percentage scores (0-10 scale)
- **Empty handling**: Empty inputs are ignored (not saved)
- **Invalid handling**: Non-numeric values are ignored

## Data Structure

### Created Assessment Record Example

```json
{
  "date": "2025-11-02",
  "column": "KD",
  "type": "summative",
  "task_name": "KD assessment",
  "score": "8.5",
  "comment": "",
  "added": "2025-11-02T14:30:15.123Z",
  "updated": "2025-11-02T14:30:15.123Z",
  "assessment_id": "summative-cambridge-unit2",
  "assessment_title": "Cambridge Unit 2 Summative",
  "evaluation_details": {
    "percentage_score": 8.5,
    "myp_score": null,
    "cambridge_score": null
  }
}
```

## Props Added

```typescript
interface ObjectivesSectionProps {
  students: StudentData[];
  missions?: Mission[];
  onDataChange?: (updatedStudents: StudentData[]) => void; // NEW
}
```

The `onDataChange` callback is passed from `ProgressReportPage` to enable data persistence.

## Benefits

1. **Efficient Workflow**: Enter data directly where missing data is identified
2. **Batch Entry**: Enter multiple grades at once before saving
3. **Visual Feedback**: See pending changes count before committing
4. **Error Prevention**: Discard option allows reverting mistakes
5. **Automatic Updates**: Missions recalculate instantly after save
6. **Consistent Data**: Uses same assessment IDs and structure as other entry methods

## Limitations & Future Enhancements

### Current Limitations

- Only supports percentage scores (not MYP or Cambridge scores yet)
- No comment field (can be added in Class View if needed)
- No undo after save (use data export backups)

### Potential Enhancements

1. Add MYP and Cambridge score inputs
2. Add comment fields for each assessment
3. Add date pickers for custom assessment dates
4. Add "Quick Fill" buttons for common scores (0, 5, 10)
5. Add validation warning messages for out-of-range values
6. Add confirmation dialog before save
7. Add individual save buttons per student
8. Add keyboard shortcuts (Enter to save, Escape to discard)

## Testing

### Test Scenarios

1. **Basic Entry**
   - ✅ Enter a single KD2 grade
   - ✅ Save and verify student removed from mission

2. **Multiple Students**
   - ✅ Enter grades for multiple students at once
   - ✅ Save and verify all updates applied

3. **Partial SD Entry**
   - ✅ Enter SD1 but not SD2/SD3
   - ✅ Verify student still appears with updated missing list

4. **Discard Functionality**
   - ✅ Enter several grades
   - ✅ Click Discard
   - ✅ Verify all inputs cleared

5. **Invalid Input**
   - ✅ Enter non-numeric value
   - ✅ Verify ignored on save

6. **Empty Input**
   - ✅ Leave some inputs empty
   - ✅ Verify only filled inputs are saved

## Related Files

- `src/features/modules/edtech/progressReport/components/sections/ObjectivesSection.tsx` - Main component
- `src/features/modules/edtech/progressReport/ProgressReportPage.tsx` - Parent component
- `src/features/modules/edtech/progressReport/types/ProgressReportTypes.ts` - Type definitions
- `docs/fixes/OBJECTIVES_DYNAMIC_CALCULATION_FIX.md` - Related dynamic mission calculation

## Integration with Existing Features

This feature integrates seamlessly with:

- **Dynamic Mission Calculation**: Missions update automatically based on current data
- **Class View**: Grades entered here appear in Class View tables
- **Data Management**: Saved data included in JSON exports
- **localStorage**: Changes persist across browser sessions

---

**Status**: ✅ Ready for production use
**Last Updated**: 2025-11-02
