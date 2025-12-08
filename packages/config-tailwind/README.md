# @websites/config-tailwind

Shared Tailwind CSS and PostCSS configuration for all apps in the websites monorepo.

## Installation

This package is automatically available via the workspace. Ensure your app has the peer dependencies:

```json
{
  "devDependencies": {
    "tailwindcss": "^3.4.1",
    "postcss": "^8",
    "autoprefixer": "^10.4.19"
  }
}
```

## Usage

### Tailwind Config

Import the base config and extend it:

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';
import { baseTailwindConfig } from '@websites/config-tailwind';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      ...baseTailwindConfig.theme?.extend,
      // Add app-specific theme extensions here
      colors: {
        // App-specific colors
        brand: {
          DEFAULT: 'var(--brand-primary)',
          hover: 'var(--brand-primary-hover)',
        },
      },
      fontFamily: {
        // App-specific fonts
        medieval: ['MedievalSharp', 'cursive'],
      },
    },
  },
  plugins: [
    // Add app-specific plugins
    // typography(),
  ],
};

export default config;
```

### PostCSS Config

Simply export the shared config:

```javascript
// postcss.config.mjs
export { default } from '@websites/config-tailwind/postcss';
```

Or if you need custom PostCSS config:

```javascript
// postcss.config.mjs
import baseConfig from '@websites/config-tailwind/postcss.config.mjs';

export default {
  ...baseConfig,
  plugins: {
    ...baseConfig.plugins,
    // Add custom plugins if needed
  },
};
```

## What's Included

### Shared Design Tokens

- **Colors**: Primary, secondary, success, warning, danger scales (50-950)
- **Shadows**: soft, medium, large, inner-soft
- **Border Radius**: xl, 2xl, 3xl
- **Animations**: fadeIn, slideUp, slideDown, scaleIn, animated-border, loader
- **Spacing**: section, section-lg, card, card-sm
- **Transitions**: 400ms duration

### CSS Variables

The base config includes support for CSS variable-based theming:
- `background` → `var(--background)`
- `foreground` → `var(--foreground)`

Apps can extend this with their own CSS variables.

## Examples

### Minimal App Config

```typescript
import type { Config } from 'tailwindcss';
import { baseTailwindConfig } from '@websites/config-tailwind';

export default {
  ...baseTailwindConfig,
  content: ['./src/**/*.{ts,tsx}'],
} satisfies Config;
```

### App with Custom Theme

```typescript
import type { Config } from 'tailwindcss';
import { baseTailwindConfig } from '@websites/config-tailwind';
import typography from '@tailwindcss/typography';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      ...baseTailwindConfig.theme?.extend,
      colors: {
        brand: {
          DEFAULT: '#fbbf24',
          light: '#fcd34d',
          dark: '#d97706',
        },
      },
      fontFamily: {
        medieval: ['MedievalSharp', 'cursive'],
      },
    },
  },
  plugins: [typography],
} satisfies Config;
```

## Migrating Existing Configs

When migrating an existing Tailwind config:

1. Import `baseTailwindConfig`
2. Keep your `content` paths
3. Merge theme extensions (spread base first, then add app-specific)
4. Add your plugins
5. Test that styles still work correctly

## Design System Benefits

Using this shared config ensures:
- ✅ Consistent color palette across apps
- ✅ Unified spacing system
- ✅ Shared animations and transitions
- ✅ Easier to update design tokens globally
- ✅ Still allows app-specific customizations
