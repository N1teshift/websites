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

/**
 * App component.
 *
 * This is the main application component that Next.js uses to initialize pages.
 * It uses the standardized AppWrapper which provides:
 * - SWR configuration
 * - Next-auth SessionProvider
 * - Error tracking and performance monitoring
 * - Console filtering
 * - Progress bar
 *
 * @param {AppProps} props - The properties passed to the component.
 * @returns {JSX.Element} The rendered App component with the current page.
 */
function App(props: AppProps) {
    return (
        <AppWrapper 
            {...props} 
            appName="Mafalda Garcia"
        />
    );
}

export default appWithTranslation(App);