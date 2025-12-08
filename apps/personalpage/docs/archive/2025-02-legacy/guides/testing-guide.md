# Cambridge Missions - Complete Testing Guide

**Version:** 1.0  
**Date:** November 9, 2025  
**Status:** Ready for Testing

---

## 🎯 Testing Overview

This guide provides step-by-step instructions for testing the complete Cambridge Missions system.

### System Components to Test:

1. ✅ Mission Creator (Phase 3)
2. ✅ My Missions View (Phase 4)
3. ✅ PD Assessment Import & Auto-Update (Phase 5)
4. ✅ KD Assessment Import & Auto-Update (Phase 6)
5. ✅ PD Mappings Management (Phase 7)

---

## 🚀 Getting Started

### Prerequisites

```bash
# Make sure dev server is running
npm run dev

# Verify you're using the latest data file
# Should be: data_2025-11-09.json
```

### Integration Step

Replace `ObjectivesSection` with `ObjectivesTabContainer` in your Progress Report page:

```typescript
// Before:
import ObjectivesSection from './components/sections/ObjectivesSection';
<ObjectivesSection students={students} onDataChange={handleDataChange} />

// After:
import { ObjectivesTabContainer } from './components/sections/ObjectivesTabContainer';
<ObjectivesTabContainer students={students} onDataChange={handleDataChange} />
```

---

## 📋 Test Suite 1: Mission Creator

### Test 1.1: View Students Needing Missions

**Steps:**

1. Navigate to Progress Report → Objectives Tab
2. Click "Mission Creator" tab (should be default)
3. Verify students are grouped by priority:
   - 🔴 Critical (≥5 missing points)
   - 🟡 Moderate (3-5 missing points)
   - 🟢 Minor (<3 missing points)

**Expected:**

- Students with unmastered Cambridge objectives appear
- Missing points calculated correctly
- Objectives color-coded: 🔴 (0), 🟡 (0.5), 🟢 (1)

### Test 1.2: Filter by Class

**Steps:**

1. In Mission Creator, select a specific class from dropdown
2. Verify only that class's students appear

**Expected:**

- Filter works correctly
- Summary stats update

### Test 1.3: Filter by Strand

**Steps:**

1. Select a specific strand (e.g., "Number: Integers")
2. Verify only objectives from that strand appear

**Expected:**

- Students with no objectives in that strand disappear
- Missing points recalculated for filtered objectives

### Test 1.4: Sort Students

**Steps:**

1. Toggle between "Missing Points" and "Name" sorting

**Expected:**

- Students reorder correctly
- Priority groups maintain their structure

### Test 1.5: Create a Mission

**Steps:**

1. Find a student card
2. Select 2-3 unmastered objectives (checkboxes)
3. Click "Create Mission"
4. Dialog appears
5. Review auto-generated title (e.g., "Master Algebra Basics")
6. Optionally set deadline and add notes
7. Click "Create Mission"

**Expected:**

- Dialog shows selected objectives grouped by strand
- Total missing points displayed
- PD assignments shown (e.g., "PD4" for 9Ae.01)
- Mission creates successfully
- Success feedback appears

---

## 📚 Test Suite 2: My Missions View

### Test 2.1: View All Missions

**Steps:**

1. Click "My Missions" tab
2. Verify created missions appear

**Expected:**

- Missions displayed as cards
- Status badges visible (🟡 In Progress)
- Progress bars showing 0% initially
- Summary stats at top

### Test 2.2: Filter by Status

**Steps:**

1. Click status filter buttons
2. Toggle between In Progress, Not Started, Completed, Cancelled

**Expected:**

- Missions filter correctly
- Card count updates

### Test 2.3: Filter by Class

**Steps:**

1. Select a specific class from dropdown

**Expected:**

- Only that class's missions appear

### Test 2.4: Search Missions

**Steps:**

1. Type student name in search box
2. Type mission title
3. Type objective code

**Expected:**

- Results filter in real-time
- "Showing X of Y missions" updates

### Test 2.5: View Mission Details

**Steps:**

1. Click "View Details" on a mission card
2. Modal opens showing:
   - All objectives grouped by strand
   - Initial vs current scores
   - Assessment attempts (empty initially)
   - Missing points progress

**Expected:**

- Detailed view shows all objective info
- Can close modal

### Test 2.6: Edit Mission Deadline

**Steps:**

1. On a mission card, click 📅 button
2. Dialog opens
3. Select new date
4. Save

**Expected:**

- Deadline updates on card
- Overdue indicator appears if past

### Test 2.7: Manually Complete Mission

**Steps:**

1. Click ✅ button on mission card
2. Confirm action

**Expected:**

- Status changes to "Completed"
- Card updates to green
- Appears in Completed filter

### Test 2.8: Cancel Mission

**Steps:**

1. Click ❌ button
2. Confirm cancellation

**Expected:**

- Confirmation dialog appears
- Mission status changes to Cancelled
- Card grayed out

---

## 📥 Test Suite 3: PD Assessment Import

### Test 3.1: Prepare Test Excel

**Create test columns in your \_S sheet:**

```
Column Name              | Student1 | Student2
------------------------|----------|----------
PD4_2025-11-10          | (empty)  | (empty)
PD4 P_2025-11-10        | 7        | 8
PD4 MYP_2025-11-10      | 5        | 6
PD4 C_2025-11-10        | 1        | 0.5
```

### Test 3.2: Import PD Data

**Steps:**

1. Add PD columns to your Excel file
2. Enter scores for students with active missions
3. Import Excel data (your usual process)
4. Navigate back to My Missions

**Expected:**

- Mission cards update automatically
- Progress bar increases
- "Attempts" section in mission details shows new assessment
- Cambridge objectives table updates
- If all objectives assessed → Mission auto-completes!

### Test 3.3: Verify Auto-Update

**Check:**

1. Mission status (should auto-complete if all objectives done)
2. Missing points reduced
3. Objective scores updated in mission details
4. History shows PD assessment with date

---

## 📊 Test Suite 4: KD Assessment Import

### Test 4.1: Prepare KD Test Excel

**Create test columns:**

```
Column Name          | Student1 | Student2
--------------------|----------|----------
KD3                 | 8        | 7
KD3 P               | 85       | 75
KD3 MYP             | 6        | 5
KD3 C1              | 1        | 0.5
KD3 C2              | 1        | 1
KD3 C3              | 0.5      | 0
KD3 C4              | 1        | 1
```

### Test 4.2: Import KD Data

**Steps:**

1. Add KD columns to Excel
2. Import data
3. Check Cambridge Objectives table in Class View

**Expected:**

- Each C column maps to correct objective:
  - KD3 C1 → 9Np.01
  - KD3 C2 → 9NF.06
  - KD3 C3 → 9NF.05
  - KD3 C4 → 9Np.02
- Objectives update independently
- Missions with these objectives update
- History tracks individual assessments

---

## 🔧 Test Suite 5: PD Mappings Manager

### Test 5.1: View PD Mappings

**Steps:**

1. Navigate to Data Management tab (if you have one)
2. Use `PDMappingsManager` component
3. Or test standalone

**Expected:**

- All 54 PD mappings displayed
- Summary stats correct
- Can search by PD number or objective code

### Test 5.2: Search Mappings

**Steps:**

1. Search "PD1"
2. Search "9Ni.01"
3. Search "Algebra"

**Expected:**

- Results filter correctly
- Shows matching count

### Test 5.3: Expand Mapping Details

**Steps:**

1. Click on any PD mapping
2. View objectives

**Expected:**

- Objectives list expands
- Usage instructions shown
- Can collapse

---

## 🎨 Test Suite 6: UI/UX

### Test 6.1: Responsive Design

**Steps:**

1. Resize browser window
2. Test on different screen sizes

**Expected:**

- Mobile: Single column layouts
- Tablet: 2-column grids
- Desktop: 3-column grids
- No horizontal scroll
- Readable text sizes

### Test 6.2: Color Coding

**Verify colors are consistent:**

- 🔴 Red: Score 0 (not mastered)
- 🟡 Yellow: Score 0.5 (partial)
- 🟢 Green: Score 1 (mastered)
- 🔵 Blue: In progress
- ⚪ Gray: Not started

### Test 6.3: Interactive Elements

**Test all buttons/inputs:**

- Hover states work
- Focus outlines visible
- Click feedback
- Disabled states clear

---

## ⚠️ Error Scenarios to Test

### Scenario 1: No Missions

**Steps:**

1. View My Missions with no missions created

**Expected:**

- Empty state message
- Helpful guidance to create missions

### Scenario 2: No Students Needing Missions

**Steps:**

1. Filter to a class with all objectives mastered

**Expected:**

- Success message: "No students need missions"
- Clear explanation

### Scenario 3: Invalid Date

**Steps:**

1. Try to set deadline in past

**Expected:**

- Date picker prevents past dates

### Scenario 4: Missing Excel Columns

**Steps:**

1. Import Excel without PD columns

**Expected:**

- No errors
- System continues normally

---

## 🐛 Known Issues / Limitations

### Current Limitations:

1. ✅ Missions stored in React state only (until data saved)
2. ✅ No bulk mission creation yet (Phase 3 has framework, needs UI)
3. ✅ PD mappings are read-only (no add/edit/delete yet)
4. ✅ Mission history doesn't persist between sessions (needs JSON export)

### To Be Fixed:

- None currently - all phases complete!

---

## 📝 Regression Tests

Run these after any changes:

### Quick Smoke Test (5 min):

1. ✅ Create a mission
2. ✅ View it in My Missions
3. ✅ View details
4. ✅ Edit deadline
5. ✅ Mark complete

### Full Regression (15 min):

1. ✅ All Test Suite 1 (Mission Creator)
2. ✅ All Test Suite 2 (My Missions)
3. ✅ Test Suite 3.1-3.2 (PD Import)
4. ✅ Test Suite 6.1-6.2 (UI/UX)

---

## 🎯 Success Criteria

### Phase 3 Success:

- ✅ Can view students grouped by priority
- ✅ Can filter by class and strand
- ✅ Can select objectives and create missions
- ✅ Missions appear with correct data

### Phase 4 Success:

- ✅ Can view all missions
- ✅ Can filter and search missions
- ✅ Can view detailed mission info
- ✅ Can edit deadlines
- ✅ Can manually complete/cancel missions

### Phase 5 Success:

- ✅ PD columns detected in Excel
- ✅ Cambridge objectives update automatically
- ✅ Missions update automatically
- ✅ Missions auto-complete when all objectives assessed

### Phase 6 Success:

- ✅ KD columns with multiple C scores detected
- ✅ Each C score maps to correct objective
- ✅ Missions update from KD assessments

### Phase 7 Success:

- ✅ Can view all PD mappings
- ✅ Can search mappings
- ✅ Usage instructions clear

---

## 🚨 Report Issues

If you find bugs, note:

1. What you were doing
2. What you expected
3. What actually happened
4. Browser/screen size
5. Console errors (F12 → Console)

---

## 🎉 All Tests Pass?

Congratulations! The Cambridge Missions system is fully operational.

**Next Steps:**

1. Start using Mission Creator for real students
2. Import actual PD/KD assessment data
3. Monitor mission completion rates
4. Adjust workflows as needed

**Need Help?**

- Check `docs/archive/cambridge/CAMBRIDGE_MISSIONS_IMPLEMENTATION_PLAN.md`
- Check `docs/archive/cambridge/CAMBRIDGE_MISSIONS_SUMMARY.md`
- Check `../guides/integration-instructions.md`

---

**Happy Testing! 🚀**
