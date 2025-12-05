# Feature Upgrades Catalog

This file consolidates every enhancement that previously lived across `features/`, `fixes/`, `guides/`, and `comments-generator/`.

## Data Management Enhancements
- **Excel Column Preview & Selection** – `ExcelFileUpload.tsx` + `ExcelColumnPreview.tsx` show sheet metadata, badges per assessment type, and let the user import only the columns they need.
- **Auto-Sync Workflow** – After Excel processing, the dashboard reloads data from `localStorage`, eliminating the manual “download → upload” loop.
- **Export Safeguards** – Exports warn when inline edits are pending to keep JSON snapshots aligned with UI changes.

## Analytics & Table Upgrades
- **Multi-Score Display** – Tests and summatives render percentage, MYP, and Cambridge columns simultaneously.
- **Dynamic English Score Types** – Diagnostic (paper1/2/3 + % totals) and Unit test components (lis/read/voc/gr + totals) show up in chart dropdowns when those fields exist.
- **Chart Scale Upgrade** – `chartScaleConfig.ts` picks ranges/intervals per score type (0–50 raw scores, 0–100 percentages, 0–10 homework) so histograms stay meaningful.
- **Inline Editing Reliability** – `useInlineEditing.ts` now batches multiple edits per assessment, exposes pending-edit banners, and writes timestamps on save.

## Objectives & Missions
- **Mission Creator Tab** – Priority grouping (Critical ≥5 points missing) with class/strand filters, objective chips, and student counts.
- **Inline Grade Entry** – Mission cards expose KD/SD inputs, track unsaved values, and apply them via `onDataChange`, automatically updating mission eligibility.
- **Teacher-Type Guardrails** – Objectives tab shows guidance instead of controls for non-`main` teacher data, matching Grade Generator behavior.

## Guide & UI Refinements
- **Guide Section Update** – Cards now cover six major workflows (Data Management → Comments Generator) with color-coded CTAs.
- **Comments Generator Refactor** – Template selectors, warning banners, and generated comment lists moved into smaller components; math + English templates share the same hooks.
- **English Comment Templates** – Diagnostic TEST 1 and Unit 1 templates summarize component percentages and highlight focuses for Teacher A/J.

## Tooling & Maintenance
- **Assessment Deletion Script** – `scripts/utilities/deleteAssessments.ts` removes unwanted rows by date/column/type with audit output.
- **Name Alias & Dynamic Column Fixes** – Teacher J imports now auto-detect column offsets; alias resolution prevents duplicate student creation.
- **Weekly Assessment Migration** – Experimental EXT entries were retyped to `classwork` and flagged so charts/timelines ignore them by default.

## Using This Catalog
Each bullet references working code inside `src/features/modules/edtech/progressReport/…`. If deeper historical context is necessary (decision logs, screenshots), check `archive/2025-02-legacy/features/` and `.../fixes/`.



