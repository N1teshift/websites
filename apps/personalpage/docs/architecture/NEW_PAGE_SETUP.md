# New Page Setup Guide

This document outlines the complete procedure for adding a new page to the project, including all required files, configurations, and conventions.

## Overview

When adding a new page, you need to:

1. Add a feature flag to control visibility
2. Create translation files for all languages
3. Add the page to the projects navigation
4. Create the page component with proper structure
5. Set up under construction mode by default

## Step-by-Step Procedure

### 1. Add Feature Flag

Add your new feature to `src/config/features.ts`:

```typescript
export const FEATURE_FLAGS = {
  // ... existing flags ...
  yourNewFeature: false, // Your New Feature - Brief description
} as const;
```

**Convention**: Use camelCase for feature names, set to `false` by default for under construction mode.

### 2. Create Translation Files

Create JSON files for each language in the `locales/` directory:

**File Structure:**

```
locales/
├── en/
│   └── yourfeature.json
├── lt/
│   └── yourfeature.json
└── ru/
    └── yourfeature.json
```

**Required Translation Keys:**

```json
{
  "your_feature_title": "Your Feature Title",
  "your_feature_description": "Brief description of your feature",
  "coming_soon_message": "This feature is currently under development. Check back soon!",
  "nav_home": "Home",
  "nav_section1": "Section 1",
  "nav_section2": "Section 2"
}
```

### 3. Add to Projects Navigation

Update `src/pages/projects/index.tsx` to include your new page:

```typescript
const links = [
  { href: "/projects/edtech", titleKey: "education_technologies", highlighted: true },
  { href: "/projects/emw", titleKey: "election_monitoring" },
  { href: "/projects/yourfeature", titleKey: "your_feature_title" }, // Add this line
];
```

### 4. Create Page Component

Create your page component following this template:

**File:** `src/pages/projects/yourfeature/index.tsx`

```typescript
import { getStaticPropsWithTranslations } from '@lib/getStaticProps';
import Layout from "@components/ui/Layout";
import { isFeatureEnabled } from '@/config/features';
import UnderConstructionPage from '@/features/infrastructure/shared/components/ui/UnderConstructionPage';

const pageNamespaces = ["yourfeature", "links", "common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

export default function YourFeaturePage() {
    // Feature flag check - show under construction if disabled
    if (!isFeatureEnabled('yourNewFeature')) {
        return (
            <UnderConstructionPage
                titleKey="your_feature_title"
                goBackTarget="/projects"
                pageTranslationNamespaces={pageNamespaces}
                messageKey="coming_soon_message"
            />
        );
    }

    return (
        <Layout
            goBackTarget="/projects"
            titleKey="your_feature_title"
            pageTranslationNamespaces={pageNamespaces}
        >
            {/* Your page content here */}
            <div className="p-4">
                <h1>Your Feature Content</h1>
                {/* Add your components and content */}
            </div>
        </Layout>
    );
}
```

### 5. Create Feature Directory Structure (Optional)

If your feature has multiple components, create a feature directory:

```
src/features/yourfeature/
├── components/
│   ├── index.ts
│   └── YourFeatureComponent.tsx
├── hooks/
│   └── useYourFeature.ts
├── types/
│   └── index.ts
└── utils/
    └── yourFeatureUtils.ts
```

## Templates

### Basic Page Template

```typescript
import { getStaticPropsWithTranslations } from '@lib/getStaticProps';
import Layout from "@components/ui/Layout";
import { isFeatureEnabled } from '@/config/features';
import UnderConstructionPage from '@/features/infrastructure/shared/components/ui/UnderConstructionPage';

const pageNamespaces = ["yourfeature", "links", "common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

export default function YourFeaturePage() {
    if (!isFeatureEnabled('yourNewFeature')) {
        return (
            <UnderConstructionPage
                titleKey="your_feature_title"
                goBackTarget="/projects"
                pageTranslationNamespaces={pageNamespaces}
                messageKey="coming_soon_message"
            />
        );
    }

    return (
        <Layout
            goBackTarget="/projects"
            titleKey="your_feature_title"
            pageTranslationNamespaces={pageNamespaces}
        >
            {/* Your content here */}
        </Layout>
    );
}
```

### Translation Template

**English (`locales/en/yourfeature.json`):**

```json
{
  "your_feature_title": "Your Feature Title",
  "your_feature_description": "Description of your feature",
  "coming_soon_message": "This feature is currently under development. Check back soon!",
  "nav_home": "Home",
  "nav_section1": "Section 1"
}
```

**Lithuanian (`locales/lt/yourfeature.json`):**

```json
{
  "your_feature_title": "Jūsų funkcijos pavadinimas",
  "your_feature_description": "Jūsų funkcijos aprašymas",
  "coming_soon_message": "Ši funkcija šiuo metu kuriama. Patikrinkite vėliau!",
  "nav_home": "Pradžia",
  "nav_section1": "1 skyrius"
}
```

**Russian (`locales/ru/yourfeature.json`):**

```json
{
  "your_feature_title": "Название вашей функции",
  "your_feature_description": "Описание вашей функции",
  "coming_soon_message": "Эта функция в настоящее время разрабатывается. Загляните позже!",
  "nav_home": "Главная",
  "nav_section1": "Раздел 1"
}
```

## Checklist

- [ ] Add feature flag to `src/config/features.ts`
- [ ] Create translation files for all languages (en, lt, ru)
- [ ] Add page link to `src/pages/projects/index.tsx`
- [ ] Create page component with proper structure
- [ ] Test under construction mode (feature flag = false)
- [ ] Test enabled mode (feature flag = true)
- [ ] Verify translations work correctly
- [ ] Test navigation and back button functionality

## Environment Variables

You can override feature flags using environment variables:

```bash
NEXT_PUBLIC_FEATURE_YOURNEWFEATURE=true
```

## Best Practices

1. **Always start with under construction mode** - Set feature flag to `false` initially
2. **Use consistent naming** - Feature names in camelCase, translation keys in snake_case
3. **Follow the namespace convention** - `[feature-specific, "links", "common"]`
4. **Test both states** - Ensure the page works in both enabled and disabled states
5. **Use the UnderConstructionPage component** - Maintains consistent UX during development

## Example: Adding a "Task Manager" Feature

Here's a complete example of adding a new "Task Manager" feature:

### 1. Feature Flag

```typescript
// src/config/features.ts
taskManager: false, // Task Manager - Personal task management system
```

### 2. Translation Files

```json
// locales/en/taskmanager.json
{
  "task_manager_title": "Task Manager",
  "task_manager_description": "Manage your personal tasks and projects",
  "coming_soon_message": "Task Manager is currently under development. Check back soon!",
  "nav_tasks": "Tasks",
  "nav_projects": "Projects"
}
```

### 3. Navigation Update

```typescript
// src/pages/projects/index.tsx
const links = [
  // ... existing links ...
  { href: "/projects/taskmanager", titleKey: "task_manager_title" },
];
```

### 4. Page Component

```typescript
// src/pages/projects/taskmanager/index.tsx
import { getStaticPropsWithTranslations } from '@lib/getStaticProps';
import Layout from "@components/ui/Layout";
import { isFeatureEnabled } from '@/config/features';
import UnderConstructionPage from '@/features/infrastructure/shared/components/ui/UnderConstructionPage';

const pageNamespaces = ["taskmanager", "links", "common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

export default function TaskManagerPage() {
    if (!isFeatureEnabled('taskManager')) {
        return (
            <UnderConstructionPage
                titleKey="task_manager_title"
                goBackTarget="/projects"
                pageTranslationNamespaces={pageNamespaces}
                messageKey="coming_soon_message"
            />
        );
    }

    return (
        <Layout
            goBackTarget="/projects"
            titleKey="task_manager_title"
            pageTranslationNamespaces={pageNamespaces}
        >
            <div className="p-4">
                <h1>Task Manager</h1>
                {/* Task manager content */}
            </div>
        </Layout>
    );
}
```

This procedure ensures consistency across all new pages and provides a clear development workflow.
