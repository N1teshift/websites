# Architecture Violations Summary

**Last Updated:** 2025-01-27  
**Status:** Audit Complete - Real Violations Found

This document lists actual violations found in your codebase that are inconsistent with Feature-Sliced Design principles.

---

## 🔴 Critical Violations

### 1. Feature-to-Feature Imports (7 violations)

**FSD Rule:** Features cannot import from other features directly.

#### Violation #1: `math` → `voice`
```typescript
// ❌ src/features/modules/math/MathObjectGeneratorPage.tsx:9
import { VoicePromptButton, PromptButton } from "@/features/modules/voice";
```
**Fix:** Extract voice UI to a widget, or move voice prompt to entities if it's a domain model.

#### Violation #2: `edtech/unitPlanGenerator` → `edtech/progressReport`
```typescript
// ❌ src/features/modules/edtech/unitPlanGenerator/components/sections/dataManagement/useExportHandlers.ts:5
import { applyKMMMYPUnitFormatting } from '@/features/modules/edtech/progressReport/components/excel';
```
**Fix:** Extract Excel formatting utilities to `shared/lib/` or create a widget.

#### Violation #3: `math` internal sub-feature import
```typescript
// ❌ src/features/modules/math/ExercisesGeneratorPage.tsx:7
import { fetchExercises, fetchMetadata } from "@/features/modules/math/exercisesGenerator/utils/exercisesApi";
```
**Note:** This is within the same collection (`math`), but still violates single feature boundary. Consider splitting `math` into separate features.

#### Violation #4: `math` internal shared import
```typescript
// ❌ src/features/modules/math/MathObjectGeneratorPage.tsx:6
import { generate } from "@/features/modules/math/shared/Orchestrator";
```
**Note:** `math/shared/` suggests this should be an entity or separate feature.

#### Violation #5: `math` internal validator import
```typescript
// ❌ src/features/modules/math/mathObjectSettings/hooks/coefficientHooks.ts:7
import { areRulesPairwiseCompatible } from '@/features/modules/math/shared/coefficientConceptualValidator';
```
**Fix:** Move validators to entities or shared utilities.

#### Violation #6-7: `edtech/progressReport` internal `student-data` imports
```typescript
// ❌ Multiple files in src/features/modules/edtech/progressReport/student-data/
import { StudentData } from '@/features/modules/edtech/progressReport/types/ProgressReportTypes';
import { ... } from '@/features/modules/edtech/progressReport/utils/missionUtils';
```
**Note:** `student-data` is a sub-module but imports from parent. Should be in `entities/student/` or consolidated.

---

### 2. Infrastructure Importing from Features (3 violations)

**FSD Rule:** Infrastructure should not import from features (business logic).

#### Violation #8: `infrastructure/api/firebase` → `math/tests`
```typescript
// ❌ src/features/infrastructure/api/firebase/firestoreService.ts:2-4
import { saveTestResults, fetchTestStats } from '@/features/modules/math/tests/services/testResultsService';
import { TestResultData, TestSummary } from '@/features/modules/math/types/testsTypes';
```
**Fix:** Move test results to `entities/test-result/` or move service logic to feature's api layer.

#### Violation #9: `infrastructure/api/microsoft/calendar` → `calendar`
```typescript
// ❌ src/features/infrastructure/api/microsoft/calendar/microsoftCalendarUtils.ts:4
import { MicrosoftEvent } from '@/features/modules/calendar/types';
```
**Fix:** Move calendar event types to `entities/calendar-event/` or `shared/types/`.

#### Violation #10: `infrastructure/ai` → `edtech/unitPlanGenerator`
```typescript
// ❌ src/features/infrastructure/ai/services/unitPlanAI.ts:6
import { UnitPlanData } from '@/features/modules/edtech/unitPlanGenerator/types/UnitPlanTypes';
```
**Fix:** Move unit plan types to `entities/unit-plan/` or extract AI-agnostic types to shared.

---

### 3. Pages Directly Importing Features (6 violations)

**FSD Rule:** Pages should compose widgets, not directly import feature components.

#### Violation #11-16: Pages importing features directly
```typescript
// ❌ All in src/pages/projects/edtech/
import { ProgressReportPage } from '@/features/modules/edtech/progressReport';
import { UnitPlanGeneratorPage } from '@/features/modules/edtech/unitPlanGenerator';
import MathObjectGeneratorPage from '@/features/modules/math/MathObjectGeneratorPage';
import ExamGeneratorPage from '@/features/modules/math/ExamGeneratorPage';
import { ConnectingVesselsPage } from '@/features/modules/connecting_vessels';

// ❌ src/pages/api/firestore/fetchTestStats.ts:2
import { fetchTestStats } from '@/features/modules/math/tests/services/testResultsService';
```
**Fix:** Create widgets layer and import from widgets instead. For API routes, this is acceptable but consider moving to feature's api layer.

---

## 🟡 Structural Issues

### 4. No Entities Layer

**Problem:** Domain models are scattered across features:
- `StudentData` in `edtech/progressReport/types/`
- `TestResultData` in `math/types/`
- `MicrosoftEvent` in `calendar/types/`
- `UnitPlanData` in `edtech/unitPlanGenerator/types/`

**Should Be:**
```
src/entities/
├── student/
│   └── model/types.ts
├── test-result/
│   └── model/types.ts
├── calendar-event/
│   └── model/types.ts
└── unit-plan/
    └── model/types.ts
```

---

### 5. Inconsistent Segments

**Current:** Mixed naming and organization
```
feature/
├── components/     (some features)
├── ui/             (should be standard)
├── hooks/          (some features)
├── model/          (should combine hooks + utils)
├── types/          (should be in model/)
└── utils/          (should be model/ or lib/)
```

**FSD Standard:**
```
feature/
├── ui/             (UI components)
├── model/          (State, hooks, business logic, types)
├── api/            (API integration)
├── lib/            (Feature-specific utilities)
└── index.ts        (Public API)
```

---

### 6. Collections Confusion

**Problem:** Features grouped in collections:
- `edtech/` contains `progressReport/` and `unitPlanGenerator/`
- `math/` contains multiple generators and tests

**FSD Perspective:**
- Each should be a separate feature at the same level, OR
- Use `processes/` layer for cross-cutting workflows

**Example:**
```
// Current:
src/features/modules/edtech/
├── progressReport/
└── unitPlanGenerator/

// FSD Option 1:
src/features/
├── progress-report/
└── unit-plan-generator/

// FSD Option 2:
src/processes/
└── edtech-workflow/
```

---

### 7. Shared vs Infrastructure Confusion

**Problem:** Everything under `infrastructure/`:
```
src/features/infrastructure/
├── shared/          (UI components + utils - should be separate)
├── api/             (API clients - OK)
├── i18n/            (i18n setup - OK)
├── logging/         (Logging - OK)
└── cache/           (Cache utils - should be in shared)
```

**Should Be:**
```
src/
├── shared/          (Pure utilities, no React)
│   ├── lib/
│   └── ui/          (Pure UI primitives)
├── app/             (App-level setup)
│   ├── providers/
│   └── config/
└── infrastructure/  (Only framework-specific)
    └── (Next.js config, etc.)
```

---

## 📊 Statistics

### Violations Count:
- 🔴 **Critical:** 16 violations
  - Feature-to-feature imports: 7
  - Infrastructure importing features: 3
  - Pages importing features: 6
  
- 🟡 **Structural:** 4 major issues
  - No entities layer
  - Inconsistent segments
  - Collections confusion
  - Shared/infrastructure confusion

### Most Problematic Features:
1. **`math/`** - 5 violations (imports voice, has shared/ subfolder)
2. **`edtech/`** - 4 violations (cross-sub-feature imports)
3. **`infrastructure/`** - 3 violations (imports from features)

---

## 🎯 Priority Fixes

### Immediate (Week 1):
1. Fix feature-to-feature imports (7 violations)
2. Create entities layer for shared domain models
3. Move infrastructure imports to entities/shared

### Short-term (Weeks 2-4):
4. Standardize feature segments (pilot 1 feature)
5. Create widgets layer for composite components
6. Update pages to use widgets

### Medium-term (Months 2-3):
7. Split collections into separate features
8. Separate shared from infrastructure
9. Add ESLint rules to enforce import rules

---

## 📝 Next Steps

1. **Review violations** - Understand what needs to be fixed
2. **Prioritize** - Start with critical violations (feature-to-feature imports)
3. **Plan migration** - Create detailed migration plan (see `ARCHITECTURE_ANALYSIS.md`)
4. **Execute gradually** - Fix one violation type at a time
5. **Add tooling** - ESLint rules to prevent future violations

---

**See Also:**
- `ARCHITECTURE_ANALYSIS.md` - Complete analysis and recommendations
- `FSD_QUICK_REFERENCE.md` - Quick reference guide
- [Feature-Sliced Design Docs](https://feature-sliced.design/)

