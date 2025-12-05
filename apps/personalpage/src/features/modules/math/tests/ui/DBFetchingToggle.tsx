import React, { useState, useEffect } from 'react';
import { getCache, makeCacheKey } from '@websites/infrastructure/cache';
import { useFallbackTranslation } from '@websites/infrastructure/i18n';

export interface DBFetchingToggleProps {
    /** Whether database fetching is currently enabled. */
    isFetchingEnabled: boolean;
    /** Function to call when the toggle button is clicked. */
    toggleFetchingEnabled: () => void;
    /** Optional flag to disable the toggle button (e.g., during test execution). Defaults to `false`. */
    disabled?: boolean;
}

/**
 * A client-rendered button component that allows users to toggle database fetching
 * for test statistics on or off. Displays the current state and provides a tooltip
 * with details about fetching status or cache information.
 * @param {DBFetchingToggleProps} props - The component props.
 */
const DBFetchingToggle: React.FC<DBFetchingToggleProps> = ({ 
    isFetchingEnabled, 
    toggleFetchingEnabled,
    disabled = false // Default to false if not provided
}) => {
    /** State to track if the component has mounted on the client. */
    const [isClient, setIsClient] = useState(false);
    /** State to control the visibility of the tooltip. */
    const [showTooltip, setShowTooltip] = useState(false);
    const { t } = useFallbackTranslation();

    // Ensure component only renders client-side to safely access localStorage and avoid hydration issues.
    useEffect(() => {
        setIsClient(true);
    }, []);
    
    // Return null during server-side rendering or before client-side mount.
    if (!isClient) return null;
    
    /**
     * Retrieves information about the cached test statistics for display in the tooltip.
     * Reads from the shared cache used by `useTestStats`.
     * @returns {string} A localized string describing the cache status (e.g., "Using cached data from 10:30:15 (5 minutes ago)") or "No cache available".
     * @private
     */
    const getCacheInfo = () => {
        // Use the shared cache utility to read the test stats cache
        const cache = getCache<{ data: unknown; timestamp: number }>(makeCacheKey('test-stats', 'main'));
        if (!cache || !cache.timestamp) return t('no_cache_available');
        const lastFetch = new Date(cache.timestamp);
        const timeAgo = Math.floor((Date.now() - cache.timestamp) / 60000); // minutes
        return `${t('using_cached_data_from')} ${lastFetch.toLocaleTimeString()} (${timeAgo} ${t('minutes_ago')})`;
    };
    
    return (
        <div className="relative">
            <button
                onClick={() => !disabled && toggleFetchingEnabled()} // Prevent click when disabled
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className={`px-3 py-1 text-xs rounded flex items-center ${
                    isFetchingEnabled 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-600 text-white'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`} // Add disabled styles
                title={disabled ? t('cannot_toggle_fetching_while_tests_are_running') : t('toggle_database_fetching_when_disabled_the_app_will_use_cached_data_only')}
                disabled={disabled} // Add native disabled attribute
            >
                <span className="mr-1">{t('db_fetching')}:</span>
                <span className="font-bold">{isFetchingEnabled ? t('on') : t('off')}</span>
            </button>
            
            {/* Enhanced tooltip showing cache status */}
            {showTooltip && (
                <div className="absolute right-0 top-full mt-1 z-50 p-2 bg-gray-800 text-white text-xs rounded shadow-lg w-64">
                    <p><strong>{t('database_fetching')}: {isFetchingEnabled ? t('enabled') : t('disabled')}</strong></p>
                    <p className="mt-1 text-gray-300">
                        {isFetchingEnabled 
                            ? t('fresh_data_will_be_fetched_from_the_database_as_needed') 
                            : getCacheInfo()}
                    </p>
                </div>
            )}
        </div>
    );
};

export default DBFetchingToggle; 



