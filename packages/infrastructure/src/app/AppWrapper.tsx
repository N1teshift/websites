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

import React, { useEffect } from "react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { SessionProvider } from "next-auth/react";
import { SWRConfig } from "swr";
import {
  ProgressBar,
  AppLayout,
  PageHeader,
  UnderConstruction,
} from "@websites/ui";
import { swrConfig } from "@websites/infrastructure/cache";
import {
  initializeErrorTracking,
  initializePerformanceMonitoring,
} from "@websites/infrastructure/monitoring";
import { Logger } from "@websites/infrastructure/logging";
import { setupConsoleFiltering } from "./consoleFiltering";

/**
 * Extended pageProps interface for pages that use infrastructure features.
 *
 * Pages can optionally include layout props in their getStaticProps/getServerSideProps
 * to pass configuration to the Layout component.
 *
 * @example
 * ```typescript
 * export const getStaticProps: GetStaticProps = async ({ locale }) => {
 *   return {
 *     props: {
 *       ...(await getStaticPropsWithTranslations(['common', 'home'])({ locale })),
 *       translationNamespaces: ['common', 'home'], // Pass to Layout
 *       // Page layout props (for layoutType: 'page') - uses AppLayout + PageHeader
 *       layoutTitleKey: 'home_title',
 *       layoutMode: 'top',
 *       layoutGoBackTarget: '/',
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

  // Page layout props (used when layoutType is 'page') - uses AppLayout + PageHeader
  layoutTitleKey?: string;
  layoutMode?: "centered" | "top";
  layoutGoBackTarget?: string;
  layoutLoginButton?: React.ComponentType<{ absolute?: boolean }>;
  layoutIsUnderConstruction?: boolean;
  layoutConstructionMessageKey?: string;
  layoutEstimatedCompletion?: string;
  layoutIsAuthenticated?: boolean;
  /** Background className for page layout (defaults to math pattern background) */
  layoutBackgroundClassName?: string;
}

/** Props for AppWrapper component */
export interface AppWrapperProps {
  /** Component and pageProps from Next.js AppProps */
  Component: AppProps["Component"];
  pageProps: AppProps["pageProps"];
  router?: AppProps["router"];

  /** Layout type: 'app' uses AppLayout, 'page' uses AppLayout + PageHeader, 'custom' uses Layout prop, undefined = no layout */
  layoutType?: "app" | "page" | "custom";

  /** Optional custom layout component (used when layoutType is 'custom') */
  Layout?: React.ComponentType<{
    children: React.ReactNode;
    pageTranslationNamespaces?: string | string[];
    [key: string]: any;
  }>;

  /** AppLayout props (used when layoutType is 'app') */
  appLayoutHeader?: React.ComponentType;
  appLayoutFooter?: React.ComponentType;
  appLayoutDataCollectionNotice?: React.ComponentType;
  appLayoutBackgroundClassName?: string;

  /** PageLayout props (used when layoutType is 'page') - app-level defaults */
  pageLayoutLoginButton?: React.ComponentType<{ absolute?: boolean }>;

  /** Optional app name for logging */
  appName?: string;

  /** Optional viewport meta tag content */
  viewport?: string;
}

/** Standardized AppWrapper component that provides all common functionality for Next.js apps in the monorepo. */
export function AppWrapper({
  Component,
  pageProps,
  layoutType,
  Layout,
  appLayoutHeader,
  appLayoutFooter,
  appLayoutDataCollectionNotice,
  appLayoutBackgroundClassName,
  pageLayoutLoginButton,
  appName = "Application",
  viewport = "width=device-width, initial-scale=1.0, viewport-fit=cover",
}: AppWrapperProps) {
  const extendedProps = pageProps as Partial<ExtendedPageProps>;
  const translationNamespaces = extendedProps?.translationNamespaces || [
    "common",
  ];

  // Initialize logging
  useEffect(() => {
    if (typeof window !== "undefined") {
      Logger.info(`${appName} started`, {
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      });
    }
  }, [appName]);

  // Initialize monitoring and console filtering (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Initialize error tracking and performance monitoring
      initializeErrorTracking();
      initializePerformanceMonitoring();

      // Setup console filtering for known harmless errors
      setupConsoleFiltering({
        enableInProduction: true,
        disableProductionLogFiltering: "DISABLE_PRODUCTION_LOG_FILTERING",
      });
    }
  }, []);

  // Render content with appropriate layout
  let content: React.ReactNode;

  if (layoutType === "app") {
    // Use AppLayout from packages
    content = (
      <AppLayout
        pageTranslationNamespaces={translationNamespaces}
        Header={appLayoutHeader}
        Footer={appLayoutFooter}
        DataCollectionNotice={appLayoutDataCollectionNotice}
        backgroundClassName={appLayoutBackgroundClassName}
      >
        <Component {...pageProps} />
      </AppLayout>
    );
  } else if (layoutType === "page") {
    // Use AppLayout with PageHeader (replaces PageLayout)
    // App-level LoginButton takes precedence over page-level (if both provided)
    const loginButton =
      pageLayoutLoginButton || extendedProps?.layoutLoginButton;
    const mode = extendedProps?.layoutMode || "centered";
    const backgroundClassName =
      extendedProps?.layoutBackgroundClassName ||
      "min-h-screen flex flex-col bg-math-pattern bg-math bg-page-bg";

    // Create PageHeader component function (AppLayout expects ComponentType, not JSX)
    const PageHeaderComponent: React.ComponentType = () => (
      <PageHeader
        goBackTarget={extendedProps?.layoutGoBackTarget}
        titleKey={extendedProps?.layoutTitleKey}
        mode={mode}
        isAuthenticated={extendedProps?.layoutIsAuthenticated}
        LoginButton={loginButton}
      />
    );

    // Wrap content with UnderConstruction if needed
    const pageContent = extendedProps?.layoutIsUnderConstruction ? (
      <UnderConstruction
        messageKey={extendedProps?.layoutConstructionMessageKey}
        estimatedCompletion={extendedProps?.layoutEstimatedCompletion}
      />
    ) : (
      <Component {...pageProps} />
    );

    content = (
      <AppLayout
        pageTranslationNamespaces={translationNamespaces}
        Header={PageHeaderComponent}
        backgroundClassName={backgroundClassName}
        contentMode={mode}
      >
        {pageContent}
      </AppLayout>
    );
  } else if (layoutType === "custom" && Layout) {
    // Use custom Layout component (backward compatibility)
    content = (
      <Layout pageTranslationNamespaces={translationNamespaces}>
        <Component {...pageProps} />
      </Layout>
    );
  } else {
    // No layout
    content = <Component {...pageProps} />;
  }

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
