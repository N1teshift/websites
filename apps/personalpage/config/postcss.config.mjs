import baseConfig from '@websites/config-tailwind/postcss.config.mjs';

/** @type {import('postcss-load-config').Config} */
const config = {
  ...baseConfig,
  plugins: {
    ...baseConfig.plugins,
    tailwindcss: {
      config: './config/tailwind.config.ts',
    },
  },
};

export default config;
