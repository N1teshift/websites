// Export all internationalization functionality from this module

// Core hooks and utilities (client-safe)
export { useFallbackTranslation } from './useFallbackTranslation';
export { TranslationNamespaceContext, useTranslationNamespace } from './TranslationNamespaceContext';

// Server-side utilities (import separately to avoid client-side bundling)
export { getStaticPropsWithTranslations } from './getStaticProps';
export { default as nextI18NextConfig } from './next-i18next.config';
