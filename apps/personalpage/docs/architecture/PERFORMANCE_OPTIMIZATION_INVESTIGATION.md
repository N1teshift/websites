# Performance & Optimization Investigation Report

**Date:** 2025-01-27  
**Status:** Investigation Complete  
**Priority:** 🟡 MEDIUM

## Executive Summary

This report investigates the six performance optimization tasks outlined in `COMPREHENSIVE_TODO.md`. Each task has been analyzed, and specific findings, recommendations, and implementation steps are provided.

---

## 1. Bundle Analysis

### Current State

- ❌ **No bundle analyzer configured**
- ✅ Next.js 15.0.3 with webpack configuration present
- ✅ Production source maps disabled (good for performance)

### Findings

- No `@next/bundle-analyzer` package in dependencies
- No bundle analysis scripts in `package.json`
- No webpack bundle size analysis configured

### Recommendations

1. Install `@next/bundle-analyzer` as dev dependency
2. Add bundle analysis scripts to `package.json`
3. Configure `next.config.ts` to support bundle analysis
4. Run initial analysis to identify large dependencies
5. Review and optimize:
   - Large dependencies (e.g., `mathjs`, `langchain`, `recharts`)
   - Duplicate dependencies
   - Unused code/tree-shaking opportunities

### Implementation Steps

```bash
npm install --save-dev @next/bundle-analyzer
```

Add to `next.config.ts`:

```typescript
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
```

Add to `package.json` scripts:

```json
"analyze": "ANALYZE=true next build",
"analyze:server": "BUNDLE_ANALYZE=server ANALYZE=true next build",
"analyze:browser": "BUNDLE_ANALYZE=browser ANALYZE=true next build"
```

### Estimated Impact

- **Time:** 2-4 hours
- **Bundle Size Reduction:** Potentially 20-30% with optimizations
- **Priority:** HIGH (foundation for other optimizations)

---

## 2. Image Optimization

### Current State

- ✅ **All images use `next/image`** (no `<img>` tags found)
- ✅ `ImageCarousel` component uses `next/image` with proper `fill` prop
- ✅ `ProjectImage` component uses `next/image` with width/height
- ✅ Image configuration in `next.config.ts` for remote patterns

### Findings

- ✅ No native `<img>` tags found in codebase
- ✅ Images in `ImageCarousel` use `fill` with proper container sizing
- ✅ `ProjectImage` uses fixed dimensions (800x600)
- ⚠️ Some images may benefit from `priority` flag optimization
- ⚠️ Consider adding `sizes` prop for responsive images

### Recommendations

1. ✅ **Already optimized** - All images use `next/image`
2. Review and optimize:
   - Add `priority` flag to above-the-fold images
   - Add `sizes` prop for responsive images
   - Consider WebP format conversion
   - Review image dimensions (800x600 may be too large for some use cases)

### Implementation Steps

1. Audit all `Image` components for:
   - Above-the-fold images should have `priority={true}`
   - Responsive images should have `sizes` prop
   - Consider lazy loading for below-the-fold images
2. Optimize image dimensions based on actual display size
3. Consider adding image optimization service (e.g., Cloudinary, Imgix)

### Estimated Impact

- **Time:** 1-2 hours
- **Performance Gain:** Moderate (images already optimized)
- **Priority:** LOW (already well-optimized)

---

## 3. SEO Audit

### Current State

- ❌ **No meta tags found in pages**
- ❌ No `next/head` usage
- ✅ `_document.tsx` has basic HTML structure
- ✅ `lang="en"` attribute set (but should be dynamic based on locale)

### Findings

- No `<Head>` component usage in any pages
- No Open Graph tags
- No Twitter Card tags
- No meta descriptions
- No canonical URLs
- Language attribute is hardcoded to "en" (should support lt, en, ru)

### Recommendations

1. Create SEO component or hook for meta tags
2. Add meta tags to all pages:
   - Title (with locale support)
   - Description
   - Open Graph tags
   - Twitter Card tags
   - Canonical URLs
3. Update `_document.tsx` to support dynamic language
4. Add structured data (JSON-LD) for better search visibility

### Implementation Steps

1. Create `SEO` component or `useSEO` hook
2. Add meta tags to each page:

   ```typescript
   import Head from 'next/head';

   <Head>
     <title>{t('page_title')}</title>
     <meta name="description" content={t('page_description')} />
     <meta property="og:title" content={t('page_title')} />
     <meta property="og:description" content={t('page_description')} />
     <meta property="og:type" content="website" />
     <link rel="canonical" href={canonicalUrl} />
   </Head>
   ```

3. Support i18n in meta tags
4. Add structured data for key pages

### Estimated Impact

- **Time:** 4-6 hours
- **SEO Improvement:** Significant
- **Priority:** MEDIUM (important for discoverability)

---

## 4. Accessibility (a11y) Audit

### Current State

- ⚠️ **Limited accessibility attributes found**
- ✅ Some components use semantic HTML (`<label>`, `<button>`)
- ❌ No `aria-label` attributes found
- ❌ No `aria-describedby` attributes
- ❌ No keyboard navigation indicators
- ⚠️ Color contrast not verified

### Findings

- Components like `BooleanToggle`, `Dropdown`, `NumberInput` use semantic HTML
- Missing accessibility attributes:
  - `aria-label` for icon buttons
  - `aria-describedby` for form fields with help text
  - `aria-expanded` for dropdowns
  - `aria-live` for dynamic content
- No focus management for modals
- No skip links
- Keyboard navigation not fully tested

### Recommendations

1. Add accessibility attributes to all interactive elements
2. Implement keyboard navigation
3. Add focus management for modals and dynamic content
4. Test with screen readers (NVDA, JAWS, VoiceOver)
5. Run automated accessibility audit (axe-core, Lighthouse)
6. Verify color contrast (WCAG AA minimum)

### Implementation Steps

1. Install accessibility testing tools:
   ```bash
   npm install --save-dev @axe-core/react eslint-plugin-jsx-a11y
   ```
2. Add `aria-label` to all icon buttons
3. Add `aria-describedby` to form fields
4. Add `aria-expanded` to dropdowns
5. Implement focus traps for modals
6. Add skip links
7. Test with screen readers
8. Run Lighthouse accessibility audit

### Estimated Impact

- **Time:** 6-8 hours
- **Accessibility Improvement:** Significant
- **Priority:** MEDIUM-HIGH (legal compliance, user experience)

---

## 5. Context Audit

### Current State

#### TranslationNamespaceContext

- ✅ Simple context structure
- ⚠️ **Potential re-render issue**: Context value object recreated on every render in `Layout.tsx`
- Location: `src/features/infrastructure/i18n/TranslationNamespaceContext.tsx`
- Used in: `Layout.tsx` (provides context to all pages)

**Issue Found:**

```typescript
// In Layout.tsx (line 62-69)
const contextValue = {
  translationNs: pageTranslationNamespaces,
  defaultNS: Array.isArray(pageTranslationNamespaces)
    ? pageTranslationNamespaces[0]
    : pageTranslationNamespaces,
  fallbackNS: Array.isArray(pageTranslationNamespaces) ? pageTranslationNamespaces.slice(1) : [],
};
// This object is recreated on every render!
```

#### InterfaceContext

- ⚠️ **Potential re-render issue**: Context value object recreated on every render
- Location: `src/features/modules/math/mathObjectSettings/components/InterfaceContext.ts`
- Used in: `MathObjectSettingsListContainer.tsx`

**Issue Found:**

```typescript
// In MathObjectSettingsListContainer.tsx (line 82)
<InterfaceContext.Provider value={{ interfaceMap, setInterfaceMap }}>
// This object is recreated on every render!
```

### Recommendations

#### For TranslationNamespaceContext:

1. Memoize the context value using `useMemo`
2. Only recreate when `pageTranslationNamespaces` changes

#### For InterfaceContext:

1. Memoize the context value using `useMemo`
2. Only recreate when `interfaceMap` or `setInterfaceMap` changes
3. Consider splitting into separate contexts if needed

### Implementation Steps

**TranslationNamespaceContext fix:**

```typescript
// In Layout.tsx
const contextValue = useMemo(
  () => ({
    translationNs: pageTranslationNamespaces,
    defaultNS: Array.isArray(pageTranslationNamespaces)
      ? pageTranslationNamespaces[0]
      : pageTranslationNamespaces,
    fallbackNS: Array.isArray(pageTranslationNamespaces) ? pageTranslationNamespaces.slice(1) : [],
  }),
  [pageTranslationNamespaces]
);
```

**InterfaceContext fix:**

```typescript
// In MathObjectSettingsListContainer.tsx
const contextValue = useMemo(
  () => ({
    interfaceMap,
    setInterfaceMap,
  }),
  [interfaceMap, setInterfaceMap]
);
```

### Estimated Impact

- **Time:** 1-2 hours
- **Performance Gain:** Moderate (reduces unnecessary re-renders)
- **Priority:** MEDIUM (can improve perceived performance)

---

## 6. Custom Hooks Extraction

### Current State

#### MathObjectGeneratorPage

- ⚠️ **Complex logic in component** (116 lines)
- Multiple state variables (6 useState calls)
- Complex async logic in `handlePromptResult`
- Business logic mixed with UI logic

**Current Structure:**

- State management: `mathObjectSettingsList`, `mathItems`, `errorMessage`, `isGenerating`, `loadingMessage`, `lastPrompt`
- Complex handlers: `handlePromptResult`, `generateMathItems`
- Ref management: `presetInterfaceTypesRef`

### Recommendations

1. Extract state management to `useMathObjectGenerator` hook
2. Extract prompt handling to `usePromptHandler` hook
3. Extract generation logic to `useMathGeneration` hook

### Implementation Steps

**Create `useMathObjectGenerator` hook:**

```typescript
// src/features/modules/math/hooks/useMathObjectGenerator.ts
export function useMathObjectGenerator() {
  const [mathObjectSettingsList, setMathObjectSettingsList] = useState<MathObjectSettings[]>([
    DEFAULT_MATH_OBJECT_SETTINGS,
  ]);
  const [mathItems, setMathItems] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [lastPrompt, setLastPrompt] = useState("");

  // ... logic extracted from component

  return {
    mathObjectSettingsList,
    setMathObjectSettingsList,
    mathItems,
    errorMessage,
    isGenerating,
    loadingMessage,
    lastPrompt,
    handlePromptResult,
    generateMathItems,
    // ... other handlers
  };
}
```

**Refactor MathObjectGeneratorPage:**

```typescript
export default function MathObjectGeneratorPage() {
  const {
    mathObjectSettingsList,
    setMathObjectSettingsList,
    mathItems,
    errorMessage,
    isGenerating,
    loadingMessage,
    lastPrompt,
    handlePromptResult,
    generateMathItems,
  } = useMathObjectGenerator();

  // ... simplified component
}
```

### Estimated Impact

- **Time:** 3-4 hours
- **Code Quality:** Significant improvement
- **Maintainability:** Much better
- **Priority:** MEDIUM (improves code organization)

---

## Priority Ranking

1. **Bundle Analysis** (HIGH) - Foundation for other optimizations
2. **Context Audit** (MEDIUM) - Quick win, reduces re-renders
3. **SEO Audit** (MEDIUM) - Important for discoverability
4. **Accessibility Audit** (MEDIUM-HIGH) - Legal compliance, UX
5. **Custom Hooks** (MEDIUM) - Code quality improvement
6. **Image Optimization** (LOW) - Already well-optimized

---

## Implementation Plan

### Phase 1: Quick Wins (2-3 hours)

1. ✅ Context Audit fixes (useMemo for context values)
2. ✅ Bundle analyzer setup

### Phase 2: SEO & Accessibility (8-10 hours)

3. ✅ SEO component/hook creation
4. ✅ Meta tags for all pages
5. ✅ Accessibility attributes and testing

### Phase 3: Code Quality (3-4 hours)

6. ✅ Custom hooks extraction
7. ✅ Image optimization review

### Total Estimated Time: 13-17 hours (1.5-2 days)

---

## Next Steps

1. Review this investigation report
2. Prioritize tasks based on business needs
3. Create implementation tickets/todos
4. Begin with Phase 1 (quick wins)
5. Schedule Phase 2 and Phase 3

---

## Notes

- All findings are based on static code analysis
- Runtime performance testing recommended after implementation
- Consider using React DevTools Profiler to verify re-render improvements
- Bundle analysis should be run after each major dependency addition
