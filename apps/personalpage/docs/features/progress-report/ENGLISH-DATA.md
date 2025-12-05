# English Data Support

## Data Model
- English assessments reuse the shared `Assessment` interface. Fields include:
  - Diagnostic: `paper1_score/max/percent`, `paper2_*`, `paper3_*`, `total_score`, `total_percent`.
  - Unit tests: `lis1`, `lis2`, `read`, `voc1`, `voc2`, `gr1`, `gr2`, `gr3`, `total_percent`.
- `teacher_type` metadata distinguishes English files (`'A'` or `'J'`) from math (`'main'`). Grade Generator and Objectives tabs respect this flag automatically.

## Import & Column Detection
- `scripts/importDataJ.ts` reads `dataJ.xlsx`, scans row 1 for section markers (“UNIT 1”, “Diagnostic TEST 1”, etc.), and maps headers dynamically to account for sheet-specific column shifts (see Algirdas fix).
- Name aliases still apply, so ensure Excel class names map to canonical names (e.g., “Algirdas” → “3 Algirdas”).
- When the English dataset is loaded in the dashboard, `useProgressReportData` simply exposes the same `data.students` array; no extra wiring is required.

## Dashboard Behavior
- **Class View**:
  - Column generator creates entries for every English component, complete with sorting and inline editing support.
  - Chart score selector detects available English fields and presents raw score + percentage options with the correct scale ranges.
  - Inline editing supports all English fields; pending edits must be saved before exporting.
- **Objectives & Grade Generator**:
  - Objectives tab shows an informational banner (“Objectives Not Available”) for English data.
  - Grade Generator renders the same style of banner, keeping Teacher A/J files focused on comments and analytics.
- **Comments Generator**:
  - English templates (Diagnostic TEST 1, Unit 1 TEST) summarize component scores and highlight areas for improvement.

## Known Considerations
- Ensure Excel sheets contain consistent header labels; the dynamic mapper relies on keywords like “Listening”, “Reading”, “VOC”.
- Diagnostic tests often have blank Paper 2/3 data until later in the term; the UI hides score types that have no values.
- Missions continue to use math PD/KD objectives. English curricula should remain outside the mission system until a dedicated objective set is defined.

## References
- `FEATURE-UPGRADES.md` – English chart + multi-score upgrades.
- `DATA-PIPELINE.md` – import/validation tooling.
- `archive/2025-02-legacy/data/` – step-by-step notes for the original Teacher A/J integrations if historical context is needed.



