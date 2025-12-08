# AboutMe Module - Testing Plan

## Module Structure

```
aboutme/
├── components/
│   └── AboutMePage.tsx        (React component)
├── hooks/
│   └── index.ts               (useAboutMeData hook)
├── utils/
│   └── index.ts               (Type guards + useTranslatedObject hook)
└── types/
    └── index.ts               (TypeScript interfaces)
```

---

## Testable Items (Prioritized)

### ✅ Priority 1: Type Guards (Very Easy - Pure Functions)

**Location**: `src/features/modules/aboutme/utils/index.ts`

**Functions to test**:

1. ⭐ `isSkillCategory` - Validates SkillCategory object
2. ⭐ `isSkillCategories` - Validates object of SkillCategories
3. ⭐ `isExperienceItem` - Validates ExperienceItem object
4. ⭐ `isProjectItem` - Validates ProjectItem object
5. ⭐ `isEducationItem` - Validates EducationItem object
6. ⭐ `isLanguageItem` - Validates LanguageItem object
7. ⭐ `isStringArray` - Validates string array

**Why start here**:

- Pure functions, no dependencies
- Easy to test
- High value (data validation is critical)
- Quick wins (can test all in 30-60 minutes)

**Estimated Coverage**: ~40% of aboutme module

---

### ✅ Priority 2: Component (Moderate - Needs React Testing Library)

**Location**: `src/features/modules/aboutme/components/AboutMePage.tsx`

**What to test**:

- Renders all sections (header, skills, experience, etc.)
- Displays translated content correctly
- Renders links (email, LinkedIn) with correct attributes
- Handles empty data gracefully
- Renders lists correctly

**Why this matters**:

- User-facing component
- Catches rendering bugs
- Validates structure

**Estimated Coverage**: ~30% of aboutme module

---

### ✅ Priority 3: Hook (Moderate - Needs React Testing Library + Mocks)

**Location**: `src/features/modules/aboutme/hooks/index.ts`

**What to test**:

- `useAboutMeData` hook returns correct structure
- `useTranslatedObject` hook validates and returns correct data
- Fallback values work when translations are missing
- Error handling for invalid translation data

**Why this matters**:

- Business logic for data fetching
- Type safety validation

**Estimated Coverage**: ~30% of aboutme module

---

## Testing Strategy

### Phase 1: Type Guards (Start Here) ⭐

**Difficulty**: Very Easy  
**Time**: 30-60 minutes  
**Files**: `utils/index.ts`

**Test File**: `utils/__tests__/index.test.ts`

**Example tests needed**:

- Valid objects pass validation
- Invalid objects fail validation
- Edge cases (null, undefined, wrong types)
- Nested validation (arrays within objects)

---

### Phase 2: Component Rendering

**Difficulty**: Moderate  
**Time**: 1-2 hours  
**Files**: `components/AboutMePage.tsx`

**Test File**: `components/__tests__/AboutMePage.test.tsx`

**Requires**: React Testing Library setup

**Tests needed**:

- Component renders without crashing
- All sections are displayed
- Links have correct href attributes
- Lists render correct number of items
- Empty states handled

---

### Phase 3: Hooks

**Difficulty**: Moderate  
**Time**: 1-2 hours  
**Files**: `hooks/index.ts`, `utils/index.ts` (useTranslatedObject)

**Test File**: `hooks/__tests__/index.test.ts`

**Requires**: React Testing Library hooks setup + mocks

**Tests needed**:

- Hook returns expected structure
- Translation integration works
- Fallback values used when translations missing
- Type validation works correctly

---

## Recommended Order

1. ✅ **Type Guards First** (utils/index.ts)
   - Fastest to complete
   - No setup needed
   - Pure functions
   - High confidence gain

2. ⏭️ **Component Second** (AboutMePage.tsx)
   - Visual validation
   - User-facing
   - Medium complexity

3. ⏭️ **Hooks Last** (hooks/index.ts)
   - Most complex (needs mocks)
   - Internal logic

---

## Total Estimated Coverage

**After Phase 1 (Type Guards)**: ~40%  
**After Phase 2 (Component)**: ~70%  
**After Phase 3 (Hooks)**: ~95%

**Total Time**: 3-5 hours for complete coverage

---

## File Structure

```
aboutme/
├── utils/
│   ├── index.ts
│   └── __tests__/
│       └── index.test.ts          ← Start here
├── components/
│   ├── AboutMePage.tsx
│   └── __tests__/
│       └── AboutMePage.test.tsx   ← Phase 2
└── hooks/
    ├── index.ts
    └── __tests__/
        └── index.test.ts          ← Phase 3
```
