# @websites/ui

Shared UI components package for all websites in the monorepo.

## Contents

This package contains reusable UI components that are shared across all websites:

### Core Components
- `Button` - Versatile button component with multiple variants
- `Card` - Card container component
- `Input` - Basic input components (NumberInput, SelectInput)
- `TextArea` - Text area input component
- `NumberInput` - Advanced number input with i18n support
- `Dropdown` - Custom dropdown component
- `CheckboxGroup` - Checkbox group component
- `IconButton` - Icon button component

### Layout Components
- `Layout` - Main layout wrapper with translation context
- `LoadingScreen` - Full-screen loading indicator
- `LoadingOverlay` - Overlay loading indicator
- `ProgressBar` - Route change progress bar

### Navigation & Controls
- `GoBackButton` - Back navigation button
- `LanguageSwitcher` - Language selection component
- `ThemeSwitcher` - Theme selection component
- `CenteredLinkGrid` - Advanced link grid with nested support

### Display Components
- `ImageCarousel` - Image carousel with auto-play
- `ProjectImage` - Optimized project image component
- `CollapsibleSection` - Collapsible content section
- `Timer` - Countdown timer component

### Feedback Components
- `ToastNotification` - Toast notification component
- `SuccessMessage` - Success message notification

### Utility Components
- `BaseSlider` - Simple/complex interface slider
- `BaseToggleSwitch` - Toggle switch component
- `BooleanToggle` - Boolean toggle with radio buttons

## Installation

This package is part of the monorepo and is automatically available to all apps via workspace protocol.

In your app's `package.json`:
```json
{
  "dependencies": {
    "@websites/ui": "workspace:*",
    "@websites/infrastructure": "workspace:*"
  }
}
```

## Usage

```typescript
import { Button, Card, CenteredLinkGrid } from '@websites/ui';
import { useFallbackTranslation } from '@websites/infrastructure/i18n';

// Use components
<Button variant="primary" size="md">Click me</Button>
<Card variant="glass">Content</Card>
```

## Dependencies

- `@websites/infrastructure` - Required for i18n and logging
- `next` - Next.js framework
- `react` & `react-dom` - React library
- `framer-motion` - Animation library
- `react-icons` - Icon library
- `nprogress` - Progress bar library
- `lucide-react` - Additional icons

## TypeScript

The package exports TypeScript types. Make sure your `tsconfig.json` includes the workspace paths:

```json
{
  "compilerOptions": {
    "paths": {
      "@websites/ui": ["../../packages/ui/src"],
      "@websites/ui/*": ["../../packages/ui/src/*"]
    }
  }
}
```

