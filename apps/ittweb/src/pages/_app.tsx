import "../styles/globals.css";
import type { AppProps } from "next/app";
import { appWithTranslation } from "next-i18next";
import { AppWrapper } from "@websites/infrastructure/app";
import { Layout } from "@/features/infrastructure/components";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

function App({ Component, pageProps }: AppProps) {
    return (
        <>
            <AppWrapper 
                Component={Component}
                pageProps={pageProps}
                Layout={Layout}
                appName="ITT Web"
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
