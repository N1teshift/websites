# Integration Instructions - Cambridge Missions

**How to integrate the new Objectives tab into your Progress Report**

---

## Current Status

✅ **All Components Built:**

- Mission Creator UI
- Mission types and utilities
- Tab container with both old and new systems

📝 **Integration Needed:**
The `ObjectivesTabContainer` needs to be imported into your main Progress Report page.

---

## Integration Steps

### Find Your Progress Report Main Component

The main page is likely in:

- `src/features/modules/edtech/progressReport/ProgressReportPage.tsx` or
- `src/pages/progress-report.tsx` or similar

### Current Setup (Likely)

Your page probably imports and uses `ObjectivesSection` directly:

```typescript
import ObjectivesSection from './components/sections/ObjectivesSection';

// In render:
<ObjectivesSection students={students} onDataChange={handleDataChange} />
```

### New Setup (Replace with)

```typescript
import { ObjectivesTabContainer } from './components/sections/ObjectivesTabContainer';

// In render:
<ObjectivesTabContainer students={students} onDataChange={handleDataChange} />
```

### That's It!

The `ObjectivesTabContainer` includes both:

1. **Mission Creator Tab** (new Cambridge objectives system)
2. **Test Completion Tab** (your existing ObjectivesSection)

So all existing functionality is preserved!

---

## What You'll See

### Tab 1: Mission Creator (Default)

- Priority-grouped students (Critical, Moderate, Minor)
- Filter by class and strand
- Select objectives per student
- Create missions with deadlines

### Tab 2: Test Completion

- Your existing SD/KD test completion tracker
- All current missions and grade inputs
- Completely unchanged

---

## Testing Checklist

Before making the change:

1. ✅ Backup your Progress Report page file
2. ✅ Make sure dev server is running
3. ✅ Note current Objectives tab functionality

After making the change:

1. ✅ Objectives tab should have two sub-tabs now
2. ✅ "Test Completion" tab should work exactly as before
3. ✅ "Mission Creator" tab should show new UI
4. ✅ Students should be grouped by missing points
5. ✅ Creating a mission should open a dialog

---

## Rollback (If Needed)

If anything breaks, just revert the import:

```typescript
// Back to original:
import ObjectivesSection from './components/sections/ObjectivesSection';
<ObjectivesSection students={students} onDataChange={handleDataChange} />
```

---

## Data Persistence Note

⚠️ **Important:**

- Missions created now will be stored in the React state
- They will NOT persist to JSON yet (Phase 5 needed)
- This is expected for testing Phase 3!
- Once Phase 5 (Excel import) is complete, missions will save properly

---

## Need Help?

If you can't find your main Progress Report component, share the file structure:

```bash
ls src/features/modules/edtech/progressReport/
ls src/pages/ | grep progress
```

Or search for where `ObjectivesSection` is currently imported:

```bash
grep -r "ObjectivesSection" src/
```

---

**Quick Start:**  
Just replace the import and component usage in your Progress Report page!
