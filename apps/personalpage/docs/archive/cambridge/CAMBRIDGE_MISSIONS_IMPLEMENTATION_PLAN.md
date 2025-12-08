# Cambridge Learning Objectives Missions - Complete Implementation Plan

**Date:** November 9, 2025  
**Status:** Planning Complete - Ready for Implementation

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Assessment Mappings](#assessment-mappings)
3. [Data Structures](#data-structures)
4. [Excel Structure](#excel-structure)
5. [Mission Workflow](#mission-workflow)
6. [UI/UX Design](#uiux-design)
7. [Implementation Phases](#implementation-phases)
8. [Technical Specifications](#technical-specifications)

---

## 1. System Overview

### Purpose

Automatically identify students with unmastered Cambridge learning objectives and create targeted missions for reassessment and mastery.

### Key Concepts

- **PD Assessments**: "Papildomas Darbas" (Additional Work) - custom assessments for specific learning objectives
- **Mission**: Collection of learning objectives a student needs to master
- **Missing Points**: `1 - current_score` (e.g., score 0 = 1 point missing, score 0.5 = 0.5 points missing)
- **Not Mastered**: Score < 1 (includes both 0 and 0.5)

### Mission Lifecycle

```
Not Started → In Progress → Completed
     ↓             ↓            ↓
  Created    Select LOs   Auto-complete
            Start Mission  when assessed
```

---

## 2. Assessment Mappings

### 2.1 PD Mappings (Global - One PD per Objective)

**Critical:** PD numbers are GLOBAL - PD1 always tests the same objective(s) for ALL students.

```typescript
PD1  → 9Ni.01, 9Ni.04  // Multiple objectives per PD
PD2  → 9Ni.03
PD3  → 9Ni.02

PD4  → 9Ae.01
PD5  → 9Ae.03
PD6  → 9Ae.02
PD7  → 9Ae.04
PD12 → 9Ae.05
PD13 → 9Ae.06
PD14 → 9Ae.07

PD8  → 9Np.01
PD9  → 9NF.06
PD10 → 9NF.05
PD11 → 9Np.02

PD15 → 9Gg.09
PD16 → 9Gg.07
PD17 → 9Gg.08
PD18 → 9Gg.11
PD19 → 9Gg.10
PD23 → 9Gg.01
PD24 → 9Gg.02
PD25 → 9Gg.03
PD49 → 9Gg.04
PD50 → 9Gg.05
PD51 → 9Gg.06

PD20 → 9Ss.01
PD21 → 9Ss.05
PD22 → 9Ss.02
PD52 → 9Ss.03
PD53 → 9Ss.05
PD54 → 9Ss.04

PD26 → 9NF.01
PD27 → 9NF.02
PD28 → 9NF.03
PD36 → 9NF.08
PD37 → 9NF.07

PD29 → 9As.01
PD30 → 9As.02
PD31 → 9As.03
PD32 → 9As.04
PD33 → 9As.05
PD34 → 9As.06
PD35 → 9As.07

PD38 → 9Sp.01
PD39 → 9Sp.02
PD40 → 9Sp.03
PD41 → 9Sp.04

PD42 → 9Gp.01
PD43 → 9Gp.02
PD44 → 9Gp.03
PD45 → 9Gp.04
PD46 → 9Gp.05
PD47 → 9Gp.06
PD48 → 9Gp.07
```

### 2.2 KD Mappings (Future Summative Assessments)

```typescript
KD1  → 9Ni.01, 9Ni.02, 9Ni.03
KD2  → 9Ae.01, 9Ae.02, 9Ae.03, 9Ae.04
KD3  → 9Np.01, 9NF.06, 9NF.05, 9Np.02
KD4  → 9Ae.05, 9Ae.06, 9Ae.07
KD5  → 9Gg.09, 9Gg.07, 9Gg.08, 9Gg.11, 9Gg.10
KD6  → 9Ss.01, 9Ss.02, 9Ss.05
KD7  → 9Gg.01, 9Gg.02, 9Gg.03
KD8  → 9NF.01, 9NF.02, 9NF.03
KD9  → 9As.01, 9As.02, 9As.03
KD10 → 9As.04, 9As.05, 9As.06, 9As.07
KD11 → 9NF.08, 9NF.07
KD12 → 9Sp.01, 9Sp.02, 9Sp.03, 9Sp.04
KD13 → 9Gp.01, 9Gp.02, 9Gp.03, 9Gp.04, 9Gp.05, 9Gp.06, 9Gp.07
KD14 → 9Gg.04, 9Gg.05, 9Gg.06
KD15 → 9Ss.03, 9Ss.04
```

**KD Excel Structure:**

- Each objective gets its own C column: `KD3 C1`, `KD3 C2`, `KD3 C3`, `KD3 C4`
- Plus: `KD3 P` (points), `KD3 MYP` (MYP level), `KD3` (final grade)

---

## 3. Data Structures

### 3.1 Top-Level JSON Structure

```json
{
  "metadata": {
    "exported_at": "2025-11-09T...",
    "total_students": 75,
    "schema_version": "5.1"
  },

  "pd_mappings": {
    "PD1": ["9Ni.01", "9Ni.04"],
    "PD2": ["9Ni.03"],
    "PD3": ["9Ni.02"],
    "PD4": ["9Ae.01"],
    ...
  },

  "kd_mappings": {
    "KD1": ["9Ni.01", "9Ni.02", "9Ni.03"],
    "KD2": ["9Ae.01", "9Ae.02", "9Ae.03", "9Ae.04"],
    ...
  },

  "students": [ ... ]
}
```

### 3.2 Mission Object Structure

```json
{
  "mission_id": "mission_123",
  "title": "Master Algebra Basics",
  "type": "cambridge_objectives",
  "student_id": "GRE-ANDR-001",
  "status": "in_progress",
  "deadline": "2025-11-20",

  "cambridge_objectives": {
    "9Ae.01": {
      "initial_score": 0,
      "current_score": 0,
      "pd_assessment": "PD4",
      "last_updated": "2025-10-21",
      "attempts": [
        {
          "date": "2025-11-10",
          "score": 0.5,
          "assessment": "PD4.1",
          "points": 5,
          "myp": 4
        }
      ]
    },
    "9Ae.03": {
      "initial_score": 0.5,
      "current_score": 0.5,
      "pd_assessment": "PD5",
      "last_updated": "2025-10-20",
      "attempts": []
    }
  },

  "created_date": "2025-11-08",
  "started_date": "2025-11-08",
  "completed_date": null,
  "missing_points_initial": 1.5,
  "missing_points_current": 1.5
}
```

### 3.3 Student Cambridge Objectives (Existing)

```json
{
  "curriculum_progress": {
    "cambridge_objectives": {
      "9Ae.01": {
        "current_score": 0,
        "last_updated": "2025-10-21",
        "history": [{ "score": 0, "date": "2025-10-21", "assessment": "SD4" }]
      }
    },
    "cambridge_objectives_summary": {
      "total": 54,
      "mastered": 5,
      "partial": 3,
      "not_mastered": 8,
      "not_assessed": 38
    }
  }
}
```

---

## 4. Excel Structure

### 4.1 PD Assessment Challenge - NEEDS DECISION

**Problem:** PD assessments happen on different dates per student (unlike SD/KD).

**Options Proposed:**

#### Option A: Date in Column Name

```
Headers: PD3P.1_2025-10-21 | PD3MYP.1_2025-10-21 | PD3C.1_2025-10-21
```

#### Option B: Separate PD Sheet ⭐ RECOMMENDED

```
Sheet: Vyd_PD

Student       | PD3 Date   | PD3 P | PD3 MYP | PD3 C | PD5 Date   | PD5 P | ...
Monika A.     | 2025-10-21 | 7     | 5       | 1     | 2025-10-22 | 8     | ...
Adomas B.     | 2025-10-23 | 6     | 4       | 0.5   |            |       | ...
```

#### Option C: Date Column per PD Group

```
Headers: PD3 Date | PD3 P | PD3 MYP | PD3 C | PD5 Date | PD5 P | ...
```

#### Option D: Single Log Sheet

```
Sheet: PD_Log

Date       | Student    | Class   | PD_Number | Points | MYP | Cambridge
2025-10-21 | Monika A.  | Vydūnas | PD3       | 7      | 5   | 1
```

**DECISION NEEDED:** Which Excel structure to use for PD assessments?

### 4.2 PD Columns Pattern

For attempts tracking:

- First attempt: `PD3 P.1`, `PD3 MYP.1`, `PD3 C.1`
- Second attempt: `PD3 P.2`, `PD3 MYP.2`, `PD3 C.2`
- Third attempt: `PD3 P.3`, `PD3 MYP.3`, `PD3 C.3`

### 4.3 KD Columns Structure

Example: KD3 tests 4 objectives

```
KD3 | KD3 P | KD3 MYP | KD3 C1 | KD3 C2 | KD3 C3 | KD3 C4
 8  |   7   |    6    |   1    |  0.5   |   1    |   1
```

Where:

- `KD3` = Final grade
- `KD3 P` = Total points
- `KD3 MYP` = MYP level
- `KD3 C1` = Score for 1st mapped objective
- `KD3 C2` = Score for 2nd mapped objective
- etc.

---

## 5. Mission Workflow

### 5.1 Mission States

```
NOT_STARTED (draft)
    ↓ Teacher selects objectives & starts
IN_PROGRESS
    ↓ Student completes all assessments OR teacher marks complete
COMPLETED
```

### 5.2 Creation Workflow

```
1. System Analysis:
   - Calculate missing points per student
   - Group by strand/unit
   - Show in Mission Creator view

2. Teacher Selection:
   - View student card with unmastered objectives
   - Select objectives for mission
   - Mission auto-named: "Custom Mission 1"

3. Mission Start:
   - Teacher reviews selection
   - Names mission (e.g., "Master Algebra Basics")
   - Sets deadline
   - Clicks "Start Mission"
   - Status → IN_PROGRESS

4. System Actions:
   - Create mission object
   - Show PD numbers needed
   - Add to missions list
```

### 5.3 Assessment & Completion

```
1. Student takes PD assessment
2. Teacher enters in Excel
3. Import Excel data
4. System:
   - Detects PD columns
   - Looks up mapping (PD4 → 9Ae.01)
   - Updates cambridge_objectives
   - Updates mission.cambridge_objectives[9Ae.01]
   - Checks if ALL objectives assessed
   - If yes → Auto-complete mission

5. Mission displays results:
   - Show before/after scores
   - Highlight improvements
   - Calculate mastery achieved
```

### 5.4 Bulk Mission Creation

```
1. Define objectives template
2. System finds students needing these objectives
3. Teacher selects students
4. Set common deadline
5. Create missions for all selected
6. Show: "Created 12 missions"
```

---

## 6. UI/UX Design

### 6.1 Objectives Tab Redesign

```
┌────────────────────────────────────────────┐
│ 📊 Objectives                              │
├────────────────────────────────────────────┤
│ [Mission Creator] [My Missions]  ← Tabs    │
├────────────────────────────────────────────┤
│                                            │
│ Active view content here                   │
│                                            │
└────────────────────────────────────────────┘
```

### 6.2 Mission Creator View

```
┌─────────────────────────────────────────────────────┐
│ 🎯 Mission Creator                                  │
├─────────────────────────────────────────────────────┤
│ Filter: [All Classes ▼] [All Strands ▼]            │
│ Sort: [Missing Points ▼]                            │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 🔴 Critical (≥5 missing points) - 8 students       │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ 📋 Konstantinas Andriulis (8 A. J. Greimas) │   │
│ │    Missing: 4.0 points                      │   │
│ │    Last assessed: 2025-10-21                │   │
│ │                                              │   │
│ │    Number: Integers                          │   │
│ │    ☐ 9Ni.01 (Unit 1.1) → PD1: 0/1 🔴       │   │
│ │    ☐ 9Ni.02 (Unit 1.3) → PD3: 0/1 🔴       │   │
│ │                                              │   │
│ │    Algebra: Expressions                      │   │
│ │    ☐ 9Ae.01 (Unit 2.1) → PD4: 0/1 🔴       │   │
│ │    ☐ 9Ae.03 (Unit 2.2) → PD5: 0.5/1 🟡     │   │
│ │    ☐ 9Ae.04 (Unit 2.6) → PD7: 0.5/1 🟡     │   │
│ │                                              │   │
│ │    [Select All] [Create Mission]            │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ 🟡 Moderate (3-5 missing) - 15 students            │
│ 🟢 Minor (<3 missing) - 20 students                │
│                                                     │
│ [Create Bulk Mission for Selected Students]        │
└─────────────────────────────────────────────────────┘
```

### 6.3 Mission Card (In Progress)

```
┌─────────────────────────────────────────────┐
│ Master Algebra Basics                       │
│ Status: 🟡 In Progress                      │
│ Student: Konstantinas Andriulis             │
│ Deadline: 2025-11-20                        │
├─────────────────────────────────────────────┤
│ Objectives:                                 │
│                                             │
│ 9Ae.01 (Use PD4) - Current: 0              │
│   Last assessed: 2025-10-21                 │
│   Attempts: None yet                        │
│                                             │
│ 9Ae.03 (Use PD5) - Current: 0.5            │
│   Last assessed: 2025-10-20                 │
│   Attempts: None yet                        │
│                                             │
│ 9Ni.01 (Use PD1) - Current: 0              │
│   Last assessed: 2025-10-21                 │
│   Attempts: None yet                        │
│                                             │
│ Missing Points: 2.5 / 3.0                   │
├─────────────────────────────────────────────┤
│ [Edit Deadline] [Mark Complete] [Cancel]    │
└─────────────────────────────────────────────┘
```

### 6.4 Mission Card (Completed)

```
┌─────────────────────────────────────────────┐
│ Master Algebra Basics                       │
│ Status: ✅ Completed                        │
│ Student: Konstantinas Andriulis             │
│ Completed: 2025-11-15 (5 days early!)      │
├─────────────────────────────────────────────┤
│ Results:                                    │
│                                             │
│ ✓ 9Ae.01: 0 → 1 (Mastered!)               │
│   Assessed: PD4 on 2025-11-12              │
│                                             │
│ ⚠ 9Ae.03: 0.5 → 0.5 (No change)           │
│   Assessed: PD5 on 2025-11-14              │
│                                             │
│ ✓ 9Ni.01: 0 → 1 (Mastered!)               │
│   Assessed: PD1 on 2025-11-13              │
│                                             │
│ Final: 2/3 objectives mastered              │
│ Missing Points: 2.5 → 0.5                   │
└─────────────────────────────────────────────┘
```

### 6.5 PD Mappings Management (Data Management Tab)

```
┌─────────────────────────────────────────────┐
│ 📋 PD Assessment Mappings                   │
├─────────────────────────────────────────────┤
│ Search: [________]  [+ Add New Mapping]     │
├─────────────────────────────────────────────┤
│ PD1  → 9Ni.01, 9Ni.04                      │
│        Used by 12 students  [Edit] [Delete] │
│                                             │
│ PD2  → 9Ni.03                               │
│        Used by 8 students   [Edit] [Delete] │
│                                             │
│ PD3  → 9Ni.02                               │
│        Used by 5 students   [Edit] [Delete] │
│                                             │
│ ...                                         │
└─────────────────────────────────────────────┘
```

---

## 7. Implementation Phases

### Phase 1: Data Structure & Mappings ⭐ START HERE

**Priority: Critical**

1. Add mappings to data structure
   - Add `pd_mappings` to top level of JSON
   - Add `kd_mappings` to top level
   - Create TypeScript types

2. Create mapping config file
   - `src/features/modules/edtech/progressReport/student-data/config/pdKdMappings.ts`
   - Export PD_MAPPINGS constant
   - Export KD_MAPPINGS constant
   - Helper functions (getPDForObjective, getObjectivesForPD)

3. Update JSON file
   - Add mappings to `data_2025-11-09.json`
   - Validate structure

**Files to create/modify:**

- `src/features/modules/edtech/progressReport/student-data/config/pdKdMappings.ts` (new)
- `src/features/modules/edtech/progressReport/types/ProgressReportTypes.ts` (update)
- `data_2025-11-09.json` (update)

**Estimated time:** 2-3 hours

---

### Phase 2: Mission Data Types & Storage

**Priority: Critical**

1. Define mission types
   - Mission interface
   - MissionStatus type
   - CambridgeObjectiveMission type

2. Add missions to data structure
   - Add `missions` array to top level? Or per student?
   - Create mission CRUD utilities

**Files to create/modify:**

- `src/features/modules/edtech/progressReport/types/MissionTypes.ts` (new)
- Mission storage decision needed

**Estimated time:** 1-2 hours

---

### Phase 3: Mission Creator UI

**Priority: High**

1. Redesign Objectives tab
   - Two-tab layout: Mission Creator | My Missions
   - Tab navigation component

2. Build Mission Creator view
   - Student cards with unmastered objectives
   - Grouped by severity (Critical/Moderate/Minor)
   - Objective selection checkboxes
   - Show PD numbers
   - Color coding (red=0, yellow=0.5)

3. Create mission dialog
   - Mission name input
   - Deadline picker
   - Review selected objectives
   - Show PD assignments

4. Bulk mission creation
   - Multi-select students
   - Common objectives template
   - Bulk creation confirmation

**Files to create:**

- `src/features/modules/edtech/progressReport/components/missions/MissionCreator.tsx`
- `src/features/modules/edtech/progressReport/components/missions/StudentMissionCard.tsx`
- `src/features/modules/edtech/progressReport/components/missions/CreateMissionDialog.tsx`
- `src/features/modules/edtech/progressReport/components/missions/BulkMissionCreator.tsx`

**Estimated time:** 8-10 hours

---

### Phase 4: My Missions View

**Priority: High**

1. Mission list component
   - Filter: All/In Progress/Completed
   - Sort: By deadline, by student, by date
   - Search students

2. Mission cards
   - Display in progress missions
   - Display completed missions
   - Edit deadline
   - Mark complete manually
   - Cancel mission

3. Mission details view
   - Expanded view with full info
   - Attempts history
   - Progress visualization

**Files to create:**

- `src/features/modules/edtech/progressReport/components/missions/MyMissions.tsx`
- `src/features/modules/edtech/progressReport/components/missions/MissionList.tsx`
- `src/features/modules/edtech/progressReport/components/missions/MissionCard.tsx`
- `src/features/modules/edtech/progressReport/components/missions/MissionDetails.tsx`

**Estimated time:** 6-8 hours

---

### Phase 5: Excel PD Import Logic

\*\*Priority: Critical - NEEDS DECISION ON EXCEL FORMAT

**Prerequisites:**

- ⚠️ **DECISION NEEDED:** Excel PD structure (Option B or D recommended)

1. Create PD reader utility
   - Detect PD columns
   - Extract date per student
   - Handle attempt numbers (.1, .2, .3)

2. Update data processor
   - Process PD columns
   - Look up PD mapping
   - Update cambridge_objectives
   - Add to assessment history
   - Track attempts

3. Mission auto-update logic
   - Check missions when data imported
   - Update mission objective scores
   - Check completion criteria
   - Auto-complete if all objectives assessed

**Files to create/modify:**

- `src/features/modules/edtech/progressReport/student-data/utils/pdAssessmentReader.ts` (new)
- `src/features/modules/edtech/progressReport/student-data/processors/dataProcessorV5.ts` (update)
- `scripts/processStudentData.ts` (update)

**Estimated time:** 6-8 hours

---

### Phase 6: KD Import Enhancement

**Priority: Medium**

1. Update KD processing
   - Handle multiple C columns (C1, C2, C3, C4)
   - Use kd_mappings to update correct objectives
   - Already partially done for SD assessments

2. Mission updates
   - Check if KD assessment completes mission objectives

**Files to modify:**

- `src/features/modules/edtech/progressReport/student-data/processors/dataProcessorV5.ts`
- `src/features/modules/edtech/progressReport/student-data/config/cambridgeObjectiveMapping.ts`

**Estimated time:** 3-4 hours

---

### Phase 7: PD Mappings Management UI

**Priority: Low**

1. Create mappings view in Data Management tab
   - List all PD mappings
   - Show usage (how many students)
   - Add new mapping
   - Edit existing
   - Delete (with warning if in use)

**Files to create:**

- `src/features/modules/edtech/progressReport/components/admin/PDMappingsManager.tsx`

**Estimated time:** 3-4 hours

---

### Phase 8: Testing & Refinement

**Priority: High**

1. Test mission creation workflow
2. Test bulk creation
3. Test PD import and auto-update
4. Test mission completion
5. UI/UX refinement based on usage

**Estimated time:** 4-6 hours

---

## 8. Technical Specifications

### 8.1 File Structure

```
src/features/modules/edtech/progressReport/student-data/config/
  ├── pdKdMappings.ts                    # NEW
  └── cambridgeObjectiveMapping.ts       # EXISTS

src/features/modules/edtech/progressReport/
  ├── types/
  │   ├── MissionTypes.ts                # NEW
  │   └── ProgressReportTypes.ts         # UPDATE
  ├── components/
  │   ├── missions/                      # NEW FOLDER
  │   │   ├── MissionCreator.tsx
  │   │   ├── StudentMissionCard.tsx
  │   │   ├── CreateMissionDialog.tsx
  │   │   ├── BulkMissionCreator.tsx
  │   │   ├── MyMissions.tsx
  │   │   ├── MissionList.tsx
  │   │   ├── MissionCard.tsx
  │   │   └── MissionDetails.tsx
  │   └── admin/
  │       └── PDMappingsManager.tsx      # NEW
  └── utils/
      └── missionUtils.ts                # NEW

src/features/modules/edtech/progressReport/student-data/utils/
  └── pdAssessmentReader.ts              # NEW
```

### 8.2 Key Functions

```typescript
// Mission creation
createMission(studentId, objectives, deadline): Mission
startMission(missionId): void
completeMission(missionId): void
cancelMission(missionId): void

// PD Processing
processPDAssessment(student, pdNumber, score, date, attempt): void
getPDMapping(pdNumber): string[]
getObjectivesForPD(pdNumber): string[]

// Mission updates
checkMissionCompletion(missionId): boolean
updateMissionProgress(missionId): void
autoCompleteMissions(studentId): Mission[]

// Bulk operations
createBulkMissions(studentIds, objectives, deadline): Mission[]
findStudentsNeedingObjectives(objectiveCodes): StudentData[]

// Analysis
calculateMissingPoints(student): number
getUnmasteredObjectives(student): ObjectiveScore[]
groupObjectivesByStrand(objectives): GroupedObjectives
```

### 8.3 Import Logic Pseudocode

```typescript
// When importing Excel with PD data
function processExcelFile(excelData) {
  for each sheet in excelData {
    for each row (student) {
      for each column {
        if (column matches PD pattern) {
          const pdNumber = extractPDNumber(column); // "PD3"
          const attempt = extractAttempt(column);    // 1, 2, 3
          const date = getDateForPD(row, pdNumber);
          const score = row[column];

          // Look up what objectives this PD tests
          const objectives = pd_mappings[pdNumber]; // ["9Ni.02"]

          for each objective in objectives {
            // Update student's cambridge_objectives
            updateCambridgeObjective(student, objective, score, date, `PD${pdNumber}.${attempt}`);

            // Check if student has active mission with this objective
            const missions = findActiveMissions(student.id, objective);
            for each mission in missions {
              updateMissionObjective(mission, objective, score, date, attempt);

              // Check if mission complete
              if (allObjectivesAssessed(mission)) {
                completeMission(mission.id);
                showNotification(`Mission "${mission.title}" completed for ${student.name}`);
              }
            }
          }
        }
      }
    }
  }
}
```

---

## 9. Open Questions & Decisions Needed

### 🔴 **CRITICAL - Excel PD Structure**

**Decision Required:** Which Excel structure for PD assessments?

- Option B (Separate PD sheets) - Recommended
- Option D (Single log sheet) - Most flexible

**Impact:** Affects Phase 5 implementation

**Timeline:** Must decide before starting Phase 5

---

### 🟡 **Medium Priority**

1. **Mission Storage Location:**
   - Top-level `missions` array?
   - Per-student `missions` array?
   - Separate file?

2. **PD Column Detection:**
   - Regex pattern for PD columns
   - Handle edge cases (.1 vs .01, etc.)

3. **Notification System:**
   - How to show "3 missions auto-updated"?
   - Toast notifications?
   - Alerts in UI?

---

## 10. Success Metrics

After implementation, system should:

- ✅ Automatically identify students needing intervention
- ✅ Allow easy creation of targeted missions
- ✅ Support bulk mission creation (save time!)
- ✅ Auto-update missions when new data imported
- ✅ Auto-complete missions when objectives assessed
- ✅ Provide clear visibility into student progress
- ✅ Reduce manual tracking overhead
- ✅ Enable data-driven intervention decisions

---

## 11. Timeline Estimate

| Phase                       | Hours           | Dependencies            |
| --------------------------- | --------------- | ----------------------- |
| Phase 1: Data Structure     | 2-3             | None                    |
| Phase 2: Mission Types      | 1-2             | Phase 1                 |
| Phase 3: Mission Creator UI | 8-10            | Phase 1, 2              |
| Phase 4: My Missions View   | 6-8             | Phase 2                 |
| Phase 5: PD Import Logic    | 6-8             | Phase 1, Excel decision |
| Phase 6: KD Enhancement     | 3-4             | Phase 1                 |
| Phase 7: PD Management UI   | 3-4             | Phase 1                 |
| Phase 8: Testing            | 4-6             | All                     |
| **TOTAL**                   | **34-45 hours** |                         |

---

## 12. Next Steps

1. ✅ **Immediate:** Decide on Excel PD structure (Option B or D)
2. ⭐ **Start:** Phase 1 - Add mappings to data structure
3. 📝 **Document:** Create PD mappings config file
4. 🎨 **Design:** Finalize mission card layouts
5. 💻 **Code:** Begin Mission Creator UI

---

**Status:** Ready to begin implementation
**Last Updated:** November 9, 2025
**Version:** 1.0
