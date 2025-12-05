# FSD Quick Reference - Architecture Improvements

**Quick guide for aligning your architecture with Feature-Sliced Design**

---

## 🔴 Critical Issues (Fix First)

### 1. Feature-to-Feature Imports

**Problem:**
```typescript
// ❌ BAD: math imports voice
import { VoicePromptButton } from "@/features/modules/voice";
```

**Solution:**
```typescript
// ✅ GOOD: Create widget that uses entities
// src/widgets/voice-prompt/ (combines voice + prompt entities)
```

**Files to Fix:**
- `src/features/modules/math/MathObjectGeneratorPage.tsx` - imports voice
- `src/features/modules/edtech/unitPlanGenerator/...` - imports progressReport
- Check all cross-feature imports

---

### 2. Missing Entities Layer

**Problem:** Domain models scattered across features.

**Solution:** Create `src/entities/` for shared domain models.

**Example Structure:**
```
src/entities/
├── student/
│   ├── model/
│   │   └── types.ts
│   └── index.ts
├── assessment/
├── calendar-event/
└── voice-prompt/
```

**What Goes Here:**
- Domain models (Student, Assessment, CalendarEvent)
- Entity-specific API calls
- NOT: UI components or business workflows

---

## 🟡 Important Improvements

### 3. Standardize Segments

**Current:**
```
feature/
├── components/
├── hooks/
├── types/
├── utils/
└── api/
```

**FSD Standard:**
```
feature/
├── ui/          (UI components - rename from components/)
├── model/       (State + business logic - combine hooks + utils)
├── api/         (API calls - keep as is)
├── lib/         (Feature utilities - optional)
└── index.ts     (Public API - keep as is)
```

**Migration:** Rename gradually, starting with 1 feature as pilot.

---

### 4. Separate Shared from Infrastructure

**Current:** Everything under `infrastructure/`

**Better:**
```
src/
├── app/              (App-level: providers, config)
├── shared/           (Pure utilities: no React, no business logic)
│   ├── lib/
│   └── ui/           (Pure UI primitives)
└── infrastructure/   (Only framework-specific: Next.js config)
```

---

## 🟢 Nice-to-Have Improvements

### 5. Create Widgets Layer

**For:** Complex composite components that combine multiple entities/features

**Structure:**
```
src/widgets/
├── progress-report-table/
├── class-statistics/
└── calendar-view/
```

**Rule:** Widgets can import from:
- ✅ entities
- ✅ shared
- ❌ NOT from features

---

### 6. Pages Should Use Widgets

**Current Pattern (OK for transition):**
```typescript
import { ProgressReportPage } from '@/features/...';
```

**Target Pattern:**
```typescript
import { ProgressReportWidget } from '@/widgets/progress-report';
```

---

## 📊 Layer Dependency Rules

**FSD Import Rules (one-way only):**

```
app
 ↓
pages
 ↓
widgets
 ↓
features
 ↓
entities
 ↓
shared
```

**Allowed:**
- ✅ `features` → `entities`, `shared`
- ✅ `widgets` → `entities`, `shared`
- ✅ `pages` → `widgets`, `features`, `entities`, `shared`
- ✅ `app` → everything

**NOT Allowed:**
- ❌ `features` → `features` (use entities/widgets instead)
- ❌ `entities` → `features`, `widgets`, `pages`
- ❌ `shared` → anything (pure utilities)

---

## 🎯 Quick Wins (Do These First)

### Week 1: Fix Imports
1. Identify all feature-to-feature imports
2. Document what they're importing
3. Plan extraction to entities/widgets

### Week 2: Create Entities
1. Create `src/entities/` structure
2. Extract shared domain models
3. Update imports

### Week 3: Standardize One Feature
1. Pick a simple feature (e.g., `aboutme`)
2. Rename segments to FSD standard
3. Document the pattern

### Week 4: Apply Pattern
1. Gradually migrate other features
2. Add linting rules
3. Update documentation

---

## 📝 Example Migration

### Before:
```typescript
// src/features/modules/math/MathObjectGeneratorPage.tsx
import { VoicePromptButton } from "@/features/modules/voice";
```

### After:
```typescript
// src/widgets/voice-prompt/ui/VoicePromptButton.tsx
import { useVoiceEntity } from '@/entities/voice';

// src/features/modules/math/MathObjectGeneratorPage.tsx
import { VoicePromptButton } from "@/widgets/voice-prompt";
```

---

## 🔍 Audit Checklist

- [ ] No feature-to-feature imports
- [ ] Entities layer exists with shared domain models
- [ ] Features use standardized segments (ui/model/api)
- [ ] Shared utilities separated from infrastructure
- [ ] Widgets layer for composite components
- [ ] Pages use widgets (eventually)
- [ ] Linting rules enforce import rules
- [ ] Documentation updated

---

## 📚 More Info

See `ARCHITECTURE_ANALYSIS.md` for detailed analysis and migration roadmap.

