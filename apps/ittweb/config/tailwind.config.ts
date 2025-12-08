import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";
import { baseTailwindConfig } from "@websites/config-tailwind";

const tailwindConfig: Config = {
  ...baseTailwindConfig,
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/shared/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
    "../../packages/infrastructure/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      ...baseTailwindConfig.theme?.extend,
      colors: {
        ...baseTailwindConfig.theme?.extend?.colors,
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Brand colors - app-specific
        brand: {
          DEFAULT: "var(--amber-400, #fbbf24)",
          light: "var(--amber-300, #fcd34d)",
          dark: "#d97706",
          border: "rgba(251, 191, 36, 0.3)",
          "border-hover": "rgba(251, 191, 36, 0.5)",
        },
        // Primary, secondary, success, warning, danger come from base config
      },
      fontFamily: {
        medieval: ["MedievalSharp", "cursive"],
        "medieval-brand": ["MedievalSharp", "cursive"],
        cinzel: ["Cinzel", "serif"],
        unifraktur: ["UnifrakturMaguntia", "cursive"],
      },
      // Shared tokens (boxShadow, borderRadius, animations, spacing, etc.) come from base config
      // Only app-specific extensions below:
      typography: ({ theme }: { theme: (path: string) => any }) => ({
        DEFAULT: {
          css: {
            color: theme("colors.gray.800"),
            h1: {
              fontFamily: (theme("fontFamily.medieval") as unknown as string[]).join(", "),
              color: theme("colors.amber.600"),
            },
            h2: {
              fontFamily: (theme("fontFamily.medieval") as unknown as string[]).join(", "),
              color: theme("colors.amber.600"),
              marginTop: theme("spacing.6"),
              marginBottom: theme("spacing.2"),
            },
            p: {
              color: theme("colors.gray.800"),
            },
            a: {
              color: theme("colors.amber.600"),
              textDecoration: "none",
            },
          },
        },
        invert: {
          css: {
            color: theme("colors.gray.200"),
            h1: {
              fontFamily: (theme("fontFamily.medieval") as unknown as string[]).join(", "),
              color: theme("colors.amber.400"),
            },
            h2: {
              fontFamily: (theme("fontFamily.medieval") as unknown as string[]).join(", "),
              color: theme("colors.amber.300"),
              marginTop: theme("spacing.8"),
              marginBottom: theme("spacing.3"),
            },
            p: {
              color: theme("colors.gray.200"),
            },
            a: {
              color: theme("colors.amber.300"),
              textDecoration: "none",
            },
          },
        },
      }),
    },
  },
  plugins: [
    ...(Array.isArray(baseTailwindConfig.plugins) ? baseTailwindConfig.plugins : []),
    typography,
  ],
} satisfies Config;

export default tailwindConfig;









