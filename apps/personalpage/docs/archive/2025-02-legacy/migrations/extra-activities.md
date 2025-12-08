# Extra Activities Migration - v4.50 to v4.51

## Overview

Migration to add mandatory consultation and special math club tracking to the student database.

**Date**: 2025-10-26  
**Source File**: `master_student_data_main_v4_50.json`  
**Target File**: `master_student_data_main_v4_51.json`  
**Script**: `scripts/addExtraActivities.ts`

## Data Sources

### Excel File: `stud_data.xlsx`

1. **Kons_P Sheet** (Mandatory Monday Consultations - 1st Semester)
   - 17 students required to attend mandatory consultation sessions
   - Schedule: Every Monday during first semester
   - Initial attendance data: October 20, 2025

2. **Smals Sheet** (Special Math Club)
   - 15 students participating in the special math club
   - Club sessions tracked separately from regular classes
   - Initial attendance data: October 20, 2025

## Changes Made

### 1. Student Profile Attributes

Added two new boolean flags to `profile.learning_attributes`:

```typescript
learning_attributes: {
  ...existing_attributes,
  mandatory_consultation?: boolean,  // true for Kons_P students
  special_math_club?: boolean        // true for Smals students
}
```

### 2. Attendance Containers

Created two new attendance tracking arrays at student level:

#### Mandatory Consultation Attendance

```typescript
mandatory_consultation_attendance?: Array<{
  date: string;           // YYYY-MM-DD format
  status: 'present' | 'absent';
  added: string;          // YYYY-MM-DD format
}>
```

#### Math Club Attendance

```typescript
math_club_attendance?: Array<{
  date: string;           // YYYY-MM-DD format
  status: 'present' | 'absent';
  added: string;          // YYYY-MM-DD format
}>
```

### 3. Attendance Status Mapping

- **Empty cell** in Excel → `"status": "present"`
- **"n"** in Excel → `"status": "absent"`

## Migration Results

### Matching Statistics

**Mandatory Consultation (Kons_P)**:

- Total students in Excel: 17
- Successfully matched: 17 ✓
- Match rate: 100%

**Special Math Club (Smals)**:

- Total students in Excel: 15
- Successfully matched: 15 ✓
- Match rate: 100%

### Student Matching Logic

The migration used sophisticated matching with three fallback levels:

1. **Exact Match**: First name, last name, and class all match exactly
2. **Fuzzy Last Name**: Allows up to 2 character differences (Levenshtein distance ≤ 2)
3. **Name Only**: Matches by name only, ignoring class (for data quality issues)

#### Class Name Mapping

- Excel "Gim" → JSON "M. A. Gimbutienė"
- Excel "Vyd" → JSON "Vydūnas"
- Excel "Grei" → JSON "A. J. Greimas"
- Excel "Vei" → JSON "I. Veisaitė"

## Matched Students

### Mandatory Consultation (17 students)

1. Agota Akromė (GIM-AAKR-001) - Present
2. Ona Balžekaitė (VYD-OBAL-003) - Absent
3. Emilė Guzikauskaitė (VYD-EGUZ-004) - Present
4. Smiltė Jankauskaitė (VYD-SJAN-005) - Present
5. Bonifacijus Kiela (VEI-BKIE-007) - Present
6. Martyna Kleinaitė (GIM-MKLE-007) - Present
7. Vanesa Lapinskaitė (GIM-VLAP-010) - Present
8. Teodoras Narbutas (GIM-TNAR-011) - Present
9. Jokūbas Petrauskas (GIM-JPET-012) - Present
10. Jurgis Priedytis (GRE-JPRI-011) - Present
11. Eglė Rabašauskaitė (GIM-ERAB-013) - Present
12. Domantas Raguckas (GRE-DRAG-012) - Present
13. Gabija Rinkūnaitė (VYD-GRIN-009) - Present
14. Mark Šaltis (VYD-MŠAL-018) - Present
15. Vytis Tirius (GIM-VTIR-014) - Present
16. Rokas Ulčinas (VYD-RULČ-014) - Present
17. Kristupas Vinča (GIM-KVIN-015) - Present

### Special Math Club (15 students)

1. Dovydas Rimas (GRE-DRIM-014) - Absent
2. Lukas Šegžda (GRE-LŠEG-018) - Absent
3. Jokūbas Rusinas (VEI-JRUS-017) - Absent
4. Rokas Baltrėnas (VEI-RBAL-003) - Absent
5. Vėjas Akstinas (GRE-VAKS-002) - Absent
6. Viktorija Morkūnaitė (VEI-VMOR-010) - Absent
7. Sofija Keizytė (GIM-SKEZ-006) - Absent
8. Justas Lukšė (VYD-JLUK-007) - Absent
9. Augustas Rukavičius (VEI-ARUK-016) - Absent
10. Adonis Giedraitis (VEI-AGIE-006) - Absent
11. Gabrielė Sadeckaitė (GRE-GSAD-015) - Absent
12. Motiejus Rusakevičius (VYD-MRUS-010) - Absent
13. Liepa Tamutytė (VYD-LTAM-013) - Absent
14. Gustas Kalvaitis (GIM-GKAL-005) - Absent
15. Elzė Rimaitė (VEI-ERIM-014) - Absent

## Data Quality Notes

### Issues Resolved

1. **Sofija Keizytė**: Excel had spelling "Keizytė", JSON had "Kezytė" - matched using fuzzy logic
2. **Gustas Kalvaitis**: Excel listed as "Grei" class, actually in "Gim" class - matched using name-only fallback
3. **Bonifacijus Kiela**: Excel had "Bonifacijus", JSON had "Bonifacijus Marijus" - matched using partial name matching

## Technical Details

### Normalization

- Removes diacritics (ė→e, ū→u, etc.)
- Converts to lowercase
- Trims whitespace

### Levenshtein Distance

Used for fuzzy last name matching to handle typos and spelling variations.

## Database Schema Update

**Schema Version**: Updated metadata.export_version from `v4.10` to `v4.11`

## Usage

To run the migration:

```bash
npx tsx scripts/addExtraActivities.ts
```

The script:

1. Reads `master_student_data_main_v4_50.json`
2. Reads `stud_data.xlsx` (Kons_P and Smals sheets)
3. Matches students using intelligent fuzzy matching
4. Adds profile flags and attendance data
5. Writes `master_student_data_main_v4_51.json`

## Future Considerations

- Additional attendance dates can be imported by modifying the script to parse additional date columns
- The attendance tracking structure supports multiple entries per student
- Can be extended to track additional extracurricular activities
- May want to add reasons for absences (authorized vs unauthorized)
- Could add notification system for mandatory consultation absences
