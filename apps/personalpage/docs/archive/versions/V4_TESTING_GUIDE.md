# V4 Migration - Testing Guide

## 🧪 Quick Testing Checklist

Follow these steps to verify the v4 migration is working correctly.

---

## ✅ **Test 1: Excel Import**

### Steps:

1. Start your development server
2. Navigate to `/projects/edtech/progressReport`
3. Click **Data Management** tab
4. Click **Process New Assessment Data**
5. Upload `stud_data3.xlsx`
6. Review the column preview
7. Click **Confirm Import**

### Expected Results:

- ✅ Import completes successfully
- ✅ Shows: "X students updated, Y assessments added"
- ✅ No errors in browser console
- ✅ Log shows "Processing Excel upload (v4)"

---

## ✅ **Test 2: Data Structure Verification**

### Option A: Via Export

1. In Data Management tab, click **Download Data**
2. Open the downloaded JSON file
3. Check the structure:

```json
{
  "metadata": {
    "schema_version": "4.0" // ✓ Should be 4.0
  },
  "students": [
    {
      "academic": {
        "year": "2025-2026", // ✓ Current year
        "enrolled_date": null // ✓ Should be null
      },
      "assessments": [
        {
          "type": "board_solving", // ✓ NOT "participation"
          "evaluation_details": {
            // ✓ NOT "summative_details"
            "percentage_score": 85
          },
          "assessment_id": "homework-nd1", // ✓ Has ID
          "assessment_title": "Homework ND1" // ✓ Has title
        }
      ]
    }
  ]
}
```

### Option B: Via Individual Files

1. Check `src/features/modules/edtech/progressReport/student-data/data/`
2. Open any student JSON file
3. Verify structure matches above

---

## ✅ **Test 3: Dashboard Display**

### Class View:

1. Click **Class View** tab
2. Select a class from dropdown
3. Verify:
   - ✅ All students appear
   - ✅ Assessment columns show data
   - ✅ No "undefined" or "NaN" values
   - ✅ Charts display correctly

### Student View:

1. Click **Student View** tab
2. Select a student
3. Verify:
   - ✅ Student profile loads
   - ✅ Assessment table shows all data
   - ✅ Timeline displays correctly
   - ✅ Test assessments show evaluation details

---

## ✅ **Test 4: Assessment Types**

### Check Assessment Type Mapping:

Open browser DevTools console and verify:

```javascript
// Should see these types (NOT old ones):
- "homework"        ✓
- "classwork"       ✓
- "summative"       ✓ (KD columns only)
- "test"            ✓ (SD columns)
- "diagnostic"      ✓
- "board_solving"   ✓ (NOT "participation")
```

---

## ✅ **Test 5: Filters and Charts**

1. Go to **Class View**
2. Test assessment type filters:
   - ✅ Filter by "Tests" (SD columns)
   - ✅ Filter by "Board Solving" (LNT columns)
   - ✅ Filter by "Homework"
3. Check distribution charts:
   - ✅ Charts render without errors
   - ✅ Data shows correctly
   - ✅ Tooltips display proper info

---

## ✅ **Test 6: New Assessment IDs**

1. Export data (Download Data button)
2. Search for `"assessment_id"`
3. Verify format:
   - ✅ `"homework-nd1"`, `"homework-nd2"`, etc.
   - ✅ `"test-sd1"`, `"test-sd2"`, etc.
   - ✅ `"board-solving-lnt1"`, etc.
   - ✅ `"diagnostic-1"`, `"diagnostic-2"`, etc.

---

## ✅ **Test 7: Evaluation Details**

1. Find a test assessment (SD column) in exported data
2. Verify structure:

```json
{
  "column": "SD1",
  "type": "test", // ✓ NOT "summative"
  "evaluation_details": {
    // ✓ NOT "summative_details"
    "percentage_score": 85,
    "myp_score": 6,
    "cambridge_score": 1
  }
}
```

---

## ✅ **Test 8: Multiple Imports**

Test duplicate handling:

1. Import `stud_data3.xlsx`
2. Note the number of assessments added
3. Import the same file again
4. Verify:
   - ✅ No duplicate assessments created
   - ✅ Existing assessments updated
   - ✅ "0 assessments added" or similar

---

## ✅ **Test 9: New Student Creation**

1. Add a new student to Excel file
2. Import the file
3. Verify:
   - ✅ New student created
   - ✅ Has v4 structure
   - ✅ Schema version is "4.0"
   - ✅ Academic year is "2025-2026"
   - ✅ enrolled_date is null
   - ✅ Assessments have evaluation_details

---

## ✅ **Test 10: Browser Console**

Throughout testing, monitor browser console:

**Good Signs:**

- ✅ "Processing Excel upload (v4)"
- ✅ "Excel processing successful (v4)"
- ✅ No errors or warnings

**Red Flags:**

- ❌ "summative_details is undefined"
- ❌ "Unknown assessment type: participation"
- ❌ Any schema validation errors

---

## 🐛 **Common Issues & Solutions**

### Issue: "summative_details is undefined"

**Cause:** Dashboard code still referencing old field name  
**Solution:** Check that all components use `evaluation_details`

---

### Issue: "participation" type not recognized

**Cause:** Old assessment not migrated  
**Solution:** Run `npx tsx scripts/migrateV3toV4.ts`

---

### Issue: SD columns showing as "summative"

**Cause:** Old data not migrated  
**Solution:** Re-import Excel or run migration script

---

### Issue: Academic year shows "2024-2025"

**Cause:** Using old v3 processor  
**Solution:** Verify API uses `StudentDataManagerV4`

---

## 📊 **Performance Testing**

### Large Dataset Test:

1. Import full dataset (75+ students)
2. Time the import process
3. Verify:
   - ✅ Completes in reasonable time (< 30 seconds)
   - ✅ No memory issues
   - ✅ All data processed correctly

---

## ✨ **Success Criteria**

Migration is successful if:

1. ✅ Excel imports create v4 data
2. ✅ Dashboard displays all data correctly
3. ✅ No console errors
4. ✅ All assessment types recognized
5. ✅ Filters and charts work
6. ✅ Exports produce valid v4 JSON
7. ✅ No "undefined" or "NaN" in UI
8. ✅ Schema version is "4.0"

---

## 🔄 **Rollback Plan**

If issues occur:

1. Stop using v4 system
2. Restore from backup:
   ```bash
   # Backups are in: backups/v3_backup_YYYY-MM-DD/
   ```
3. Update API to use `StudentDataManagerV3`
4. Report issues for debugging

---

## 📝 **Test Report Template**

```markdown
## V4 Migration Test Report

**Date:** [DATE]
**Tester:** [NAME]
**Environment:** [dev/production]

### Tests Completed:

- [ ] Test 1: Excel Import
- [ ] Test 2: Data Structure
- [ ] Test 3: Dashboard Display
- [ ] Test 4: Assessment Types
- [ ] Test 5: Filters and Charts
- [ ] Test 6: Assessment IDs
- [ ] Test 7: Evaluation Details
- [ ] Test 8: Multiple Imports
- [ ] Test 9: New Student Creation
- [ ] Test 10: Browser Console

### Issues Found:

[List any issues here]

### Overall Result:

[ ] ✅ PASS - All tests successful
[ ] ⚠️ PARTIAL - Some issues found
[ ] ❌ FAIL - Critical issues

### Notes:

[Additional observations]
```

---

## 🎯 **Next Steps After Testing**

1. ✅ If all tests pass → Use v4 in production
2. ✅ Archive v3 backups
3. ✅ Update documentation
4. ✅ Train users on new system
5. ✅ Monitor for issues

---

**Testing Status:** Ready to Test  
**Expected Duration:** 15-20 minutes  
**Difficulty:** Easy
