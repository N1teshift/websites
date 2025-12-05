/**
 * @file Defines the main App component, which wraps around all pages.
 * It includes global styles, internationalization, and a progress bar.
 * Also suppresses specific HMR warnings in development mode.
 * @author Your Name
 */

import "../styles/globals.css";
import type { AppProps } from "next/app";
import { appWithTranslation } from "next-i18next";
import 'nprogress/nprogress.css';
import { ProgressBar } from "@websites/ui"; 

// Add error suppression for HMR warnings in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Suppress console.error messages
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('[HMR] Invalid message') || 
       args[0].includes('appIsrManifest'))
    ) {
      // Suppress the specific HMR warnings
      return;
    }
    originalConsoleError(...args);
  };
  
  // Suppress console.warn messages
  const originalConsoleWarn = console.warn;
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('[HMR] Invalid message') || 
       args[0].includes('appIsrManifest'))
    ) {
      // Suppress the specific HMR warnings
      return;
    }
    originalConsoleWarn(...args);
  };
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
        <>
            <ProgressBar />
            <Component {...pageProps} />
        </>
    );
}

export default appWithTranslation(App);