import React, { useState, useEffect } from 'react';
import { TestCase, getAllTests } from '@tests/cases/index';
import { useTestExecution, useTestSelection, useTestStats, useTestDateFormatter } from '@tests/hooks';
import { resetTestStats } from '@tests/utils/common';
import TestResultsSummary, { TestControls, AISystem } from '@math/tests/ui/index';
import SystemFlowDiagram from '@math/tests/ui/SystemFlowDiagram';
import { GenericTable, ColumnDefinition, FilterDefinition, StatusIndicator } from '@websites/ui';
import { PropertyTags, MathDisplay } from '@math/shared/components';
import { SuccessMessage, ToastNotification } from '@websites/ui';
import { useAuth } from '@websites/infrastructure/auth/providers';
import { useFallbackTranslation } from '@websites/infrastructure/i18n';

/**
 * MathObjectsGeneratorTests page component.
 *
 * Renders a comprehensive testing interface for math object generation test cases.
 * It fetches all available tests, displays them in a sortable and filterable table,
 * allows users to select specific tests, run them, and view the results and historical statistics.
 *
 * Key Features:
 * - Uses `getAllTests` to load the test case definitions.
 * - Employs custom hooks for managing test state and logic:
 *   - `useTestStats`: Fetches and manages historical test statistics (pass/fail counts, last run).
 *   - `useTestExecution`: Handles the execution of selected tests, tracks progress, stores results, and manages saving results.
 *   - `useTestSelection`: Manages the selection state of tests in the table.
 *   - `useTestDateFormatter`: Provides utility for formatting dates based on test results or stats.
 * - Configures and renders a `GenericTable` component:
 *   - Defines columns (`columns`) to display test details, status, results, stats, expected values, prompt, and generated examples.
 *   - Defines filters (`filterDefinitions`) for narrowing down the test list (e.g., by object type).
 *   - Integrates selection functionality using `selectionOptions`.
 * - Renders `TestControls` for initiating test runs and managing stats.
 * - Displays a `TestResultsSummary` based on the latest execution.
 * - Handles client-side rendering checks (`isClient`) to prevent hydration errors.
 *
 * @returns {JSX.Element} The rendered testing environment page.
 */
export default function MathObjectsGeneratorTestsPage() {

    // Independent initializations (can be moved anywhere)
    /** @const {TestCase[]} allTestsList - The complete list of test cases loaded from `@tests/cases`. */
    const allTestsList = getAllTests();
    /** @state {string | null} errorMessage - Stores any general error messages for the page. */
    const [errorMessage] = useState<string | null>(null);
    
    // Authentication
    /** @hook useAuth - Provides current user information for access control. */
    const { user, isAuthenticated, login } = useAuth();
    /** @hook useFallbackTranslation - Provides translation function for user-facing messages. */
    const { t } = useFallbackTranslation();
    
    // Test stats (needed by filtering and save logic)
    /** @hook useTestStats - Provides test statistics, refresh function, and fetching control. */
    const { testStats, refreshStats, isFetchingEnabled, toggleFetchingEnabled, error: testStatsError } = useTestStats();
    
    // Core test execution state (needed by other hooks)
    /** @hook useTestExecution - Manages test execution, results, progress, and saving. */
    const {
        results,
        isRunning,
        currentTestIndex,
        executeTests,
        summary,
        saveResultsMessage
    } = useTestExecution(refreshStats);
    
    // Test selection (needed by save logic and filtering)
    /** @hook useTestSelection - Manages the set of selected tests. */
    const {
        selectedTests,
        toggleTest,
        toggleSelectAll
    } = useTestSelection();
    
    // Track if we are on the client to avoid hydration errors
    /** @state {boolean} isClient - Flag indicating if the component has mounted on the client. */
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    // AI System selection state
    /** @state {AISystem} selectedSystem - The currently selected AI system for test execution. */
    const [selectedSystem, setSelectedSystem] = useState<AISystem>('langgraph');

    // Explanation visibility state
    /** @state {boolean} showExplanation - Controls visibility of the system explanation area. */
    const [showExplanation, setShowExplanation] = useState<boolean>(false);

    // Success message state management
    /** @state {boolean} showSuccessMessage - Controls visibility of success message. */
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    
    // Login required message state management
    /** @state {boolean} showLoginMessage - Controls visibility of login required message. */
    const [showLoginMessage, setShowLoginMessage] = useState(false);

    // Effect to show success message when results are saved successfully
    useEffect(() => {
        if (saveResultsMessage === 'Results saved successfully!') {
            setShowSuccessMessage(true);
            // Hide the message after 5 seconds
            const timer = setTimeout(() => {
                setShowSuccessMessage(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [saveResultsMessage]);

    // Helper functions for date formatting
    const getTestStat = (test: TestCase<Record<string, unknown>>) => testStats.find(s => s.name === test.name);
    const getTestResult = (test: TestCase<Record<string, unknown>>) => results.find(r => r.test.name === test.name);
    /** @hook useTestDateFormatter - Provides formatted date strings for test stats/results. */
    const { getFormattedDate } = useTestDateFormatter(getTestStat, getTestResult);

    /**
     * @const {ColumnDefinition[]} columns - Configuration for the columns displayed in the GenericTable.
     * Defines how each piece of test data (status, name, type, results, etc.) is rendered.
     */
    const columns: ColumnDefinition<TestCase<Record<string, unknown>>>[] = [
        // Status column (shows pass/fail/running)
        {
            key: 'status',
            header: '⚡',
            className: 'w-8', // very narrow, centered
            renderCell: (test: TestCase<Record<string, unknown>>) => {
                const result = results.find(r => r.test.name === test.name);
                const isCurrentRunningTest = isRunning && selectedTests[currentTestIndex]?.name === test.name;
                return (
                    <StatusIndicator
                        isPassed={!!result && result.passed}
                        isFailed={!!result && result.passed === false}
                        isRunning={isCurrentRunningTest}
                        title={
                            isCurrentRunningTest ? 'running' :
                            result?.passed ? 'passed' :
                            result?.passed === false ? 'failed' : 'not_run'
                        }
                    />
                );
            }
        },
        // Name column
        {
            key: 'name',
            header: 'Name',
            className: 'w-48',
            renderCell: (test: TestCase<Record<string, unknown>>) => (
                <div className="font-mono text-sm">
                    {test.name}
                </div>
            )
        },
        // Type column
        {
            key: 'type',
            header: 'Type',
            className: 'w-24',
            renderCell: (test: TestCase<Record<string, unknown>>) => (
                <PropertyTags test={test} result={getTestResult(test)} />
            )
        },
        // Results column
        {
            key: 'results',
            header: 'Results',
            className: 'w-20',
            renderCell: (test: TestCase<Record<string, unknown>>) => {
                const result = results.find(r => r.test.name === test.name);
                if (!result) return <span className="text-text-muted">-</span>;
                return (
                    <div className="text-sm">
                        <div className={result.passed ? 'text-success-600' : 'text-danger-600'}>
                            {result.passed ? 'PASS' : 'FAIL'}
                        </div>
                        <div className="text-xs text-text-secondary">
                            {result.elapsedTime}ms
                        </div>
                    </div>
                );
            }
        },
        // Stats column
        {
            key: 'stats',
            header: 'Stats',
            className: 'w-24',
            renderCell: (test: TestCase<Record<string, unknown>>) => {
                const stat = testStats.find(s => s.name === test.name);
                if (!stat) return <span className="text-text-muted">-</span>;
                return (
                    <div className="text-xs">
                        <div className="flex gap-1">
                            <span className="text-success-600">{stat.passCount}</span>
                            <span>/</span>
                            <span className="text-danger-600">{stat.failCount}</span>
                        </div>
                        <div className="text-text-secondary">
                            {getFormattedDate(test)}
                        </div>
                    </div>
                );
            }
        },
        // Expected column
        {
            key: 'expected',
            header: 'Expected',
            className: 'w-32',
            renderCell: (test: TestCase<Record<string, unknown>>) => {
                const result = getTestResult(test);
                return <MathDisplay result={result} />;
            }
        },
        // Prompt column
        {
            key: 'prompt',
            header: 'Prompt',
            className: 'w-48',
            renderCell: (test: TestCase<Record<string, unknown>>) => (
                <div className="text-sm text-text-primary truncate" title={test.prompt}>
                    {test.prompt}
                </div>
            )
        },
        // Generated column
        {
            key: 'generated',
            header: 'Generated',
            className: 'w-48',
            renderCell: (test: TestCase<Record<string, unknown>>) => {
                const result = results.find(r => r.test.name === test.name);
                return <MathDisplay result={result} />;
            }
        }
    ];

    /**
     * @const {FilterDefinition[]} filterDefinitions - Configuration for the filters available in the GenericTable.
     * Allows users to filter tests by various criteria like object type.
     */
    const filterDefinitions: FilterDefinition<TestCase<Record<string, unknown>>>[] = [
        {
            key: 'objectType',
            label: 'Object Type',
            options: Array.from(new Set(allTestsList.map(test => test.objectType))).sort()
        }
    ];

    /**
     * @const {object} selectionOptions - Configuration for the selection functionality in the GenericTable.
     * Enables users to select individual tests or all tests at once.
     */
    const selectionOptions = {
        selectedItems: selectedTests,
        onToggleItem: (test: TestCase<Record<string, unknown>>) => toggleTest(test),
        onSelectAll: (tests: TestCase<Record<string, unknown>>[], select: boolean) => toggleSelectAll(tests, select),
        itemKey: 'name' as keyof TestCase<Record<string, unknown>>
    };

    // Handler functions for test controls
    const handleExecuteTests = () => {
        if (!isAuthenticated) {
            setShowLoginMessage(true);
            return;
        }
        executeTests(selectedTests, selectedSystem);
    };
    const handleResetStats = () => resetTestStats(refreshStats);
    const handleSystemChange = (system: AISystem) => setSelectedSystem(system);
    const handleToggleExplanation = () => setShowExplanation(prev => !prev);
    
    // Only allow reset for specific user
    const canResetStats = user?.id === 'Lig44jZ3uUIEp4UqiCdb';

    // Get explanation text based on selected system
    const getSystemExplanation = (system: AISystem): string => {
        if (system === 'langgraph') {
            return 'System 2 uses LangGraph, a state machine-based approach for generating mathematical objects. It processes requests through a structured workflow with multiple nodes handling identification, extraction, and validation.';
        } else {
            return 'System 1 uses the legacy MathObjectGenerator, which processes mathematical object generation through a traditional chain-based approach with sequential processing steps.';
        }
    };

    // Don't render until we're on the client to avoid hydration errors
    if (!isClient) {
        return <div className="text-text-primary">Loading...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Success Message */}
            <SuccessMessage
                visible={showSuccessMessage}
                messageKey="results_saved_successfully"
            />
            
            {/* Login Required Message */}
            <ToastNotification
                visible={showLoginMessage}
                messageKey="please_log_in_to_use_this_feature"
                type="info"
                duration={5000}
                onClose={() => setShowLoginMessage(false)}
            />

            {/* Error Display */}
            {(errorMessage || testStatsError) && (
                <div className="mb-4 p-4 bg-danger-50 border border-danger-300 text-danger-700 rounded-lg">
                    {errorMessage || testStatsError}
                </div>
            )}

            {/* Test Controls */}
            <div className="mb-6">
                <TestControls
                    onRunTests={handleExecuteTests}
                    onResetTestStats={canResetStats ? handleResetStats : undefined}
                    toggleFetchingEnabled={toggleFetchingEnabled}
                    isRunning={isRunning}
                    isFetchingEnabled={isFetchingEnabled}
                    selectedTestsCount={selectedTests.length}
                    selectedSystem={selectedSystem}
                    onSystemChange={handleSystemChange}
                    showExplanation={showExplanation}
                    onToggleExplanation={handleToggleExplanation}
                    isAuthenticated={isAuthenticated}
                />
            </div>

            {/* System Explanation Area */}
            {showExplanation && (
                <div className="mb-6 p-4 bg-surface-card border border-border-default rounded-lg shadow-soft">
                    <div className="text-sm text-text-primary mb-4">
                        {getSystemExplanation(selectedSystem)}
                    </div>
                    <div className="mt-4 pt-4 border-t border-border-default">
                        <h4 className="text-sm font-semibold text-text-secondary mb-3">Workflow Diagram</h4>
                        <SystemFlowDiagram system={selectedSystem} />
                    </div>
                </div>
            )}

            {/* Test Results Summary */}
            {summary && (
                <div className="mb-6">
                    <TestResultsSummary {...summary} />
                </div>
            )}

            {/* Test Table */}
            <div className="bg-surface-card border border-border-default rounded-lg shadow-soft">
                <GenericTable
                    tableId="math-objects-tests-table"
                    items={allTestsList}
                    columns={columns}
                    filterDefinitions={filterDefinitions}
                    selectionOptions={selectionOptions}
                    paginationOptions={{
                        defaultPageSize: 20,
                        pageSizeOptions: [10, 20, 50, 100],
                        localStorageKey: 'math-objects-tests-table-page-size'
                    }}
                />
            </div>
        </div>
    );
}



