import React from 'react';
import { TranslationNamespaceContext } from '@i18n/TranslationNamespaceContext';

interface LayoutProps {
  children: React.ReactNode;
  namespaces?: string[];
}

/**
 * Layout component that provides translation namespace context.
 * This component can be extended with additional layout features as needed.
 */
export default function Layout({ 
  children, 
  namespaces = ['common']
}: LayoutProps) {
  return (
    <TranslationNamespaceContext.Provider 
      value={{ 
        translationNs: namespaces, 
        defaultNS: namespaces[0] || 'common', 
        fallbackNS: namespaces.slice(1) 
      }}
    >
      <div className="min-h-screen bg-background text-foreground">
        {children}
      </div>
    </TranslationNamespaceContext.Provider>
  );
}
