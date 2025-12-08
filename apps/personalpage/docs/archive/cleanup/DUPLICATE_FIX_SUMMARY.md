# Duplicate Student Fix Summary

## 🐛 Problem

A duplicate student "Julija" was created during Excel import because of inconsistent name spellings across Excel sheets:

- **Grei_S sheet**: "Julija Krungelevičiūtė" ✅ (correct - with 'e')
- **Grei_C/P sheets**: "Julija Krunglevičiūtė" ❌ (typo - missing 'e')

The system used **exact string matching**, so when it encountered the typo, it created a new student instead of updating the existing one.

**Result:** 76 students instead of 75, with Julija's data split between two records.

---

## ✅ Solution

### 1. Immediate Fix: Merged Duplicate Data

Created `scripts/mergeDuplicateStudent.ts` to:

- Merge assessments from the incorrect record into the correct one
- Delete the duplicate file
- Successfully merged 40 assessments

**Usage:**

```bash
npx tsx scripts/mergeDuplicateStudent.ts "CorrectLastName" "IncorrectLastName" "FirstName"
```

### 2. Permanent Fix: Fuzzy Name Matching

Implemented fuzzy matching using **Levenshtein distance algorithm**:

**New file:** `src/features/modules/edtech/progressReport/student-data/utils/fuzzyNameMatcher.ts`

- Calculates similarity score between names (0 to 1)
- Uses 90% similarity threshold (0.9)
- Logs warning when fuzzy match is used

**Updated:** `src/features/modules/edtech/progressReport/student-data/processors/dataProcessorV4.ts`

- Enhanced `findStudent()` method
- First tries exact match
- Falls back to fuzzy matching if no exact match
- Logs warning to alert about potential typos

---

## 🎯 How It Works Now

```
Excel: "Julija Krunglevičiūtė" (typo)
       ↓
1. Try exact match → Not found
2. Try fuzzy match → Found "Julija Krungelevičiūtė" (similarity: 0.95)
3. ⚠️ Log warning about typo
4. ✅ Use existing student (no duplicate!)
```

**Console Output:**

```
⚠️ Fuzzy name match detected (possible typo in Excel)
  excelName: "Julija Krunglevičiūtė"
  matchedStudent: "Julija Krungelevičiūtė"
  similarityScore: 0.95
  suggestion: Please verify spelling in Excel file to avoid duplicates
```

---

## 🔬 Technical Details

### Levenshtein Distance

Measures minimum number of single-character edits (insertions, deletions, substitutions) needed to change one string into another.

**Example:**

- "Krunglevičiūtė" → "Krungelevičiūtė"
- Distance: 1 (insert 'e' after 'g')
- Similarity: 1 - (1 / 15) = 0.93 ✅ Above 0.9 threshold

### Match Criteria

- **Exact match:** Always preferred
- **Fuzzy match:** If similarity ≥ 90%
- **First name exact + last name 85%:** Also accepted
- **No match:** Creates new student

---

## 📊 Results

### Before Fix:

- 76 students (1 duplicate)
- Julija's data split across 2 records
- Risk of future duplicates

### After Fix:

- 75 students ✅
- All Julija's data merged ✅
- Future typos handled automatically ✅
- Warnings logged for manual verification ✅

---

## 🚀 Next Steps for User

### Immediate:

1. ✅ Upload `progress_report_data_FIXED.json` to dashboard
2. ✅ Verify Julija now has all her data (EXT + other columns)

### Future:

1. Fix the typo in your Excel file (Grei_C and Grei_P sheets)
2. Watch for fuzzy match warnings in console logs
3. Correct any typos in Excel when warnings appear

---

## 🛠️ Scripts Created

1. **`scripts/mergeDuplicateStudent.ts`**
   - Merge duplicate student records
   - Usage: `npx tsx scripts/mergeDuplicateStudent.ts <correct> <incorrect> <firstName>`

2. **`scripts/exportStudentDataV4.ts`**
   - Export all students in v4 format
   - Usage: `npx tsx scripts/exportStudentDataV4.ts <output-file>`

---

**Status:** ✅ Fixed and tested  
**Date:** November 8, 2025  
**Affected Student:** Julija Krungelevičiūtė  
**Assessments Recovered:** 40
