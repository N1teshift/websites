# Architecture Analysis & FSD Alignment

**Last Updated:** 2025-01-27  
**Status:** Analysis Complete - Recommendations Provided

## Current Architecture

Your project follows a **Feature-Based Architecture** with:

- `src/features/modules/` - Feature modules (calendar, math, edtech, etc.)
- `src/features/infrastructure/` - Shared infrastructure (api, cache, i18n, logging, shared)
- Each feature has: `components/`, `hooks/`, `types/`, `utils/`, `api/`, `index.ts`

---

## Inconsistencies with Feature-Sliced Design (FSD)

Feature-Sliced Design defines **7 layers** with strict import rules:

```
app → pages → widgets → features → entities → shared
                     ↑
                 processes (optional)
```

### Key FSD Principles:

1. **One-way dependencies**: Layers can only import from lower layers
2. **Public API**: Each slice exports only through `index.ts`
3. **Isolation**: Features don't import from other features directly
4. **Segment consistency**: Each slice has consistent segments (ui, model, api, lib)
5. **Business logic separation**: Entities hold domain models, features orchestrate

---

## 🚨 Current Issues & Inconsistencies

### 1. **Missing Layer Structure**

**Current:** Flat structure under `src/features/`

```
src/features/
├── modules/        (features)
├── infrastructure/ (mixed: shared + lib + app-level)
└── ...
```

**FSD Should Be:**

```
src/
├── app/           (app initialization, providers)
├── pages/         (routing, page composition)
├── widgets/       (complex composite components)
├── features/      (business features)
├── entities/      (business entities/models)
└── shared/        (pure technical utilities)
```

**Issue:** No clear separation between app-level code, pages, widgets, and shared utilities.

---

### 2. **Feature-to-Feature Imports** ❌

**Violations Found:**

```typescript
// ❌ BAD: Feature importing another feature
// src/features/modules/math/MathObjectGeneratorPage.tsx
import { VoicePromptButton } from "@/features/modules/voice";

// ❌ BAD: Feature importing from another feature
// src/features/modules/edtech/unitPlanGenerator/...
import { applyKMMMYPUnitFormatting } from "@/features/modules/edtech/progressReport/components/excel";
```

**FSD Rule:** Features should NOT import from other features. They should:

- Use **entities** for shared domain models
- Use **widgets** for reusable composite UI
- Use **shared** for utilities

---

### 3. **No Entities Layer** ❌

**Current:** Domain models are mixed into features:

```typescript
// Domain models scattered across features
src / features / modules / edtech / progressReport / types / ProgressReportTypes.ts;
src / features / modules / math / types / mathTypes.ts;
src / features / modules / calendar / types / index.ts;
```

**FSD Should Have:**

```
src/entities/
├── student/
│   ├── model/
│   ├── api/
│   └── index.ts
├── assessment/
├── calendar-event/
└── ...
```

**Issue:** No centralized domain models that can be shared across features.

---

### 4. **Shared vs Infrastructure Confusion** ⚠️

**Current:**

- `src/features/infrastructure/shared/` - UI components + utils
- `src/features/infrastructure/api/` - API clients
- `src/features/infrastructure/i18n/` - i18n setup
- `src/features/infrastructure/logging/` - Logging utilities

**FSD Should Separate:**

- **`shared/`**: Pure technical utilities (no business logic, no UI dependencies)
- **`infrastructure/`** or **`lib/`**: Framework-specific setup (should be minimal or in `app/`)

**Issue:** Mixing business-agnostic utilities with app-level infrastructure.

---

### 5. **Pages Directly Reference Features** ❌

**Current:**

```typescript
// src/pages/projects/edtech/progressReport.tsx
import { ProgressReportPage } from "@/features/modules/edtech/progressReport";
```

**FSD Rule:** Pages should compose widgets, not directly import feature components.

**Should Be:**

```typescript
// src/pages/projects/edtech/progressReport.tsx
import { ProgressReportWidget } from "@/widgets/progress-report";
```

---

### 6. **Inconsistent Segments** ⚠️

**Current Feature Structure:**

```
feature/
├── components/  (UI)
├── hooks/       (State)
├── types/       (Types)
├── utils/       (Business logic)
├── api/         (API calls)
└── index.ts
```

**FSD Segments:**

```
feature/
├── ui/          (UI components)
├── model/       (State, hooks, business logic)
├── api/         (API integration)
├── lib/         (Feature-specific utilities)
└── index.ts     (Public API)
```

**Issues:**

- `components/` vs `ui/` - inconsistent naming
- `hooks/` + `utils/` should be `model/`
- No clear separation between business logic (model) and utilities (lib)

---

### 7. **No Widgets Layer** ❌

**Current:** Complex composite components are mixed in features or shared:

```typescript
// Complex composite component in shared
src / features / infrastructure / shared / components / table / GenericTable.tsx;

// Or in features themselves
src / features / modules / edtech / progressReport / components / sections / ClassViewSection.tsx;
```

**FSD Should Have:**

```
src/widgets/
├── progress-report-table/
├── class-statistics/
├── calendar-view/
└── ...
```

**Issue:** No layer for reusable composite components that combine multiple entities/features.

---

### 8. **Collections vs Features Confusion** ⚠️

**Current:** You have "Collections" (edtech, math, ai) that contain multiple sub-features:

```
src/features/modules/edtech/
├── progressReport/
└── unitPlanGenerator/
```

**FSD Perspective:** These should either be:

- Separate features at the same level
- Or use **processes** layer for cross-cutting workflows

**Issue:** Unclear boundaries between features and collections.

---

## ✅ What You're Doing Right

1. **Barrel Exports**: Good use of `index.ts` for public APIs ✅
2. **Consistent Structure**: Features follow similar patterns ✅
3. **Infrastructure Separation**: Clear separation of shared utilities ✅
4. **Type Safety**: Strong TypeScript usage ✅
5. **Documentation**: Good README files in features ✅

---

## 🎯 Recommended Improvements (Priority Order)

### **Priority 1: Fix Feature-to-Feature Imports** 🔴

**Action:** Extract shared domain logic into entities.

**Example:**

```typescript
// Before: ❌
// math feature imports voice feature
import { VoicePromptButton } from "@/features/modules/voice";

// After: ✅
// Create widget that combines entities
// src/widgets/voice-prompt/
import { VoiceEntity } from "@/entities/voice";
import { PromptEntity } from "@/entities/prompt";
```

**Steps:**

1. Identify cross-feature dependencies
2. Extract shared models to `entities/`
3. Extract shared UI to `widgets/`
4. Remove feature-to-feature imports

---

### **Priority 2: Introduce Entities Layer** 🟡

**Action:** Create `src/entities/` for shared domain models.

**Structure:**

```
src/entities/
├── student/
│   ├── model/
│   │   └── types.ts
│   ├── api/
│   │   └── studentApi.ts
│   └── index.ts
├── assessment/
├── calendar-event/
└── ...
```

**Benefits:**

- Features can share domain models
- Clear domain boundaries
- Easier testing and reuse

---

### **Priority 3: Standardize Segments** 🟡

**Action:** Rename and reorganize feature segments to FSD standard.

**Current → FSD:**

- `components/` → `ui/`
- `hooks/` + `utils/` → `model/` (business logic) + `lib/` (utilities)
- `types/` → `model/types.ts`
- `api/` → `api/` (unchanged)

**Migration Plan:**

1. Update one feature as a pilot
2. Document the pattern
3. Gradually migrate others

---

### **Priority 4: Separate Shared from Infrastructure** 🟢

**Action:** Split `infrastructure/` into:

- **`shared/`**: Pure utilities (no React, no business logic)
- **`app/`**: App-level setup (providers, config)
- **Keep `infrastructure/`**: Only for framework-specific code

**Structure:**

```
src/
├── app/
│   ├── providers/
│   ├── config/
│   └── index.tsx
├── shared/
│   ├── lib/
│   │   ├── dateUtils.ts
│   │   └── formatUtils.ts
│   └── ui/
│       └── (move pure UI primitives here)
└── infrastructure/
    └── (only framework-specific: Next.js config, etc.)
```

---

### **Priority 5: Introduce Widgets Layer** 🟢

**Action:** Create `src/widgets/` for composite components.

**Candidates:**

- `progress-report-table` - Complex table combining entities
- `class-statistics-cards` - Composite statistics display
- `calendar-view` - Complex calendar composition

**Rule:** Widgets can import from:

- ✅ entities
- ✅ shared
- ❌ NOT from features

---

### **Priority 6: Clarify Pages Layer** 🟢

**Action:** Ensure pages only compose widgets, not features directly.

**Current Pattern (OK for now):**

```typescript
// Pages can import from features during transition
import { ProgressReportPage } from "@/features/.../progressReport";
```

**Target Pattern:**

```typescript
// Pages should compose widgets
import { ProgressReportWidget } from "@/widgets/progress-report";
```

**Note:** This can be done gradually as you introduce widgets.

---

### **Priority 7: Handle Collections** 🔵

**Option A:** Split collections into separate features:

```
edtech-progress-report/
edtech-unit-plan/
```

**Option B:** Use Processes layer (FSD advanced):

```
processes/
└── edtech-workflow/
    ├── model/
    └── ui/
```

**Recommendation:** Start with Option A (simpler), consider Option B later if you need cross-cutting workflows.

---

## 📋 Migration Roadmap

### **Phase 1: Foundation (2-3 weeks)**

1. ✅ Create `entities/` layer
2. ✅ Extract shared domain models
3. ✅ Fix feature-to-feature imports
4. ✅ Document entity contracts

### **Phase 2: Standardization (2-3 weeks)**

1. ✅ Pilot segment rename (1 feature)
2. ✅ Standardize feature segments
3. ✅ Update documentation
4. ✅ Create migration guide

### **Phase 3: Layer Completion (3-4 weeks)**

1. ✅ Create `widgets/` layer
2. ✅ Extract composite components
3. ✅ Update pages to use widgets
4. ✅ Separate `shared/` from `infrastructure/`

### **Phase 4: Cleanup (1-2 weeks)**

1. ✅ Handle collections
2. ✅ Final audit
3. ✅ Update all documentation
4. ✅ Establish linting rules

---

## 🔧 Tooling Recommendations

### ESLint Rules for FSD

```json
{
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          {
            "group": ["@/features/modules/*"],
            "message": "Features cannot import from other features. Use entities or widgets instead."
          },
          {
            "group": ["@/features/*/model"],
            "message": "Model layer should not be imported directly. Use public API from index.ts"
          }
        ]
      }
    ]
  }
}
```

### Import Path Aliases

```json
{
  "paths": {
    "@/app/*": ["src/app/*"],
    "@/pages/*": ["src/pages/*"],
    "@/widgets/*": ["src/widgets/*"],
    "@/features/*": ["src/features/*"],
    "@/entities/*": ["src/entities/*"],
    "@/shared/*": ["src/shared/*"]
  }
}
```

---

## 📚 FSD Resources

- [Feature-Sliced Design Methodology](https://feature-sliced.design/)
- [FSD Layers](https://feature-sliced.design/docs/get-started/layers)
- [FSD Segments](https://feature-sliced.design/docs/get-started/segments)
- [Import Rules](https://feature-sliced.design/docs/reference/import-rules)

---

## 🎯 Success Criteria

After migration, you should be able to:

1. ✅ **No feature-to-feature imports** - Verified by linting
2. ✅ **Clear layer boundaries** - Each layer has distinct purpose
3. ✅ **Shared domain models** - Entities are reusable
4. ✅ **Composable UI** - Widgets can be combined freely
5. ✅ **Consistent structure** - All features follow same pattern
6. ✅ **Easy testing** - Entities and features are isolated
7. ✅ **Scalable** - New features can be added without touching existing code

---

## 📝 Notes

- **Gradual Migration**: You don't need to migrate everything at once. Start with Priority 1-2.
- **Backward Compatible**: Keep old structure working during migration
- **Team Alignment**: Document decisions and share with team
- **Real-world**: FSD is a methodology, adapt it to your needs

---

**Next Steps:**

1. Review this document
2. Choose starting point (recommend: Priority 1)
3. Create detailed migration plan for chosen priority
4. Execute and iterate
