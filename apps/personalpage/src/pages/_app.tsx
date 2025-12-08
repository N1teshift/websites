import "../styles/globals.css";
import type { AppProps } from "next/app";
import { appWithTranslation } from "next-i18next";
import { AppWrapper } from "@websites/infrastructure/app";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import LoginButton from '../components/LoginButton';

function App({ Component, pageProps }: AppProps) {
    return (
        <>
            <AppWrapper 
                Component={Component}
                pageProps={pageProps}
                layoutType="page"
                pageLayoutLoginButton={LoginButton}
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
