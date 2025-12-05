# Progress Report Data Pipeline

## Schema Snapshot (v5.2)
- Metadata (`exported_at`, `schema_version`, `teacher_type`, `features`) lives at the root of every JSON export.
- Students include academic info, profile attributes, consultation/attendance records, Cambridge tests, missions, and the consolidated `assessments` array.
- `Assessment` entries store calculation hints (`evaluation_details`) plus English fields (`paper1_score`, `lis1`, `total_percent`, etc.) so all languages share one structure.
- PD (`pd_mappings`) and KD (`kd_mappings`) live at the JSON root and reference the same objective IDs that the mission system consumes.

## PD / KD Quick Reference
- **PD**: 54 mappings covering Number, Algebra, Geometry, Probability, Statistics, Fractions, Sequences, and Space strands. Each entry contains `assessment_id`, strand, description, and objective list.
- **KD**: 15 Cambridge unit mappings with titles, strands, and objectives. KD assessments are summatives in the dashboard.
- Mission tooling expects these mappings to exist in the payload; missing entries result in “no objectives available” states.

## Import & Export Workflows
### Dashboard Auto-Sync
1. Upload the current JSON (optional if already cached in `localStorage`).
2. Use **Process New Assessment Data** to upload `raw_data.xlsx`.
3. The API endpoint `/api/process-student-data` processes Excel, writes updated JSON, and returns it to the browser.
4. `DataManagementSection` reloads the response into the UI and surfaces success banners. Unsaved inline edits are flagged before export.

### CLI Tooling
- Use `npx tsx scripts/tools/importData.ts --excel=<file> --json=<file> --output=<file>` for scripted imports.
- Modes: `--type=assessments` (default) or `--type=cambridge`.
- Flags: `--validate-only`, `--no-backup`.
- Exports can also run through `scripts/utilities/exportStudentData.ts`.

## Validation & Cleanup
- `scripts/utilities/validateAndFixDatabase.ts` enforces v5 requirements (assessment IDs/titles, ND on-time fields, context).
- `nameAliases.ts` + `studentDataManagerV5.ts` resolve Excel nicknames to canonical names; logs show when aliases trigger.
- ND cleanup merged experimental ND4/PA data into ND5 and ensures `homework_reflection` assessments don’t duplicate columns.
- The weekly assessment migration converted `weekly_assessment` types into `classwork` and flags anything marked `(experimental)` so the timeline filters it out.

## Troubleshooting
- **Missing columns after import** – confirm Excel sheets include the same headers; the dynamic column mapper relies on row 1 section markers plus row 2 labels.
- **Duplicate students** – check `nameAliases.ts` entries and confirm the CLI or API path is using class names (not raw sheet names) when matching.
- **English chart dropdowns look empty** – ensure the assessment records include `paper*_score` or `lis1` fields; the score-type hook only shows options that have data.
- **Export warns about pending edits** – save/discard via the Class View banner before exporting so JSON output reflects table changes.

## Backups & Archiving
- Every CLI import creates a timestamped backup unless `--no-backup` is set.
- The `docs/features/progress-report/archive/` folder holds all legacy documentation (README, guides, migrations, etc.) for historical reference; the JSON data archives live under `/backups/` when scripts run.



