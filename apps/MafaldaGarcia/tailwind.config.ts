import type { Config } from "tailwindcss";
import { baseTailwindConfig } from "@websites/config-tailwind";

const config: Config = {
  ...baseTailwindConfig,
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
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
      },
    },
  },
  plugins: [],
};

export default config;
