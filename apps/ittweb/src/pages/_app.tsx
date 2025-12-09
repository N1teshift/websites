import "../styles/globals.css";
import type { AppProps } from "next/app";
import { appWithTranslation } from "next-i18next";
import { AppWrapper } from "@websites/infrastructure/app";
import { Header } from "@/features/infrastructure/components";
import { Footer, DataCollectionNotice } from "@/features/modules/shared/components";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useEffect } from "react";

function App({ Component, pageProps }: AppProps) {
  // Suppress HMR invalid message warnings globally
  useEffect(() => {
    if (typeof window === "undefined") return;

    const originalWarn = console.warn;
    console.warn = (...args: unknown[]) => {
      // Convert all arguments to strings for pattern matching
      const message = args
        .map((arg) => {
          if (typeof arg === "string") return arg;
          if (typeof arg === "object" && arg !== null) {
            try {
              return JSON.stringify(arg);
            } catch {
              return String(arg);
            }
          }
          return String(arg);
        })
        .join(" ");

      // Filter out HMR invalid message warnings
      if (
        message.includes("[HMR] Invalid message") &&
        (message.includes("isrManifest") || message.includes('"action":"isrManifest"'))
      ) {
        return;
      }
      originalWarn.apply(console, args);
    };

    return () => {
      console.warn = originalWarn;
    };
  }, []);
  return (
    <>
      <AppWrapper
        Component={Component}
        pageProps={pageProps}
        layoutType="app"
        appLayoutHeader={Header}
        appLayoutFooter={Footer}
        appLayoutDataCollectionNotice={DataCollectionNotice}
        appName="ITT Web"
      />
      {process.env.NODE_ENV === "production" && (
        <>
          <Analytics />
          <SpeedInsights />
        </>
      )}
    </>
  );
}

export default appWithTranslation(App);
