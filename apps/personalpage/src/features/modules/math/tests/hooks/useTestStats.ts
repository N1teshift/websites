import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchTestStats } from '../utils/testResultsApi';
import { TestStat } from '../../types/testsTypes';
import { TestCase } from '../../tests/cases/TestCase'; 
import { getCache, setCache, makeCacheKey } from '@websites/infrastructure/cache';
import { createComponentLogger } from '@websites/infrastructure/logging';

/**
 * Represents a `TestCase` enriched with its calculated success rate.
 */
export interface EnrichedTestCase extends TestCase<Record<string, unknown>> {
  /** The success rate of the test, calculated as `passCount / runCount`. Value is between 0 and 1, or -1 if stats are unavailable. */
  successRate?: number;
}

// Constants for fetch behavior
/** Minimum interval (in milliseconds) allowed between automatic fetches to prevent excessive requests. */
const MINIMUM_FETCH_INTERVAL = 10000; // 10 seconds between fetches
/** Cache expiry time (in milliseconds) for the fetched test statistics. */
const CACHE_EXPIRY_TIME = 30 * 60 * 1000; // 30 minutes cache expiry
/** Cache key used for storing and retrieving test statistics. */
const STATS_CACHE_KEY = makeCacheKey('test-stats', 'main');

// Flag to enable/disable database fetching (for testing)
/** LocalStorage key for the fetch enabled/disabled toggle. */
const LOCAL_STORAGE_KEY_FETCH_TOGGLE = 'testStats_enableFetch';
const isClient = typeof window !== 'undefined';
/**
 * Retrieves the current state of the database fetching toggle from LocalStorage.
 * Defaults to true if not set or if LocalStorage access fails.
 * @returns True if fetching is enabled, false otherwise.
 * @private
 */
const getIsFetchingEnabled = (): boolean => {
    if (!isClient) return true;
    try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY_FETCH_TOGGLE);
        // Default to true if not set
        return stored === null ? true : stored === 'true';
    } catch {
        return true;
    }
};

/**
 * Custom React hook to fetch, cache, and manage test statistics from a backend service.
 *
 * **Features:**
 * - Fetches statistics using `fetchTestStats`.
 * - Caches results in LocalStorage (`STATS_CACHE_KEY`) to reduce redundant fetches.
 * - Implements throttling (`MINIMUM_FETCH_INTERVAL`) to limit fetch frequency.
 * - Prevents concurrent fetches and handles potential race conditions with a versioning system.
 * - Allows global enabling/disabling of fetching via LocalStorage (for testing/development).
 * - Provides functions to enrich test cases with success rates and retrieve individual stats.
 *
 * @returns An object containing:
 *          - `testStats`: Array of `TestStat` objects (current statistics).
 *          - `isLoading`: Boolean indicating if statistics are currently being fetched.
 *          - `error`: String containing an error message if a fetch failed, otherwise null.
 *          - `enrichWithSuccessRates`: Function to add `successRate` to an array of `TestCase`s.
 *          - `getTestStat`: Function to retrieve the `TestStat` for a specific `TestCase`.
 *          - `refreshStats`: Function to manually trigger a fetch of test statistics (can be forced).
 *          - `isFetchingEnabled`: Boolean indicating if database fetching is currently globally enabled.
 *          - `toggleFetchingEnabled`: Function to toggle the global fetching enabled/disabled state.
 */
export const useTestStats = () => {
    const logger = createComponentLogger('TestStats');
    
    /** State storing the array of test statistics, initialized from cache if available. */
    const [testStats, setTestStats] = useState<TestStat[]>(() => {
        // Try to initialize from shared cache
        const cache = getCache<{ data: TestStat[]; timestamp: number; version: number }>(STATS_CACHE_KEY);
        if (cache?.data) {
            logger.info('Using cached test statistics');
            return cache.data;
        } else {
            logger.info('No cached test statistics found');
            return [];
        }
    });
    /** State indicating if statistics are currently being fetched. Initialized based on cache presence. */
    const [isLoading, setIsLoading] = useState(() => !getCache(STATS_CACHE_KEY));
    /** State storing any error message from the last fetch attempt. */
    const [error, setError] = useState<string | null>(null);
    /** State reflecting the global fetch enabled/disabled status, synchronized with LocalStorage. */
    const [isFetchingEnabled, setIsFetchingEnabled] = useState(getIsFetchingEnabled());
    
    /** Ref storing the timestamp of the last successful statistics refresh. */
    const lastRefreshTimeRef = useRef<number>(getCache<{ timestamp: number }>(STATS_CACHE_KEY)?.timestamp || 0);
    /** Ref acting as a semaphore to prevent concurrent refresh operations. */
    const refreshInProgressRef = useRef<boolean>(false);
    /** Ref storing a version number for the current stats data to prevent race conditions with setState. */
    const statsVersionRef = useRef<number>(getCache<{ version: number }>(STATS_CACHE_KEY)?.version || 0);
    /** Ref to track if we've already initialized to prevent re-fetching on every render. */
    const hasInitializedRef = useRef<boolean>(false);
    /** Ref to track the last isFetchingEnabled value to detect actual changes. */
    const lastFetchingEnabledRef = useRef<boolean>(isFetchingEnabled);

    /**
     * Toggles the global database fetching enabled/disabled state.
     * Updates LocalStorage and the internal `isFetchingEnabled` state.
     * Shows an alert with the new state.
     * @private
     */
    const toggleFetchingEnabled = useCallback(() => {
        if (!isClient) return;
        const newValue = !isFetchingEnabled;
        setIsFetchingEnabled(newValue);
        localStorage.setItem(LOCAL_STORAGE_KEY_FETCH_TOGGLE, String(newValue));
        alert(`Database fetching is now ${newValue ? 'enabled' : 'disabled'}`);
    }, [isFetchingEnabled]);

    /**
     * Fetches test statistics from the backend service (`fetchTestStats`).
     * Implements caching, throttling, and guards against concurrent fetches and stale updates.
     * Updates `testStats`, `isLoading`, `error` states, and the shared cache on completion.
     * @param forceRefresh If true, bypasses throttling and fetches regardless of cache status or last refresh time.
     *                     Defaults to false.
     * @private
     * @async
     */
    const loadTestStats = useCallback(async (forceRefresh = false) => {
        // Skip if fetching is disabled (unless forced)
        if (!isFetchingEnabled && !forceRefresh) {
            logger.info('Skipping stats fetch - database fetching is disabled');
            return;
        }
        // Skip if a fetch is already in progress
        if (refreshInProgressRef.current) {
            return;
        }
        // Check if we have a valid cache and enforce minimum time between refreshes (throttling)
        const now = Date.now();
        const timeSinceLastRefresh = now - lastRefreshTimeRef.current;
        // Only proceed if forced or cache is expired or meets minimum interval
        if (!forceRefresh && timeSinceLastRefresh < MINIMUM_FETCH_INTERVAL) {
            logger.info('Using cache for test statistics - Recent refresh detected');
            return;
        }
        // Set flags to prevent concurrent fetches
        refreshInProgressRef.current = true;
        try {
            setIsLoading(true);
            setError(null);
            const currentVersion = ++statsVersionRef.current;
            const response = await fetchTestStats();
            
            logger.debug('Fetch response received', {
                success: response.success,
                hasData: !!response.data,
                hasTests: !!response.data?.tests,
                testCount: Array.isArray(response.data?.tests) ? response.data.tests.length : 0,
                error: response.error
            });
            
            // Only update state if this is still the most recent request
            if (currentVersion === statsVersionRef.current) {
                if (response.success && response.data?.tests) {
                    // Cast the response to our extended TestStats interface
                    const newStats = response.data.tests as TestStat[];
                    if (newStats.length === 0) {
                        logger.info('No test statistics found in database');
                    } else {
                        logger.info(`Test statistics have been updated from database: ${newStats.length} tests`);
                    }
                    setTestStats(newStats);
                    // Update the shared cache
                    setCache(STATS_CACHE_KEY, {
                        data: newStats,
                        timestamp: now,
                        version: currentVersion
                    }, { persist: true, expiryMs: CACHE_EXPIRY_TIME });
                    lastRefreshTimeRef.current = now;
                } else {
                    const errorMessage = response.error || 'Failed to fetch test statistics';
                    logger.error('Failed to fetch test statistics', new Error(errorMessage), {
                        success: response.success,
                        hasData: !!response.data,
                        hasTests: !!response.data?.tests
                    });
                    setError(errorMessage);
                }
            }
        } catch (err: unknown) {
            logger.error('Error fetching test stats', err instanceof Error ? err : new Error(String(err)));
            if (err instanceof Error) {
                setError(err.message || 'Failed to fetch test statistics');
            } else {
                setError(String(err) || 'Failed to fetch test statistics');
            }
        } finally {
            setIsLoading(false);
            refreshInProgressRef.current = false;
        }
    }, [isFetchingEnabled, logger]);

    /**
     * Effect to load test statistics on component mount or when isFetchingEnabled changes.
     * Fetches if no cache exists or if the cache is older than half its expiry time (proactive refresh).
     * When DB fetching is enabled, always fetches fresh data regardless of cache freshness.
     * @private
     */
    useEffect(() => {
        // Only run if isFetchingEnabled actually changed (not just on every render)
        const fetchingEnabledChanged = lastFetchingEnabledRef.current !== isFetchingEnabled;
        lastFetchingEnabledRef.current = isFetchingEnabled;
        
        // Skip if already initialized and fetching enabled state hasn't changed
        if (hasInitializedRef.current && !fetchingEnabledChanged) {
            return;
        }
        
        // Skip if a fetch is already in progress to prevent infinite loops
        if (refreshInProgressRef.current) {
            logger.debug('Fetch already in progress, skipping');
            return;
        }
        
        // Check minimum interval to prevent rapid re-fetches
        const now = Date.now();
        const timeSinceLastRefresh = now - lastRefreshTimeRef.current;
        if (timeSinceLastRefresh < MINIMUM_FETCH_INTERVAL && hasInitializedRef.current) {
            logger.debug('Too soon since last fetch, skipping');
            return;
        }
        
        const cache = getCache<{ data: TestStat[]; timestamp: number }>(STATS_CACHE_KEY);
        
        // If DB fetching is enabled, always fetch fresh data (ignore cache)
        if (isFetchingEnabled) {
            logger.info('DB fetching enabled - fetching fresh test statistics from database');
            hasInitializedRef.current = true;
            loadTestStats(false);
            return;
        }
        
        // If DB fetching is disabled, use cache logic (only on mount or when toggled off)
        if (fetchingEnabledChanged || !hasInitializedRef.current) {
            // Fetch if no cache or cache is getting stale (older than half expiry time)
            if (!cache) {
                logger.info('No valid cache found - fetching fresh test statistics');
                hasInitializedRef.current = true;
                loadTestStats(false);
            } else if (now - cache.timestamp > CACHE_EXPIRY_TIME / 2) {
                logger.info('Cache is getting stale - updating test statistics');
                hasInitializedRef.current = true;
                loadTestStats(false);
            } else {
                logger.info('Using cache for test statistics - Cache is still fresh');
                hasInitializedRef.current = true;
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFetchingEnabled]); // Only depend on isFetchingEnabled to prevent loops
    
    /**
     * Enriches an array of `TestCase` instances by adding a `successRate` property to each.
     * The success rate is derived from the currently stored `testStats`.
     * If stats are not available for a test, `successRate` is set to -1.
     * @param testCases An array of `TestCase` objects.
     * @returns An array of `EnrichedTestCase` objects with `successRate` populated.
     */
    const enrichWithSuccessRates = useCallback((testCases: TestCase<Record<string, unknown>>[]): EnrichedTestCase[] => {
        return testCases.map(test => {
            const enrichedTest = { ...test } as EnrichedTestCase;
            const stat = testStats.find(s => s.id === test.testId);
            if (stat && typeof stat.runCount === 'number' && stat.runCount > 0 && typeof stat.passCount === 'number') {
                enrichedTest.successRate = stat.passCount / stat.runCount;
            } else {
                enrichedTest.successRate = -1;
            }
            return enrichedTest;
        });
    }, [testStats]);

    /**
     * Retrieves the `TestStat` object for a specific `TestCase` from the current `testStats` state.
     * @param test The `TestCase` instance to find statistics for.
     * @returns The corresponding `TestStat` object if found, otherwise undefined.
     */
    const getTestStat = useCallback((test: TestCase<Record<string, unknown>>): TestStat | undefined => {
        return testStats.find(stat => stat.id === test.testId);
    }, [testStats]);

    /**
     * Manually triggers a refresh of the test statistics from the backend.
     * @param force If true, bypasses throttling and fetches immediately. Defaults to false.
     */
    const refreshStats = useCallback((force = false) => {
        if (force) {
            logger.info('Forcing refresh of test statistics from database');
        }
        loadTestStats(force);
    }, [loadTestStats, logger]);

    return {
        testStats,
        isLoading,
        error,
        enrichWithSuccessRates,
        getTestStat,
        refreshStats,
        isFetchingEnabled,
        toggleFetchingEnabled
    };
} 



