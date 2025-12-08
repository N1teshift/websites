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
import { SWRConfig } from 'swr';
import { ProgressBar } from '@websites/ui';
import { swrConfig } from '@websites/infrastructure/cache';
import { initializeErrorTracking, initializePerformanceMonitoring } from '@websites/infrastructure/monitoring';
import { Logger } from '@websites/infrastructure/logging';
import { setupConsoleFiltering } from './consoleFiltering';

/**
 * Extended pageProps interface for pages that use infrastructure features.
 * 
 * Pages can optionally include `translationNamespaces` in their getStaticProps/getServerSideProps
 * to pass translation context to the Layout component.
 * 
 * @example
 * ```typescript
 * export const getStaticProps: GetStaticProps = async ({ locale }) => {
 *   return {
 *     props: {
 *       ...(await getStaticPropsWithTranslations(['common', 'home'])({ locale })),
 *       translationNamespaces: ['common', 'home'], // Pass to Layout
 *     },
 *   };
 * };
 * ```
 */
export interface ExtendedPageProps {
    /**
     * Array of translation namespaces used by this page.
     * Used to pass to Layout component for translation context.
     * Should match the namespaces passed to getStaticPropsWithTranslations.
     */
    translationNamespaces?: string[];
}

/** Props for AppWrapper component */
export interface AppWrapperProps {
    /** Component and pageProps from Next.js AppProps */
    Component: AppProps['Component'];
    pageProps: AppProps['pageProps'];
    router?: AppProps['router'];
    
    /** Optional custom layout component to wrap pages If provided, pages will be wrapped with this layout */
    Layout?: React.ComponentType<{ 
        children: React.ReactNode; 
        pageTranslationNamespaces?: string[];
        [key: string]: any;
    }>;
    
    /** Optional app name for logging */
    appName?: string;
    
    /** Optional viewport meta tag content */
    viewport?: string;
}

/** Standardized AppWrapper component that provides all common functionality for Next.js apps in the monorepo. */
export function AppWrapper({ 
    Component, 
    pageProps, 
    Layout,
    appName = 'Application',
    viewport = 'width=device-width, initial-scale=1.0, viewport-fit=cover'
}: AppWrapperProps) {
    // Extract translationNamespaces only if Layout is provided
    // This is only needed for apps that use a Layout component (like ITT Web)
    const translationNamespaces = Layout 
        ? ((pageProps as Partial<ExtendedPageProps>)?.translationNamespaces || ['common'])
        : ['common']; // Default value, not used if no Layout

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
                <SessionProvider>
                    <ProgressBar />
                    {content}
                </SessionProvider>
            </SWRConfig>
        </>
    );
}
