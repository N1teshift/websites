# Comments Generator Template Filtering

## Overview

Implemented teacher-specific template filtering in the Comments Generator to ensure that teachers only see relevant templates for their subject area.

## Changes Made

### 1. Pass Teacher Type to Comments Generator

**File:** `ProgressReportPage.tsx`

```typescript
case 'comments-generator':
    return data ? (
        <CommentsGeneratorSection 
            students={data.students} 
            teacherType={teacherType}  // ✅ Added
        />
    ) : (
```

### 2. Filter Templates Based on Teacher Type

**File:** `CommentsGeneratorSection.tsx`

```typescript
interface CommentsGeneratorSectionProps {
    students: StudentData[];
    teacherType?: string;  // ✅ Added
}

const CommentsGeneratorSection: React.FC<CommentsGeneratorSectionProps> = ({ 
    students, 
    teacherType = 'main'  // ✅ Default to 'main'
}) => {
    // Rename to allTemplates
    const {
        templates: allTemplates,  // ✅ Renamed
        activeTemplate,
        activeTemplateId,
        setActiveTemplateId,
        updateTemplate
    } = useCommentTemplates();

    // Filter templates based on teacher type
    const templates = useMemo(() => {
        const isEnglishTeacher = teacherType === 'J' || teacherType === 'A';
        
        if (isEnglishTeacher) {
            // English teachers: only show English templates
            return allTemplates.filter(t => 
                t.id === 'english-diagnostic-1' || t.id === 'english-unit-1'
            );
        } else {
            // Main teachers: only show Math templates
            return allTemplates.filter(t => 
                t.id === 'default-unit1'
            );
        }
    }, [allTemplates, teacherType]);

    // Auto-switch to first available template if current one is not in filtered list
    useEffect(() => {
        if (templates.length > 0 && !templates.find(t => t.id === activeTemplateId)) {
            setActiveTemplateId(templates[0].id);
        }
    }, [templates, activeTemplateId, setActiveTemplateId]);
```

## Template Filtering Logic

### For English Teachers (Teacher Type: 'J' or 'A')
**Shows only:**
- ✅ English Diagnostic TEST 1
- ✅ English Unit 1 TEST

**Hides:**
- ❌ Default Unit 1 Comments (Math)

### For Main/Math Teachers (Teacher Type: 'main')
**Shows only:**
- ✅ Default Unit 1 Comments (Math)

**Hides:**
- ❌ English Diagnostic TEST 1
- ❌ English Unit 1 TEST

## Auto-Switching Feature

If a teacher switches between different data files (e.g., from Math to English data), the Comments Generator automatically:

1. **Filters** available templates based on the new teacher type
2. **Checks** if the currently active template is still available
3. **Switches** to the first available template if the current one is filtered out

This prevents errors where an English teacher might have a Math template selected when loading English data.

## Benefits

1. **Cleaner Interface**
   - Teachers only see relevant templates
   - Reduces confusion and clutter

2. **Prevents Errors**
   - Can't accidentally select wrong template type
   - Data extraction will always match template expectations

3. **Better UX**
   - Auto-switches to valid template
   - No manual intervention needed

4. **Type Safety**
   - Ensures data structure matches template requirements
   - English data with English templates
   - Math data with Math templates

## Example User Experience

### English Teacher (Teacher A)
1. Loads `master_student_data_J_v5.json`
2. Opens Comments Generator
3. Sees dropdown with:
   - English Diagnostic TEST 1
   - English Unit 1 TEST
4. ✅ Cannot see or select Math templates

### Math Teacher
1. Loads `data_2025-11-09.json`
2. Opens Comments Generator
3. Sees dropdown with:
   - Default Unit 1 Comments
4. ✅ Cannot see or select English templates

## Future Enhancements

- Could add template categories to UI ("Math Templates", "English Templates")
- Could allow custom templates that work with either data type
- Could show informational message explaining why some templates aren't shown
- Could add template import/export for sharing between teachers

## Files Modified

1. `src/features/modules/edtech/progressReport/ProgressReportPage.tsx`
   - Pass `teacherType` prop to CommentsGeneratorSection

2. `src/features/modules/edtech/progressReport/components/sections/CommentsGeneratorSection.tsx`
   - Accept `teacherType` prop
   - Filter templates based on teacher type
   - Auto-switch to valid template if needed
   - Add `useEffect` import

## Testing

✅ No linter errors
✅ English teacher only sees English templates
✅ Math teacher only sees Math templates
✅ Auto-switching works when changing data files
✅ Default behavior (teacherType='main') shows Math templates

## Related Documentation

- Comments Generator Refactor: `../refactoring/refactor.md`
- Template Migration Fix: `docs/fixes/COMMENTS_GENERATOR_TEMPLATE_MIGRATION.md`
- English Test Data Integration: `../../progress-report/data/teacher-j-integration-complete.md`

