# Progress Report Overview

## Purpose
The Progress Report module at `/projects/edtech/progressReport` lets teachers upload JSON exports, process fresh Excel data, and analyze student performance across class, student, grading, objectives, and comment-generation workflows. This file replaces the old dashboard README/summary stack and is the canonical starting point for anyone touching the feature.

## Primary Views
- **Data Management** – Upload JSON snapshots, process Excel files, export validated data, and see auto-sync status (`DataManagementSection.tsx`).
- **Class View** – Chart distributions, edit assessments inline, and drill through PD/KD columns with column presets (`ClassViewSection.tsx` + `ClassPerformanceChartEnhanced.tsx`).
- **Student View** – Timeline plus consultation, attendance, Cambridge tests, and profile widgets (`StudentViewSection.tsx`).
- **Grade Generator** – Recalculate percentage grades (KD/SD) for math data; guarded for other teacher types (`GradeGeneratorSection.tsx`).
- **Objectives & Missions** – Mission creator + legacy completion tracker in a tabbed container (`ObjectivesTabContainer.tsx`).
- **Comments Generator** – Generate math or English report comments with shared templates.

## Quick Start
1. Visit `http://localhost:3000/projects/edtech/progressReport`.
2. Load the latest JSON (`data_2025-11-09.json`) or upload Excel directly.
3. Pick **Class View** for cohort analytics or **Student View** for a specific learner.
4. Use the navigation pills to open Grade Generator, Objectives, or Comments tabs as needed.

## Navigation Reference
| Task | Where to start | Notes |
| --- | --- | --- |
| Import or export data | Data Management | Excel uploads auto-sync back into the dashboard. |
| Class-wide analytics | Class View | Switch score types, customize columns, save/discard inline edits. |
| Single student deep dive | Student View | Timeline auto-switches modes based on selected filters. |
| Generate final grades | Grade Generator | Guarded for `teacher_type: 'main'`. Others see an info banner. |
| Missions & objectives | Objectives Tab | Tabs: Mission Creator + legacy completion view. |
| Generate comments | Comments Generator | Supports math & English templates, including Teacher A/J data. |

## Unique Capabilities
- **Dual-mode timeline** that swaps between activity and score projections automatically.
- **Dynamic score selectors** covering percentage, MYP, Cambridge, and English-specific component scores.
- **Smart column presets** with visibility saved to `localStorage`.
- **Mission intelligence** that highlights missing PD/KD evidence and allows inline grade entry.
- **Auto-sync Excel workflow** so imports refresh the UI without manual exports.

## Related Resources
- `IMPLEMENTATION.md` – component architecture, hooks, and future work.
- `DATA-PIPELINE.md` – schema, import/validation tooling, and troubleshooting.
- `FEATURE-UPGRADES.md` – catalog of the major enhancements consolidated from legacy docs.
- `MISSIONS-AND-OBJECTIVES.md` – mission creator, validation scripts, and testing playbooks.
- `ENGLISH-DATA.md` – English assessment ingestion, chart behavior, and template support.
- `archive/2025-02-legacy/` – frozen copies of every retired markdown file in case historical context is required.



