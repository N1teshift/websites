# Progress Report Implementation Guide

## Architecture Snapshot

- `ProgressReportPage.tsx` wires seven memoized sections and the shared navigation state.
- Each section focuses on UI only; stateful logic lives inside dedicated hooks (`useProgressReportData`, `useColumnVisibility`, `useInlineEditing`, `useChartData`, etc.).
- Utilities under `progressReport/utils/processing` perform heavy data shaping (chart options, statistics, comparators).
- Styles lean on Tailwind and local CSS (`src/styles/modules`), while copy is resolved through `useFallbackTranslation`.

```
ProgressReportPage
 ├─ DataManagementSection (uploads, validation, export)
 ├─ ClassViewSection (charts, tables, inline editing)
 │   ├─ ColumnCustomizer / StatisticsCards / StudentDataTable
 │   └─ ClassPerformanceChartEnhanced → hooks (useAvailableScoreTypes, useChartData)
 ├─ StudentViewSection (timeline, consultations, attendance, Cambridge tests)
 ├─ GradeGeneratorSection (P1 synthesis, guarded by teacher type)
 ├─ ObjectivesTabContainer (Mission Creator + legacy completion)
 └─ CommentsGeneratorSection (template-driven summaries)
```

## Rendering Flow

1. `useProgressReportData` loads JSON from uploads or `localStorage`, exposes export/import helpers, and carries `hasUnsavedChanges`.
2. Section tabs update `activeSection` and reuse `handleSectionChange`.
3. Heavy lists (students, assessments, missions) memoize derived data; components stay under the user’s 200-line preference via extraction into hooks/utilities.
4. Teacher-type detection gates Grade Generator and Objectives tabs, ensuring English-only data never sees math-specific tooling.

## Key Hooks & Utilities

- `useProgressReportData` – central store for file IO, validation, export, and unsaved change tracking.
- `useAssessmentColumns` + `useColumnVisibility` – builds column configs and persists visibility choices.
- `useInlineEditing` – tracks pending edits, applies them to student assessments, and coordinates with `PendingEditsActionBar`.
- `useAvailableScoreTypes` / `useChartData` – determine score selectors and normalized chart data for math + English tests.
- `chartScaleConfig.ts`, `chartAssessmentUtils.ts`, `studentSortComparators.ts` – shared math that keeps the UI performant and consistent.

## Data & State Contracts

- `ProgressReportData` metadata includes `schema_version`, `teacher_type`, and feature flags.
- `Assessment` carries English-specific fields (`paper1_*`, `lis1`, `voc1`, `total_percent`, etc.) so tables/charts share the same record shape as math assessments.
- Mission data (`CambridgeMission`, `StudentMissionProgress`) flows from JSON to `ObjectivesTabContainer` and back through `onDataChange`.

## Internationalization & Styling

- Strings use `useFallbackTranslation` without passing namespaces (per layout context requirement).
- Icons come from `lucide-react`; charts use Recharts.
- Complex layouts leverage Tailwind utility classes plus scoped CSS for calendar-like widgets.

## Known Constraints

- Grade Generator and Objectives tab rely on math schema signals; English data surfaces guidance banners instead of functionality.
- Inline editing only persists after the user hits “Save Changes.” Exports warn when unsaved edits exist.
- Mission creator performance depends on the completeness of PD/KD mappings inside the JSON payload.

## Future Considerations

- Decouple mission calculations into a dedicated hook/service for easier testing.
- Move Excel processing progress messages to a toast system for consistency with the rest of the app.
- Add automated smoke tests per section once Playwright coverage is prioritized.
