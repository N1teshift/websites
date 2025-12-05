import React from "react";

interface LoadingOverlayProps {
    isVisible: boolean;
    message?: string;
}

/**
 * An overlay component that covers the screen with a semi-transparent background
 * and displays a loading indicator and message. Useful for indicating background processes.
 *
 * @param props The component props.
 * @param props.isVisible If true, the overlay is displayed. If false, it returns null.
 * @param props.message Optional. The message displayed below the loader. Defaults to "Processing your request...".
 * @returns A React element representing the loading overlay, or null.
 */
const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
    isVisible,
    message = "Processing your request...",
}) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
                <div className="loader" aria-label="Loading"></div>
                <p className="mt-4 text-lg font-semibold text-gray-800">{message}</p>
            </div>
        </div>
    );
};

export default LoadingOverlay;

