# Unit Test File Organization

## Hybrid Approach: Use `__tests__` Folders

**For directories with >5 files**: Use `__tests__` folders to keep things clean  
**For small directories**: Co-location is fine

## Pattern 1: `__tests__` Folder (Recommended for Larger Directories) ✅

Create a `__tests__` subfolder in directories that would otherwise feel cluttered.

### Example: Large Hooks Directory

```
src/features/modules/calendar/hooks/
├── useAvailabilityCheck.ts
├── useCalendarData.ts
├── useCalendarEvents.ts
├── useCalendarInteractions.ts
├── useCalendarLocalization.ts
├── useCalendarStyling.ts
├── useCalendarTimeBounds.ts
├── useEventRegistration.ts
├── index.ts
└── __tests__/                    ← All tests in one place (clean!)
    ├── useAvailabilityCheck.test.ts
    ├── useCalendarData.test.ts
    ├── useCalendarEvents.test.ts
    └── ...
```

**Benefits:**

- ✅ Keeps main directory clean
- ✅ Easy to find all tests in one place
- ✅ Clear separation of source vs tests

### Example: Large Components Directory

```
src/features/modules/calendar/components/
├── Calendar.tsx
├── CalendarToolbar.tsx
├── EventCreationForm.tsx
├── EventDetails.tsx
├── LessonSchedulerLayout.tsx
├── LessonSchedulerPage.tsx
├── SidebarContent.tsx
├── index.ts
└── __tests__/                    ← Keeps components folder clean
    ├── Calendar.test.tsx
    ├── CalendarToolbar.test.tsx
    └── ...
```

---

## Pattern 2: Co-location (For Small Directories)

For small directories with ≤5 files, placing tests next to source is fine.

```
src/features/modules/small-feature/utils/
├── helper.ts
├── helper.test.ts              ← OK for small dirs
├── format.ts
├── format.test.ts              ← OK for small dirs
└── index.ts
```

---

## Current State & Recommendation

### Your Current Structure:

**Already using co-location** (works fine):

```
calendar/utils/
├── eventTransformer.ts
├── eventTransformer.test.ts      ← Currently co-located
├── dateUtils.ts
├── dateUtils.test.ts             ← Currently co-located
└── ...
```

### Recommended for Larger Directories:

**Use `__tests__` folders** for:

- `calendar/hooks/` (9 files - would become 18 with tests)
- `calendar/components/` (8 files - would become 16 with tests)
- Any directory with >5 source files

---

## Jest Configuration

The Jest config already supports both patterns:

```javascript
// jest.config.cjs
testMatch: [
  '**/__tests__/**/*.[jt]s?(x)',        // ✅ Supports __tests__ folders
  '**/?(*.)+(spec|test).[jt]s?(x)',     // ✅ Supports *.test.ts next to files
],
```

Both patterns work automatically! Jest will find tests in either location.

---

## Visual Comparison

### Option A: All Co-located (Cluttered)

```
hooks/
├── useAvailabilityCheck.ts
├── useAvailabilityCheck.test.ts       ← Test file
├── useCalendarData.ts
├── useCalendarData.test.ts            ← Test file
├── useCalendarEvents.ts
├── useCalendarEvents.test.ts          ← Test file
├── useCalendarInteractions.ts
├── useCalendarInteractions.test.ts    ← Test file
├── useCalendarLocalization.ts
├── useCalendarLocalization.test.ts    ← Test file
├── useCalendarStyling.ts
├── useCalendarStyling.test.ts         ← Test file
├── useCalendarTimeBounds.ts
├── useCalendarTimeBounds.test.ts      ← Test file
├── useEventRegistration.ts
├── useEventRegistration.test.ts       ← Test file
└── index.ts
```

**Result: 18 files in one directory** 😵

### Option B: Using `__tests__` (Clean)

```
hooks/
├── useAvailabilityCheck.ts
├── useCalendarData.ts
├── useCalendarEvents.ts
├── useCalendarInteractions.ts
├── useCalendarLocalization.ts
├── useCalendarStyling.ts
├── useCalendarTimeBounds.ts
├── useEventRegistration.ts
├── index.ts
└── __tests__/
    ├── useAvailabilityCheck.test.ts
    ├── useCalendarData.test.ts
    ├── useCalendarEvents.test.ts
    ├── useCalendarInteractions.test.ts
    ├── useCalendarLocalization.test.ts
    ├── useCalendarStyling.test.ts
    ├── useCalendarTimeBounds.test.ts
    └── useEventRegistration.test.ts
```

**Result: 9 files + 1 folder = much cleaner!** ✨

---

## Decision Guidelines

### Use `__tests__` Folder When:

- ✅ Directory has >5 source files
- ✅ You want to keep the main directory clean
- ✅ Tests will double the file count

### Use Co-location When:

- ✅ Directory has ≤5 source files
- ✅ Clutter isn't a concern
- ✅ Files are very closely related

---

## Recommendation for Your Project

Given your concerns about clutter, **I recommend using `__tests__` folders** for directories with multiple files:

1. **Keep existing co-located tests** (like in `calendar/utils/`) - they're fine
2. **For new tests in large directories**, use `__tests__` folders:
   - `calendar/hooks/__tests__/`
   - `calendar/components/__tests__/`
   - `edtech/progressReport/components/__tests__/`

This gives you the best of both worlds:

- Clean main directories
- Tests still close to source code
- Easy to find all tests

---

## Creating Your First `__tests__` Folder

Example for `calendar/hooks/`:

```bash
# Create the __tests__ folder
mkdir src/features/modules/calendar/hooks/__tests__

# Create your first test
# src/features/modules/calendar/hooks/__tests__/useCalendarData.test.ts
```

Jest will automatically find it! No config changes needed.

---

## Summary

**My recommendation based on your concern:**

- ✅ Use `__tests__` folders for directories with >5 files
- ✅ Keep co-location for small directories (≤5 files)
- ✅ Both patterns work with Jest automatically

This keeps your project clean while maintaining test proximity to source code.
