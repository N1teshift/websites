import React from "react";
import AppLayout from "./AppLayout";
import PageHeader from "./PageHeader";

interface LoadingScreenProps {
  title?: string; // Optional title for the layout
  message?: string; // Optional loading message
}

/**
 * A full-screen loading indicator component, often used during initial page loads or transitions.
 * It uses the `AppLayout` component internally with a "centered" mode.
 *
 * @param props The component props.
 * @param props.title Optional. The title displayed in the PageHeader. Defaults to "Loading...".
 * @param props.message Optional. A message displayed below the loader. Defaults to "Please wait while we load the content.".
 * @returns A React element representing the loading screen.
 */
const LoadingScreen: React.FC<LoadingScreenProps> = ({
  title = "Loading...",
  message = "Please wait while we load the content.",
}) => {
  return (
    <AppLayout
      Header={<PageHeader titleKey={title} mode="centered" />}
      backgroundClassName="min-h-screen flex flex-col bg-math-pattern bg-math bg-page-bg"
      contentMode="centered"
    >
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="loader" aria-label="Loading"></div>
        <p className="mt-4 text-lg font-semibold">{message}</p>
      </div>
    </AppLayout>
  );
};

export default LoadingScreen;
