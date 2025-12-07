// Export all internationalization functionality from this module

// Core hooks and utilities (client-safe)
export { useFallbackTranslation } from './useFallbackTranslation';
export { TranslationNamespaceContext, useTranslationNamespace } from './TranslationNamespaceContext';

// Server-side utilities (import separately to avoid client-side bundling)
// Note: These are commented out to prevent webpack from bundling server-only code into client bundles
// Import them directly in server-side files (getStaticProps, API routes, etc.)
// export { getStaticPropsWithTranslations } from './getStaticProps';
// export { default as nextI18NextConfig } from './next-i18next.config';
