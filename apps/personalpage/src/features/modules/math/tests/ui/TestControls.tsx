import React, { useState } from 'react';
// import { useTranslation } from 'next-i18next'; // Will be replaced
import { Button, LoadingOverlay } from "@websites/ui";
import { DBFetchingToggle } from '@tests/ui'; // Assuming this will also be upgraded or doesn't need context here
import { useFallbackTranslation } from '@websites/infrastructure/i18n/client';
import AIModeSwitch, { AISystem } from './AIModeSwitch';

export interface TestControlsProps {
    /** Callback function invoked when the 'Run Selected Tests' button is clicked. */
    onRunTests: () => void;
    /** Boolean indicating if tests are currently being executed. */
    isRunning: boolean;
    /** The number of tests currently selected by the user. */
    selectedTestsCount: number;
    /** Optional callback function invoked when the 'Reset Test Stats' button is clicked. If not provided, the button is hidden. */
    onResetTestStats?: () => Promise<void> | void;
    /** Passed down to `DBFetchingToggle`: whether database fetching is currently enabled. */
    isFetchingEnabled: boolean;
    /** Passed down to `DBFetchingToggle`: function to toggle the fetching state. */
    toggleFetchingEnabled: () => void;
    /** Optional flag passed down to `DBFetchingToggle` to disable it externally. Also disabled if `isRunning` is true. */
    dbToggleDisabled?: boolean;
    /** The currently selected AI system. */
    selectedSystem: AISystem;
    /** Callback function invoked when the user selects a different AI system. */
    onSystemChange: (system: AISystem) => void;
    /** Boolean indicating if the explanation area is currently visible. */
    showExplanation: boolean;
    /** Callback function invoked when the explanation button is clicked to toggle visibility. */
    onToggleExplanation: () => void;
    /** Boolean indicating if the user is authenticated. DB fetching toggle is hidden when false. */
    isAuthenticated?: boolean;
}

/**
 * Renders the main control buttons for the testing interface,
 * including Run Tests, Reset Stats (optional), and the DB Fetching Toggle.
 * @param {TestControlsProps} props - The component props.
 */
const TestControls: React.FC<TestControlsProps> = ({
    onRunTests,
    isRunning,
    selectedTestsCount,
    onResetTestStats,
    isFetchingEnabled,
    toggleFetchingEnabled,
    dbToggleDisabled,
    selectedSystem,
    onSystemChange,
    showExplanation,
    onToggleExplanation,
    isAuthenticated = true
}) => {
    const { t } = useFallbackTranslation();
    /** State to manage the loading overlay during the asynchronous reset operation. */
    const [isResetting, setIsResetting] = useState(false);

    /**
     * Handles the click event for the 'Reset Test Stats' button.
     * Shows a confirmation dialog, displays a loading overlay, calls the `onResetTestStats` prop,
     * and hides the overlay on completion or error.
     * @private
     * @async
     */
    const handleResetTestStats = async () => {
        if (!onResetTestStats) return;

        if (window.confirm(t('reset_test_stats_confirmation'))) {
            setIsResetting(true);
            try {
                await onResetTestStats();
            } finally {
                setTimeout(() => {
                    setIsResetting(false);
                }, 500);
            }
        }
    };

    return (
        <>
            <LoadingOverlay
                isVisible={isResetting}
                message={t('resetting_test_stats')}
            />
            <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-4">
                    <Button
                        onClick={() => onRunTests()}
                        variant="success"
                        disabled={isRunning || selectedTestsCount === 0}
                    >
                        {isRunning ? t('running_tests') : t('run_selected_tests', { count: selectedTestsCount })}
                    </Button>
                    {onResetTestStats && (
                        <Button
                            onClick={handleResetTestStats}
                            variant="danger"
                            disabled={isResetting || isRunning}
                        >
                            {t('reset_test_stats')}
                        </Button>
                    )}
                    <AIModeSwitch
                        selectedSystem={selectedSystem}
                        onSystemChange={onSystemChange}
                        disabled={isRunning}
                    />
                    <Button
                        onClick={onToggleExplanation}
                        variant={showExplanation ? 'primary' : 'secondary'}
                        disabled={isRunning}
                        size="sm"
                    >
                        {t('explanation') || 'Explanation'}
                    </Button>
                </div>
                {isAuthenticated && (
                    <DBFetchingToggle
                        isFetchingEnabled={isFetchingEnabled}
                        toggleFetchingEnabled={toggleFetchingEnabled}
                        disabled={dbToggleDisabled || isRunning}
                    />
                )}
            </div>
        </>
    );
};

export default TestControls; 



