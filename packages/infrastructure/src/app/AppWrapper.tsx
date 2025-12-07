/**
 * @file Standardized AppWrapper component for all Next.js apps in the monorepo.
 * 
 * This component provides:
 * - SWR configuration for data fetching
 * - Next-auth SessionProvider for authentication
 * - Error tracking and performance monitoring
 * - Console filtering for known harmless errors
 * - Progress bar for page transitions
 * - Translation namespace support
 * 
 * All apps should use this wrapper in their _app.tsx files.
 */

import React, { useEffect } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';
import { SWRConfig } from 'swr';
import { ProgressBar } from '@websites/ui';
import { swrConfig } from '@websites/infrastructure/cache';
import { initializeErrorTracking, initializePerformanceMonitoring } from '@websites/infrastructure/monitoring';
import { Logger } from '@websites/infrastructure/logging';
import { setupConsoleFiltering } from './consoleFiltering';

/**
 * Extended pageProps interface to include translation namespaces and session
 */
export interface ExtendedPageProps {
    session?: Session;
    translationNamespaces?: string[];
}

/**
 * Props for AppWrapper component
 */
export interface AppWrapperProps extends AppProps {
    /**
     * Optional custom layout component to wrap pages
     * If provided, pages will be wrapped with this layout
     */
    Layout?: React.ComponentType<{ 
        children: React.ReactNode; 
        pageTranslationNamespaces?: string[];
        [key: string]: any;
    }>;
    
    /**
     * Optional app name for logging
     */
    appName?: string;
    
    /**
     * Optional viewport meta tag content
     */
    viewport?: string;
}

/**
 * Standardized AppWrapper component that provides all common functionality
 * for Next.js apps in the monorepo.
 * 
 * @example
 * ```tsx
 * function App({ Component, pageProps }: AppProps) {
 *     return (
 *         <AppWrapper Component={Component} pageProps={pageProps} />
 *     );
 * }
 * 
 * export default appWithTranslation(App);
 * ```
 */
export function AppWrapper({ 
    Component, 
    pageProps, 
    Layout,
    appName = 'Application',
    viewport = 'width=device-width, initial-scale=1.0, viewport-fit=cover'
}: AppWrapperProps) {
    const extendedProps = pageProps as ExtendedPageProps;
    const translationNamespaces = extendedProps?.translationNamespaces || ['common'];
    const session = extendedProps?.session;

    // Initialize logging
    useEffect(() => {
        if (typeof window !== 'undefined') {
            Logger.info(`${appName} started`, {
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
            });
        }
    }, [appName]);

    // Initialize monitoring and console filtering (client-side only)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Initialize error tracking and performance monitoring
            initializeErrorTracking();
            initializePerformanceMonitoring();

            // Setup console filtering for known harmless errors
            setupConsoleFiltering({
                enableInProduction: true,
                disableProductionLogFiltering: 'DISABLE_PRODUCTION_LOG_FILTERING'
            });
        }
    }, []);

    // Render with or without custom Layout
    const content = Layout ? (
        <Layout pageTranslationNamespaces={translationNamespaces}>
            <Component {...pageProps} />
        </Layout>
    ) : (
        <Component {...pageProps} />
    );

    return (
        <>
            <Head>
                <meta name="viewport" content={viewport} />
            </Head>
            <SWRConfig value={swrConfig}>
                <SessionProvider session={session}>
                    <ProgressBar />
                    {content}
                </SessionProvider>
            </SWRConfig>
        </>
    );
}
