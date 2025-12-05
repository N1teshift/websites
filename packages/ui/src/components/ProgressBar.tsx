import { useEffect } from "react";
import { useRouter } from "next/router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

/**
 * Integrates the NProgress library to display a thin progress bar
 * at the top of the page during Next.js route changes.
 * This component itself renders nothing, but manages the NProgress lifecycle.
 */
const ProgressBar = () => {
    const router = useRouter();

    useEffect(() => {
        const handleStart = () => NProgress.start();
        const handleComplete = () => NProgress.done();

        router.events.on("routeChangeStart", handleStart);
        router.events.on("routeChangeComplete", handleComplete);
        router.events.on("routeChangeError", handleComplete);

        return () => {
            router.events.off("routeChangeStart", handleStart);
            router.events.off("routeChangeComplete", handleComplete);
            router.events.off("routeChangeError", handleComplete);
        };
    }, [router]);

    return null;
};

export default ProgressBar;

