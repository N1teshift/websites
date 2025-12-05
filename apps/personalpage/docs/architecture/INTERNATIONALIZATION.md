# Internationalization (i18n) Approach

## Core Principles

### 1. Namespace Strategy
Each page defines namespaces in order: `[feature-specific, "links", "common"]`

**Examples:**
- Feature pages: `["calendar", "links", "common"]`
- Simple pages: `["links", "common"]`

### 2. Translation Context
- `Layout` provides `TranslationNamespaceContext` to all children
- All components use `useFallbackTranslation()` hook
- Pass `pageTranslationNamespaces` through component hierarchy

## Implementation Patterns

### Page Structure
```typescript
const pageNamespaces = ["calendar", "links", "common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

export default function LessonSchedulerPage() {
    // Feature flag check
    if (!isFeatureEnabled('lessonScheduler')) {
        return (
            <UnderConstructionPage
                titleKey="lesson_scheduler"
                pageTranslationNamespaces={pageNamespaces}
                messageKey="lesson_scheduler_disabled"
            />
        );
    }

    return (
        <LessonSchedulerLayout pageTranslationNamespaces={pageNamespaces}>
            {/* Feature-specific content */}
        </LessonSchedulerLayout>
    );
}
```

### Translation Usage

**1. Child Components (Most Common)**
```typescript
const { t } = useFallbackTranslation();
return <h1>{t("lesson_scheduler")}</h1>;
```

**2. Page-Level (Before Layout)**
```typescript
const { t } = useFallbackTranslation(pageTranslationNamespaces);
return <p>{t("lesson_scheduler_disabled")}</p>;
```

**3. Simple Pages**
```typescript
export default function Home() {
    return (
        <Layout pageTranslationNamespaces={pageNamespaces}>
            <CenteredLinkGrid links={links} />
        </Layout>
    );
}
```

## Rules for LLMs

1. **Always define `pageNamespaces` at page top**
2. **Pass `pageTranslationNamespaces` to all components that need translations**
3. **Use `useFallbackTranslation()` for all translations**
4. **Child components inherit context, no parameters needed**
5. **Page-level translations need explicit namespaces**
6. **Feature flags use same namespaces as enabled state**

## Related Documentation

For complete instructions on creating new pages with proper internationalization setup, see [NEW_PAGE_SETUP.md](./NEW_PAGE_SETUP.md).
