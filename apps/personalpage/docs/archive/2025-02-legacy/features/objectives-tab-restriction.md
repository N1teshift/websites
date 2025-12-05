# Objectives Tab - Teacher Type Restriction

## Overview
**Date**: November 10, 2025  
**Status**: ✅ Complete

Added teacher type detection to the Objectives tab to restrict access for English teacher data, similar to the Grade Generator tab.

---

## Problem Statement

The Objectives feature is designed specifically for Cambridge Learning Objectives tracking in the Math curriculum. When English teacher data (Teacher A/J) is loaded, the Objectives tab should not be accessible as:
- English curriculum uses different objective tracking
- The Cambridge objectives are Math-specific
- Displaying the tab for English data would be confusing/misleading

---

## Solution

### Implementation

Added teacher type check to the `'objectives'` case in `ProgressReportPage.tsx`:

```typescript
case 'objectives':
    if (!data) {
        return <NoDataMessage />;
    }
    
    // Check if this is main teacher data
    const objectivesTeacherType = data.metadata?.teacher_type || 'main';
    if (objectivesTeacherType !== 'main') {
        return <ObjectivesNotAvailableMessage />;
    }
    
    return <ObjectivesTabContainer />;
```

### User Experience

**When English teacher data is loaded and user clicks "Objectives" tab**:

```
🎯

Objectives Not Available

The Objectives feature is currently only available for 
the main teacher's data (Math assessments).

┌─────────────────────────────────────────────┐
│ Current Data: Teacher A                     │
│                                             │
│ This feature is specifically designed for   │
│ Cambridge Learning Objectives tracking      │
│ used in the main Math curriculum. For       │
│ English assessment data, objectives are     │
│ tracked differently within the English      │
│ curriculum.                                 │
└─────────────────────────────────────────────┘
```

---

## Behavior

### Tab Navigation
- ✅ **Tab is still visible** in navigation
- ✅ **Tab can be clicked** (no disabled state)
- ✅ **Shows helpful message** instead of component
- ✅ **Explains why it's not available**
- ✅ **Shows current teacher info**

### Consistency
This matches the existing behavior of the **Grade Generator** tab:
- Both tabs use the same detection logic
- Both show similar informative messages
- Both are visible but restricted for English teachers

### Teacher Type Detection
```typescript
const teacherType = data?.metadata?.teacher_type || 'main';
const isEnglishTeacher = teacherType === 'J' || teacherType === 'A';

// Objectives accessible only when:
teacherType === 'main'  // Main teacher (Math)
```

---

## Files Modified

### Updated
1. **`ProgressReportPage.tsx`** (lines 186-233)
   - Added teacher type check for objectives case
   - Added informative message component
   - Matches Grade Generator pattern
   - Returns early if not main teacher

---

## Testing Checklist

- [x] Main teacher data: Objectives tab works normally
- [x] English teacher (A/J) data: Shows "not available" message
- [x] Message is clear and helpful
- [x] Tab navigation still works
- [x] No console errors
- [x] Consistent with Grade Generator behavior

---

## Related Features

### Currently Restricted for English Teachers:
1. ✅ **Grade Generator** - Math-specific SD test calculations
2. ✅ **Objectives** - Cambridge Learning Objectives (Math)
3. ✅ **Learning Journey Timeline** (in Class View) - Math progress tracking
4. ✅ **Cambridge Objectives Mastery** (in Class View) - Math objectives

### Available for English Teachers:
1. ✅ **Class View** - Full table with all English test data
2. ✅ **Student View** - Individual student assessments
3. ✅ **Class Performance Distribution** - Charts with English test scales
4. ✅ **Comments Generator** - Works for all assessments
5. ✅ **Data Management** - Load/export/validate data

---

## Future Considerations

### Potential Enhancements:
1. **English-specific Objectives Tab**: Create a separate objectives system for English curriculum
2. **Tab Hiding Option**: Add ability to completely hide restricted tabs
3. **Visual Indicators**: Add icon/badge to show tab restrictions before clicking
4. **Settings Panel**: Allow teachers to configure which tabs are shown

---

## Related Documentation
- [Grade Generator Restriction](../features/GRADE_GENERATOR_RESTRICTION.md) (similar pattern)
- [Teacher Type Detection](../data/teacher-j-integration-complete.md)
- [Conditional UI Rendering](../features/CONDITIONAL_UI_RENDERING.md)

---

**Implemented by**: AI Assistant  
**Date**: November 10, 2025  
**Status**: ✅ Complete and Verified

