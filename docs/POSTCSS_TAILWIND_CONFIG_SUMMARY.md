# PostCSS/Tailwind Config Summary - Quick Reference

## Current Configuration Structure

```
packages/config-tailwind/
├── postcss.config.mjs          ← Shared PostCSS config
├── src/
│   ├── base.ts                 ← Shared Tailwind base config
│   └── index.ts
└── package.json

apps/
├── ittweb/
│   ├── postcss.config.mjs      ⚠️ Re-exports from config/
│   ├── config/
│   │   ├── postcss.config.mjs  ✅ Uses shared
│   │   └── tailwind.config.ts  ✅ Extends base + typography plugin
│   └── tailwind.config.ts      ⚠️ Re-exports from config/
│
├── personalpage/
│   ├── postcss.config.mjs      ❌ Custom (extends shared + explicit path)
│   ├── config/
│   │   └── tailwind.config.ts  ✅ Extends base + heavy customizations
│   └── (no root tailwind.config.ts)
│
├── MafaldaGarcia/
│   ├── postcss.config.mjs      ✅ Uses shared directly
│   └── tailwind.config.ts      ✅ Extends base, minimal customizations
│
└── templatepage/
    ├── postcss.config.mjs      ✅ Uses shared directly
    └── tailwind.config.ts      ✅ Extends base, minimal customizations
```

## Issue Matrix

| App               | PostCSS Config     | Tailwind Config    | Issues                            |
| ----------------- | ------------------ | ------------------ | --------------------------------- |
| **ittweb**        | ⚠️ Re-export layer | ⚠️ Re-export layer | Unnecessary indirection           |
| **personalpage**  | 🔴 Custom extends  | ✅ Extends base    | Explicit Tailwind path in PostCSS |
| **MafaldaGarcia** | ✅ Standard        | ✅ Standard        | None                              |
| **templatepage**  | ✅ Standard        | ✅ Standard        | None                              |

## Key Inconsistencies

### 1. PostCSS Config Patterns

**Standard (MafaldaGarcia, templatepage)**:

```js
export { default } from "@websites/config-tailwind/postcss";
```

**Re-export (ittweb)**:

```js
// Root file
export { default } from "./config/postcss.config.mjs";

// Config file
export { default } from '@websites/config-tailwind/postcss';
```

**Custom extends (personalpage)**:

```js
import baseConfig from "@websites/config-tailwind/postcss.config.mjs";
const config = {
  ...baseConfig,
  plugins: {
    ...baseConfig.plugins,
    tailwindcss: { config: "./config/tailwind.config.ts" }, // ⚠️ Redundant
  },
};
```

### 2. Tailwind Config Patterns

**Standard (MafaldaGarcia, templatepage)**:

```ts
import { baseTailwindConfig } from "@websites/config-tailwind";
export default {
  ...baseTailwindConfig,
  content: [
    /* app-specific paths */
  ],
  theme: {
    extend: {
      /* minimal customizations */
    },
  },
};
```

**Re-export (ittweb)**:

```ts
// Root: export { default } from "./config/tailwind.config.ts";
// Config: extends base + typography plugin + custom theme
```

**Heavy customizations (personalpage)**:

```ts
// Extends base + extensive CSS variable mappings + custom patterns
// ✅ This is fine - app-specific themes are expected
```

### 3. Content Path Variations

All apps include shared packages, but patterns vary:

**Standard**:

```ts
content: [
  "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  "../../packages/infrastructure/src/**/*.{js,ts,jsx,tsx}",
];
```

**Variations**:

- `ittweb`: Uses `./src/shared/**/*` instead of `./src/components/**/*`
- `personalpage`: Adds `./src/styles/**/*.css`

## Recommended Standard Pattern

### PostCSS Config (All Apps)

```js
// apps/{app}/postcss.config.mjs
export { default } from "@websites/config-tailwind/postcss";
```

### Tailwind Config (All Apps)

```ts
// apps/{app}/tailwind.config.ts
import type { Config } from "tailwindcss";
import { baseTailwindConfig } from "@websites/config-tailwind";

const config: Config = {
  ...baseTailwindConfig,
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // Simplified glob pattern
    "./src/**/*.css", // Include if app uses CSS files
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
    "../../packages/infrastructure/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      ...baseTailwindConfig.theme?.extend,
      // App-specific customizations here
    },
  },
  plugins: [
    // App-specific plugins here
  ],
};

export default config;
```

## Fix Priority

1. **High**: Remove re-export layers (ittweb) - causes confusion
2. **Medium**: Remove explicit Tailwind path (personalpage) - redundant
3. **Low**: Standardize content paths - reduces maintenance
4. **Low**: Move configs to root - consistency
