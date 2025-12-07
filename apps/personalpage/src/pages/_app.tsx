/**
 * @file Defines the main App component, which wraps around all pages.
 * Uses the standardized AppWrapper from infrastructure for consistency.
 * @author Your Name
 */

import "../styles/globals.css";
import type { AppProps } from "next/app";
import { appWithTranslation } from "next-i18next";
import 'nprogress/nprogress.css';
import { AppWrapper } from "@websites/infrastructure/app";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

/**
 * App component.
 *
 * This is the main application component that Next.js uses to initialize pages.
 * It uses the standardized AppWrapper which provides:
 * - SWR configuration
 * - Next-auth SessionProvider (standardized auth)
 * - Error tracking and performance monitoring
 * - Console filtering
 * - Progress bar
 *
 * Note: This app has been migrated from AuthProvider to next-auth SessionProvider
 * for consistency across the monorepo.
 *
 * @param {AppProps} props - The properties passed to the component.
 * @returns {JSX.Element} The rendered App component with the current page.
 */
function App(props: AppProps) {
    return (
        <>
            <AppWrapper 
                {...props} 
                appName="Personal Page"
            />
            {process.env.NODE_ENV === 'production' && (
                <>
                    <Analytics />
                    <SpeedInsights />
                </>
            )}
        </>
    );
}

export default appWithTranslation(App);


