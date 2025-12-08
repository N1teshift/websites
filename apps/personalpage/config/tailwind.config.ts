import type { Config } from "tailwindcss";
import { baseTailwindConfig } from "@websites/config-tailwind";

export default {
  ...baseTailwindConfig,
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/shared/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/styles/**/*.css",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
    "../../packages/infrastructure/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      ...baseTailwindConfig.theme?.extend,
      colors: {
        // Spread base colors first (includes primary, secondary, success, warning, danger)
        ...baseTailwindConfig.theme?.extend?.colors,
        // Semantic Theme Map
        // This maps Tailwind classes (e.g. bg-page-bg) to CSS variables
        page: {
          bg: 'var(--page-bg)',
          grid: 'var(--page-grid)',
        },
        brand: {
          DEFAULT: 'var(--brand-primary)',
          hover: 'var(--brand-primary-hover)',
          light: 'var(--brand-light)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          inverse: 'var(--text-inverse)',
        },
        surface: {
          card: 'var(--surface-card)',
          glass: 'var(--surface-card-glass)',
          button: 'var(--surface-button)',
          'button-hover': 'var(--surface-button-hover)',
        },
        border: {
          DEFAULT: 'var(--border-default)',
          accent: 'var(--border-accent)',
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      // Shared tokens (boxShadow, borderRadius, animations, etc.) come from base config
      // Only app-specific extensions below:
      aspectRatio: {
        'link-card': '1 / 1', // Default square. Change to '16 / 9' for wide cards.
      },
      backgroundImage: {
        'math-pattern': "linear-gradient(0deg, transparent 24%, var(--page-grid) 25%, var(--page-grid) 26%, transparent 27%, transparent 74%, var(--page-grid) 75%, var(--page-grid) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, var(--page-grid) 25%, var(--page-grid) 26%, transparent 27%, transparent 74%, var(--page-grid) 75%, var(--page-grid) 76%, transparent 77%, transparent)",
        'rainbow-border': "linear-gradient(60deg, #f79533, #f37055, #ef4e7b, #a166ab, #5073b8, #1098ad, #07b39b, #6fba82)",
      },
      backgroundSize: {
        'math': '55px 55px',
        '400': '400% 400%',
      },
    },
  },
  plugins: [],
} satisfies Config;
