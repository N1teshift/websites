import "../styles/globals.css";
import type { AppProps } from "next/app";
import { appWithTranslation } from "next-i18next";
import { AppWrapper } from "@websites/infrastructure/app";
import { Header } from "@/features/infrastructure/components";
import { Footer, DataCollectionNotice } from "@/features/modules/shared/components";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

function App({ Component, pageProps }: AppProps) {
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
