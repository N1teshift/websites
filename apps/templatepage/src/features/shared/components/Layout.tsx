import React from 'react';
import { TranslationNamespaceContext } from '@websites/infrastructure/i18n/client';

interface LayoutProps {
  children: React.ReactNode;
  translationNs?: string | string[];
  defaultNS?: string;
  fallbackNS?: string[];
}

/**
 * Minimal Layout component that provides translation namespace context.
 * This component can be extended with additional layout features as needed.
 */
export default function Layout({ 
  children, 
  translationNs = 'common',
  defaultNS = 'common',
  fallbackNS = []
}: LayoutProps) {
  return (
    <TranslationNamespaceContext.Provider 
      value={{ 
        translationNs, 
        defaultNS, 
        fallbackNS 
      }}
    >
      <div className="min-h-screen bg-background text-foreground">
        {children}
      </div>
    </TranslationNamespaceContext.Provider>
  );
}
