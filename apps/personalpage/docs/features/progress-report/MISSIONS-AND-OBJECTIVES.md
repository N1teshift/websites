# Missions & Objectives Playbook

## Tab Layout

- `ObjectivesTabContainer.tsx` renders two tabs:
  1. **Mission Creator** – Priority-grouped backlog of students missing PD/KD evidence.
  2. **Legacy Completion** – Original objectives tracker for quick lookups.
- Teacher-type guard: non-`main` data sees an informative banner and can’t interact with mission tooling.

## Mission Creator Flow

1. **Grouping** – Students fall into Critical (≥5 missing points), Moderate (3–5), or Minor (<3). Summary badges track counts per class and strand.
2. **Filters** – Class dropdown + strand filter narrow the list. Empty states explain when no objectives remain.
3. **Objective Selection** – Expand a student card to view missing PD/KD objectives, related assessments, and recommended actions.
4. **Mission Drafting** – Select objectives, set deadlines, add notes, and create missions that sync back into the JSON payload.

## Inline Grade Entry

- Mission cards expose KD/SD inputs whenever the student is missing that evidence.
- Inputs persist locally until the user hits **Save All Grades** or **Discard** (pending-count badge shows progress).
- Saving creates/updates assessments (KD or SD) with timestamps and evaluation details, then refreshes mission eligibility automatically.

## Validation & Maintenance

- Run `npx tsx scripts/utilities/validateAndFixDatabase.ts` after imports to ensure every assessment has IDs, titles, contexts, and on-time flags.
- When PD/KD mappings change, update `pdKdMappings.ts` and regenerate the JSON so the mission engine sees the new objectives.
- Use the assessment questionnaire template (archived under `archive/2025-02-legacy/guides/`) when onboarding new assessment types; responses map directly to `assessment_id` + `assessment_title`.

## Testing Checklist

1. **Mission Creator** – Verify priority counts, class/strand filters, and objective lists with the latest data file.
2. **Grade Entry** – Enter multiple KD/SD values, ensure pending badge updates, and confirm `onDataChange` receives the new assessments.
3. **Tab Guard** – Load Teacher A/J data and confirm the Objectives tab displays the restriction banner instead of the UI.
4. **Validator Run** – After Excel imports, run the validator script and review its summary for missing fields or wrong formats.

## References

- `FEATURE-UPGRADES.md` – quick bullet summary of inline grading and guardrails.
- `DATA-PIPELINE.md` – schema + validator details.
- `archive/2025-02-legacy/guides/` – original workflow, testing, and questionnaire markdowns for historical context.
