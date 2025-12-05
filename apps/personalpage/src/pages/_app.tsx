/**
 * @file Defines the main App component, which wraps around all pages.
 * It includes global styles, internationalization, and a progress bar.
 * Also suppresses specific HMR warnings, browser extension errors, and Vercel analytics debug logs.
 * @author Your Name
 */

import "../styles/globals.css";
import type { AppProps } from "next/app";
import { appWithTranslation } from "next-i18next";
import 'nprogress/nprogress.css';
import { ProgressBar } from "@websites/ui";
import { AuthProvider } from "../features/infrastructure/auth/AuthContext";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next"; 

// Add error suppression for HMR warnings and browser extension errors
if (typeof window !== 'undefined') {
  // Suppress console.error messages
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const firstArg = args[0];
    const errorMessage = typeof firstArg === 'string' 
      ? firstArg 
      : firstArg?.message || firstArg?.toString() || '';
    
    // Check all args for source map related errors
    const allArgsString = args.map(arg => 
      typeof arg === 'string' ? arg : 
      arg?.message || arg?.toString() || ''
    ).join(' ');
    
    if (
      errorMessage.includes('[HMR] Invalid message') || 
      errorMessage.includes('appIsrManifest') ||
      errorMessage.includes('[Vercel') ||
      errorMessage.includes('Promised response from onMessage listener went out of scope') ||
      errorMessage.includes('onMessage listener') ||
      errorMessage.includes('Source map error') ||
      errorMessage.includes('request failed with status 404') ||
      allArgsString.includes('installHook.js.map') ||
      allArgsString.includes('Source map error') ||
      allArgsString.includes('source-map-loader')
    ) {
      // Suppress the specific HMR warnings, Vercel analytics debug logs, browser extension errors, and source map errors
      return;
    }
    originalConsoleError(...args);
  };
  
  // Suppress console.warn messages (only in development)
  if (process.env.NODE_ENV === 'development') {
    const originalConsoleWarn = console.warn;
    console.warn = (...args) => {
      const firstArg = args[0];
      const errorMessage = typeof firstArg === 'string' 
        ? firstArg 
        : firstArg?.message || firstArg?.toString() || '';
      
      if (
        errorMessage.includes('[HMR] Invalid message') || 
        errorMessage.includes('appIsrManifest') ||
        errorMessage.includes('[Vercel')
      ) {
        // Suppress the specific HMR warnings and Vercel analytics debug logs
        return;
      }
      originalConsoleWarn(...args);
    };

    // Suppress console.log messages from Vercel Analytics
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      if (
        typeof args[0] === 'string' &&
        args[0].includes('[Vercel')
      ) {
        // Suppress Vercel analytics debug logs
        return;
      }
      originalConsoleLog(...args);
    };
  }
}

/**
 * App component.
 *
 * This is the main application component that Next.js uses to initialize pages.
 * It wraps all page components, allowing for shared layout, state, and global styles.
 * It includes a progress bar that displays during page transitions.
 *
 * @param {AppProps} props - The properties passed to the component, including the Component and pageProps.
 * @param {React.ElementType} props.Component - The active page component.
 * @param {object} props.pageProps - The initial props that were preloaded for the page.
 * @returns {JSX.Element} The rendered App component with the current page.
 */
function App({ Component, pageProps }: AppProps) {
    return (
        <AuthProvider>
            <ProgressBar />
            <Component {...pageProps} />
            {process.env.NODE_ENV === 'production' && (
                <>
                    <Analytics />
                    <SpeedInsights />
                </>
            )}
        </AuthProvider>
    );
}

export default appWithTranslation(App);


