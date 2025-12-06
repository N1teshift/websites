// Export all internationalization functionality from this module

// Core hooks and utilities (client-safe)
export { useFallbackTranslation } from './useFallbackTranslation';
export { TranslationNamespaceContext, useTranslationNamespace } from './TranslationNamespaceContext';

// Server-side utilities (import separately to avoid client-side bundling)
// Note: These are exported here but should only be used in server-side code
// (getStaticProps, API routes, etc.) to avoid webpack bundling issues
export { getStaticPropsWithTranslations } from './getStaticProps';
export { default as nextI18NextConfig } from './next-i18next.config';
