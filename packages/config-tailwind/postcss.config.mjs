/**
 * @websites/config-tailwind - Shared PostCSS Configuration
 * 
 * Standard PostCSS config for all apps.
 * 
 * Usage in app's postcss.config.mjs:
 * ```javascript
 * export { default } from '@websites/config-tailwind/postcss';
 * ```
 * 
 * Or import directly:
 * ```javascript
 * import postcssConfig from '@websites/config-tailwind/postcss.config.mjs';
 * export default postcssConfig;
 * ```
 */

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
