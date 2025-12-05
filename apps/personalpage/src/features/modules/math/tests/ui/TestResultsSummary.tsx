import React from 'react';
import { TestSummary } from '@math/types/testsTypes';
import { useFallbackTranslation } from '@websites/infrastructure/i18n';

/**
 * Displays a formatted summary of test execution results.
 * Takes a `TestSummary` object as props and renders statistics like
 * total tests, passed/failed/repaired counts, pass rate, execution time,
 * token usage, and estimated cost.
 *
 * @param {TestSummary} props - The test summary data to display.
 */
const TestResultsSummary: React.FC<TestSummary> = ({
    totalTests,
    passedTests,
    failedTests,
    repairedTests,
    totalTime,
    usage,
    estimatedCost
}) => {
    const { t } = useFallbackTranslation();

    /** Calculated pass rate string (e.g., "85.0%"). */
    const passRate = totalTests > 0 ? `${(passedTests / totalTests * 100).toFixed(1)}%` : '0.0%';
    
    /**
     * Determines the Tailwind CSS text color class based on the pass rate percentage.
     * @param {string} rate - The pass rate string (e.g., "85.0%").
     * @returns {string} Tailwind text color class (e.g., 'text-green-500').
     * @private
     */
    const getPassRateColor = (rate: string) => {
        const percentage = parseFloat(rate);
        if (percentage >= 80) return 'text-success-600';
        if (percentage >= 50) return 'text-warning-600';
        return 'text-danger-600';
    };

    /**
     * Formats a cost value into a dollar string.
     * @param {number} cost - The cost value.
     * @returns {string} Formatted cost string (e.g., "$0.0123").
     * @private
     */
    const formatCost = (cost: number) => `$${cost.toFixed(4)}`;
    /**
     * Formats a time value (in milliseconds) into a string.
     * @param {number} time - The time value in ms.
     * @returns {string} Formatted time string (e.g., "1234ms").
     * @private
     */
    const formatTime = (time: number) => `${time.toFixed(0)}ms`;
    /**
     * Formats a number using locale-specific separators.
     * @param {number} num - The number to format.
     * @returns {string} Formatted number string (e.g., "1,234").
     * @private
     */
    const formatNumber = (num: number) => num.toLocaleString();

    return (
        <div className="bg-surface-card rounded-lg shadow-soft border border-border-default p-2">
            <div className="flex gap-3">
                {/* Test Results Section */}
                <div className="flex-1 flex items-center py-1.5 px-2 bg-surface-button rounded-lg">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="text-center">
                                <div className="text-xs text-text-secondary">{t('total')}</div>
                                <div className="text-xl font-bold text-text-primary">{totalTests}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xs text-text-secondary">✓</div>
                                <div className="text-xl font-semibold text-success-600">{passedTests}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xs text-text-secondary">✗</div>
                                <div className="text-xl font-semibold text-danger-600">{failedTests}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xs text-text-secondary">⟳</div>
                                <div className="text-xl font-semibold text-warning-600">{repairedTests}</div>
                            </div>
                        </div>
                        <div className="border-l border-border-default pl-3">
                            <span className={getPassRateColor(passRate)}>{passRate}</span>
                        </div>
                    </div>
                </div>

                {/* Time Section */}
                <div className="flex-1 flex items-center py-1.5 px-2 bg-surface-button rounded-lg">
                    <div className="flex items-center justify-center w-full">
                        <div className="text-center">
                            <div className="text-xs text-text-secondary">{t('execution_time')}</div>
                            <div className="text-xl font-semibold text-text-primary">{formatTime(totalTime)}</div>
                        </div>
                    </div>
                </div>

                {/* Token Usage Section */}
                <div className="flex-1 flex items-center justify-between py-1.5 px-2 bg-surface-button rounded-lg">
                    <div>
                        <div className="text-xs text-text-secondary">{t('token_usage')}</div>
                        <div className="text-xl font-semibold text-text-primary flex items-center">
                            {formatNumber(usage.total_tokens)}
                            {usage.total_tokens === 0 && <span className="text-xs text-danger-500 ml-1">({t('no_data')})</span>}
                        </div>
                        <div className="text-xs text-text-secondary">
                            {`${t('input')}: ${formatNumber(usage.input_tokens)}, ${t('output')}: ${formatNumber(usage.output_tokens)}`}
                        </div>
                    </div>
                    <div className="text-right border-l border-border-default pl-3">
                        <div className="text-xs text-text-secondary">{t('cost')}</div>
                        <div className="text-base font-medium text-text-primary">{formatCost(estimatedCost)}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestResultsSummary; 



