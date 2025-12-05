# Documentation Index

**Last Updated:** January 2025  
**Status:** ✅ Feature-Based Organization - Easy to Find Feature-Specific Docs

This directory contains comprehensive documentation for the project, organized by category. Documentation has been audited and optimized for AI agent discovery and usefulness.

## 📁 Directory Structure

### 🧱 Top-Level Layout
The `docs/` root now contains only three curated collections for easier navigation:
- `architecture/` – platform-wide patterns, setup references, and investigations
- `archive/` – historical snapshots, reports, and retired plans
- `features/` – active feature docs plus project planning artifacts

### 🏗️ **architecture/**
System architecture and core infrastructure documentation.
- `IS_IT_WORTH_IT.md` - **Honest assessment: Should you refactor?** 💡 **READ THIS FIRST**
- `APP_ROUTER_MIGRATION_ASSESSMENT.md` - **App Router migration evaluation** 🔄
- `ARCHITECTURE_ANALYSIS.md` - Complete architecture analysis vs Feature-Sliced Design
- `VIOLATIONS_SUMMARY.md` - Actual violations found in codebase
- `FSD_QUICK_REFERENCE.md` - Quick reference for FSD alignment improvements
- `CACHING_STRATEGY.md` - Caching strategy and patterns
- `LOGGING.md` - Logging system documentation (console-based)
- `ERRORS.md` - Error handling patterns and strategies
- `INTERNATIONALIZATION.md` - i18n approach and conventions
- `NAME_ALIAS_SYSTEM.md` - Name alias system architecture
- `ENV_SETUP.md` / `ENV_VARIABLES.md` - Environment provisioning and secrets inventory
- `GOOGLE_CLOUD_SETUP.md` - Cloud resource setup
- `NEW_PAGE_SETUP.md` / `SCRIPTS.md` - Platform setup and scripting guides
- `PERFORMANCE_OPTIMIZATION_INVESTIGATION.md` - Performance deep dive
- `investigations/` - Active decisions (`DECISION_GUIDE.md`, `INVESTIGATION_ANALYSIS_REPORT.md`)
- `migrations/LOGGING_MIGRATION.md` - Cross-cutting migration reference

### 🎯 **features/**
Feature-specific documentation plus active project management artifacts.
- `COMPREHENSIVE_TODO.md` - Master backlog grouped for agent assignment
- `ROADMAP.md` - Upcoming feature milestones
- `TODO.md` - Day-to-day execution tracker

#### **features/progress-report/**
Progress Report Dashboard - All documentation for the student progress tracking system.

**⭐ Quick Start:**
- `reference/current-status.md` - **Current database schema (v5.2)** ⭐ **START HERE**
- `reference/pd-kd-mappings.md` - Quick reference for Cambridge mappings
- `guides/workflow-guide.md` - Data management workflow

**Reference:**
- `reference/current-status.md` - Current database schema and status (v5.2)
- `reference/pd-kd-mappings.md` - PD/KD mappings quick reference

**Guides:**
- `guides/database-validation.md` - Database validation system
- `guides/integration-instructions.md` - Cambridge Missions integration guide
- `guides/testing-guide.md` - Cambridge Missions testing guide
- `guides/workflow-guide.md` - Data management workflow
- `guides/ASSESSMENT_TEMPLATE_QUESTIONNAIRE.md` - Assessment metadata intake template

**Data:**
- `data/json-structure-analysis.md` - JSON data structure analysis
- `data/cambridge-book-structure.md` - Cambridge book structure
- `data/curriculum-connections.md` - Curriculum connections
- `data/student-data-processing.md` - Student data processing
- `data/teacher-type-metadata-update.md` - Teacher type metadata
- `data/teacher-a-integration-complete.md` - Teacher A integration
- `data/teacher-j-integration-complete.md` - Teacher J integration
- `data/teacher-j-fix-algirdas-column-shift.md` - Teacher J column shift fix

**Refactoring:**
- `refactoring/chart-component.md` - Chart component refactoring (current architecture)
- `refactoring/history.md` - Complete refactoring history (78% code reduction!)
- `refactoring/index.md` - Index of refactoring work

**Fixes:**
- `fixes/name-alias.md` - Name alias bug fix
- `fixes/nd-columns.md` - ND columns fix
- `fixes/objectives-calculation.md` - Objectives calculation fix
- `fixes/multiple-cell-edit.md` - Multiple cell edit bug fix

**Migrations:**
- `migrations/v3-migration.md` - Complete V3 migration documentation
- `migrations/weekly-assessment.md` - Weekly assessment migration
- `migrations/extra-activities.md` - Extra activities migration

**Features:**
- `features/chart-scale-upgrade.md` - Chart scale upgrade
- `features/multi-score-display.md` - Multi-score display feature
- `features/objectives-inline-grading.md` - Objectives inline grading
- `features/unified-timeline-view.md` - Unified timeline view feature
- `features/english-test-chart-upgrade.md` - English test chart upgrade
- `features/excel-column-preview.md` - Excel column preview feature
- `features/assessment-deletion-tool.md` - Assessment deletion tool guide
- `features/objectives-tab-restriction.md` - Objectives tab restriction
- `features/guide-section-update.md` - Guide section update

**Dashboard:**
- `dashboard/` - Detailed progress report dashboard documentation
  - `INDEX.md` - Dashboard index
  - `DOCUMENTATION.md` - Full dashboard documentation
  - `IMPLEMENTATION_NOTES.md` - Implementation details
  - `README.md` - Dashboard overview
  - `SUMMARY.md` - Dashboard summary
  - `VISUAL_GUIDE.md` - Visual guide and screenshots


#### **features/comments-generator/**
Comments Generator - AI-powered student comment generation.

**Refactoring:**
- `refactoring/refactor.md` - Comments generator refactoring (current architecture)

**Fixes:**
- `fixes/template-filtering.md` - Template filtering implementation

**Features:**
- `features/english-templates.md` - English comment templates

#### **features/edtech/**
Educational technology features (general).
- `EDTECH_INDEX_FILES_SUMMARY.md` - EdTech index files summary
- `EDTECH_REORGANIZATION_SUMMARY.md` - EdTech reorganization summary

### 📦 **archive/**
Historical documentation - completed work and old versions.

#### **archive/cambridge/**
Completed Cambridge Missions implementation documentation (Nov 2025).
- `IMPLEMENTATION_COMPLETE.md` - Full implementation summary
- `CAMBRIDGE_MISSIONS_PROGRESS.md` - Progress tracking
- `CAMBRIDGE_MISSIONS_SUMMARY.md` - Phase 1 summary
- `CAMBRIDGE_MISSIONS_IMPLEMENTATION_PLAN.md` - Original implementation plan
- `CAMBRIDGE_C1C2_MAPPING_UPDATE.md` - C1/C2 mapping work
- `CAMBRIDGE_OBJECTIVES_IMPLEMENTATION_COMPLETE.md` - Objectives implementation
- `CAMBRIDGE_IMPORT_REPORT.md` - Import results
- `CAMBRIDGE_FIX_SUMMARY.md` - Bug fixes

#### **archive/cleanup/**
Data cleanup history (Nov 2025).
- `ASSESSMENT_DELETION_SUMMARY_V9.md` - V9 assessment cleanup
- `DATA_CLEANUP_COMPLETE_V8.md` - V8 data cleanup
- `DUPLICATE_FIX_SUMMARY.md` - Duplicate student fix
- `AUTO_SYNC_IMPLEMENTATION.md` - Auto-sync feature
- `DYNAMIC_IMPORT_PROGRESS.md` - Dynamic import implementation

#### **archive/versions/**
Historical version migration documentation.
- `V4_MIGRATION_SUMMARY.md` - V4 migration summary
- `V5_UPGRADE_COMPLETE.md` - V5.0 upgrade (superseded by V5.2)

#### **archive/fixes/**
Historical bug fixes.
- `PREVIEW_API_FIX.md` - Preview API column selection fix

#### **archive/refactoring/**
Historical refactoring documentation (consolidated into REFACTORING_HISTORY.md).
- `REFACTORING_FINAL_REPORT.md` - Detailed refactoring report
- `REFACTORING_COMPLETE.md` - Complete refactoring documentation
- `REFACTORING_SUMMARY.md` - Refactoring summary
- `PROGRESS_REPORT_REFACTORING_ANALYSIS.md` - Progress report analysis

## 🔍 Quick Reference

### For New Developers
Start here:
1. **`features/progress-report/reference/current-status.md`** - Understand current database schema
2. `architecture/NEW_PAGE_SETUP.md` - Learn how to add new pages
3. `architecture/INTERNATIONALIZATION.md` - Understand i18n patterns
4. `architecture/LOGGING.md` - Use the logging system
5. `architecture/SCRIPTS.md` - Write scripts correctly

### For Feature Development
1. Check `features/[feature-name]/reference/` for feature-specific references
2. Review `features/[feature-name]/` for related documentation
3. Check `architecture/` for system patterns
4. Follow `architecture/NEW_PAGE_SETUP.md` for page creation
5. Use `architecture/CACHING_STRATEGY.md` for caching needs

### For Progress Report Data Work
1. **Start with `features/progress-report/reference/current-status.md`** - Current schema reference
2. Review `features/progress-report/reference/pd-kd-mappings.md` for Cambridge mappings
3. Check `features/progress-report/data/student-data-processing.md` for processing patterns
4. Use `features/progress-report/guides/database-validation.md` for validation procedures
5. See `features/progress-report/migrations/` for migration examples

### For Bug Fixes
1. Check `features/[feature-name]/fixes/` for similar issues
2. Review `architecture/ERRORS.md` for error handling
3. Document your fix in `features/[feature-name]/fixes/`

### For Cambridge Missions
1. Read `features/progress-report/reference/current-status.md` - Schema requirements
2. Check `features/progress-report/reference/pd-kd-mappings.md` - Mapping details
3. Review `features/progress-report/guides/integration-instructions.md` - Integration guide
4. See `archive/cambridge/` for implementation history

## 📊 Documentation Statistics

**After February 2025 Restructure:**
- **Root level files:** 0 (directories only: architecture, archive, features)
- **Active documentation:** ~45 files (useful for AI agents)
- **Archived documentation:** ~25 files (historical, preserved)
- **Top-level collections:** 3 primary directories
- **Validation status:** ✅ All core docs verified accurate and relevant

## 📝 Documentation Standards

When creating new documentation:
- **Feature-specific docs**: Place in `features/[feature-name]/[category]/` (refactoring, fixes, migrations, features)
- **Cross-cutting docs**: Place in `architecture/` (add subfolders like `investigations/` or `migrations/` as needed)
- Use lowercase with hyphens for filenames: `chart-component.md` (not `CHART_COMPONENT.md`)
- Include date if time-sensitive (YYYY-MM-DD format)
- Update this index when adding new docs
- Follow existing documentation patterns
- **Completed work goes to `archive/`** - Keep active docs clean

## 🔗 Related Resources

- **Source Code**: `src/` directory
- **Scripts**: `scripts/` directory  
- **Tests**: Test files throughout `src/`
- **Translations**: `locales/` directory

## 🗂️ Archive Policy

Historical documentation is preserved in `archive/` to:
- Keep root level clean and focused
- Preserve implementation history
- Separate active from completed work
- Maintain audit trail

**What gets archived:**
- Completion summaries ("COMPLETE", "SUCCESS", "DONE" status)
- Historical migration docs (superseded by newer versions)
- Consolidated/redundant documentation
- Old bug fix summaries

**What stays active:**
- Current schema documentation (V5.2)
- System architecture docs
- Active guides and references
- Ongoing migration docs
- Recent bug fixes (current quarter)

