# Feature-Based Documentation Reorganization Plan

## Current Problem

From filenames alone, you can't tell which feature documentation belongs to:

- `CHART_COMPONENT_REFACTOR.md` → Which feature? (Progress Report)
- `NAME_ALIAS_FIX.md` → Which feature? (Progress Report)
- `COMMENTS_GENERATOR_REFACTOR.md` → Which feature? (Comments Generator)

## Proposed Structure

### New Organization

```
docs/
├── features/
│   ├── progress-report/
│   │   ├── refactoring/
│   │   │   ├── chart-component.md
│   │   │   └── [other refactors]
│   │   ├── fixes/
│   │   │   ├── name-alias.md
│   │   │   ├── nd-columns.md
│   │   │   ├── objectives-calculation.md
│   │   │   └── multiple-cell-edit.md
│   │   ├── migrations/
│   │   │   ├── v3-migration.md
│   │   │   ├── v4-migration.md
│   │   │   └── weekly-assessment.md
│   │   ├── features/
│   │   │   ├── chart-scale-upgrade.md
│   │   │   ├── multi-score-display.md
│   │   │   ├── objectives-inline-grading.md
│   │   │   └── unified-timeline-view.md
│   │   └── dashboard/ (existing, stays)
│   │
│   ├── comments-generator/
│   │   ├── refactoring/
│   │   │   └── refactor.md
│   │   ├── fixes/
│   │   │   └── template-filtering.md
│   │   └── features/
│   │       └── english-templates.md
│   │
│   ├── unit-plan-generator/
│   │   └── [future docs]
│   │
│   └── [other features]/
│
├── architecture/ (stays - cross-cutting concerns)
│   ├── LOGGING.md
│   ├── CACHING_STRATEGY.md
│   └── ...
│
├── guides/ (stays - general guides)
│   ├── NEW_PAGE_SETUP.md
│   └── ...
│
├── data/ (stays - shared data structures)
│   ├── JSON_STRUCTURE_ANALYSIS.md
│   └── ...
│
└── archive/ (stays - historical)
```

## Benefits

1. **Immediate Context**: `progress-report/refactoring/chart-component.md` → instantly know it's about progress report charts
2. **Better Organization**: All docs for a feature in one place
3. **Easier Discovery**: Want progress report docs? Go to `features/progress-report/`
4. **Scalable**: Easy to add new features without cluttering root

## Migration Plan

### Step 1: Identify Feature Ownership

**Progress Report:**

- `refactoring/CHART_COMPONENT_REFACTOR.md` → `features/progress-report/refactoring/chart-component.md`
- `refactoring/REFACTORING_HISTORY.md` → `features/progress-report/refactoring/history.md`
- `fixes/NAME_ALIAS_FIX.md` → `features/progress-report/fixes/name-alias.md`
- `fixes/ND_COLUMNS_FIX_COMPLETE.md` → `features/progress-report/fixes/nd-columns.md`
- `fixes/OBJECTIVES_DYNAMIC_CALCULATION_FIX.md` → `features/progress-report/fixes/objectives-calculation.md`
- `fixes/MULTIPLE_CELL_EDIT_BUG_FIX.md` → `features/progress-report/fixes/multiple-cell-edit.md`
- `migrations/V3_MIGRATION_COMPLETE.md` → `features/progress-report/migrations/v3-migration.md`
- `migrations/WEEKLY_ASSESSMENT_MIGRATION.md` → `features/progress-report/migrations/weekly-assessment.md`
- `migrations/EXTRA_ACTIVITIES_MIGRATION.md` → `features/progress-report/migrations/extra-activities.md`
- `features/progress-report/*` → Already there, just reorganize subfolders

**Comments Generator:**

- `refactoring/COMMENTS_GENERATOR_REFACTOR.md` → `features/comments-generator/refactoring/refactor.md`
- `features/COMMENTS_GENERATOR_TEMPLATE_FILTERING.md` → `features/comments-generator/fixes/template-filtering.md`
- `features/ENGLISH_COMMENT_TEMPLATES.md` → `features/comments-generator/features/english-templates.md`

**Cross-Cutting (Keep in Root):**

- `architecture/` - System-wide patterns
- `guides/` - General development guides
- `data/` - Shared data structures
- `migrations/LOGGING_MIGRATION.md` - Infrastructure migration

### Step 2: File Naming Convention

**New Standard:**

- Use lowercase with hyphens: `chart-component.md` (not `CHART_COMPONENT_REFACTOR.md`)
- Keep descriptive but shorter: `name-alias.md` (not `NAME_ALIAS_FIX.md`)
- Category folders: `refactoring/`, `fixes/`, `migrations/`, `features/`

### Step 3: Update References

- Update `docs/README.md` with new structure
- Update cross-references in docs (e.g., "Related Documentation" sections)
- Update any code comments that reference docs

## Example: Before vs After

### Before

```
docs/
├── refactoring/
│   ├── CHART_COMPONENT_REFACTOR.md  ❓ Which feature?
│   └── COMMENTS_GENERATOR_REFACTOR.md  ❓ Which feature?
├── fixes/
│   ├── NAME_ALIAS_FIX.md  ❓ Which feature?
│   └── ND_COLUMNS_FIX_COMPLETE.md  ❓ Which feature?
└── features/
    └── progress-report/  (some docs here, but not all)
```

### After

```
docs/
└── features/
    ├── progress-report/
    │   ├── refactoring/
    │   │   └── chart-component.md  ✅ Clear!
    │   └── fixes/
    │       └── name-alias.md  ✅ Clear!
    └── comments-generator/
        ├── refactoring/
        │   └── refactor.md  ✅ Clear!
        └── fixes/
            └── template-filtering.md  ✅ Clear!
```

## Implementation Checklist

- [ ] Create new folder structure under `features/`
- [ ] Move and rename progress-report docs
- [ ] Move and rename comments-generator docs
- [ ] Update all file references in `README.md`
- [ ] Update cross-references in doc files
- [ ] Update "Related Documentation" sections
- [ ] Test that all links still work
- [ ] Remove old empty folders (`refactoring/`, `fixes/`, `migrations/` if empty)

## Questions to Consider

1. **Should we keep `features/progress-report/dashboard/` as-is?** (Yes - it's already feature-based)
2. **What about `data/` folder?** (Keep - it's shared across features)
3. **What about `migrations/LOGGING_MIGRATION.md`?** (Move to `architecture/` or keep in root `migrations/`)

## Estimated Impact

- **Files to move:** ~20-25 files
- **References to update:** ~90 in README + cross-references
- **Time:** ~30-45 minutes
- **Benefit:** Much clearer organization, easier to find feature-specific docs
