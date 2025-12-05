// Centralized Cache Utility
// Supports in-memory and persistent (localStorage) caching with expiry and namespacing.
// Use this utility for all caching needs across the project.

// Usage Example:
// setCache('calendar-events:en', events, { persist: true, expiryMs: 30 * 60 * 1000 });
// const cached = getCache('calendar-events:en');

import { createComponentLogger } from '@websites/infrastructure/logging';

const logger = createComponentLogger('CacheUtils');

interface CacheOptions {
    persist?: boolean; // If true, use localStorage
    expiryMs?: number; // Expiry in milliseconds
}

interface CacheEntry<T> {
    value: T;
    expiry?: number; // Timestamp in ms
}

// In-memory cache (module-level, not persisted across reloads)
const memoryCache = new Map<string, CacheEntry<unknown>>();

// Helper: Get current time
const now = () => Date.now();

/**
 * Calculates the total size of localStorage in bytes and MB.
 * 
 * @returns Object with size in bytes and MB, or null if localStorage is not available.
 */
function calculateLocalStorageSize(): { bytes: number; mb: number; keys: number } | null {
    if (typeof window === 'undefined') {
        return null;
    }
    
    try {
        let totalBytes = 0;
        let keyCount = 0;
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                const value = localStorage.getItem(key);
                if (value) {
                    // Calculate size: key length + value length (UTF-16 encoding = 2 bytes per char)
                    totalBytes += (key.length + value.length) * 2;
                    keyCount++;
                }
            }
        }
        
        return {
            bytes: totalBytes,
            mb: totalBytes / (1024 * 1024),
            keys: keyCount
        };
    } catch (e) {
        logger.warn('Failed to calculate localStorage size', { error: e instanceof Error ? e.message : String(e) });
        return null;
    }
}

/**
 * Logs the current localStorage usage to the browser console.
 * Shows total size in MB, bytes, number of keys, and approximate limit.
 */
export function logLocalStorageUsage(): void {
    const sizeInfo = calculateLocalStorageSize();
    
    if (!sizeInfo) {
        logger.info('localStorage is not available');
        return;
    }
    
    const { bytes, mb, keys } = sizeInfo;
    const limitMB = 5; // Typical limit is 5-10MB, using 5MB as conservative estimate
    
    logger.info('localStorage usage', {
        usedMB: mb.toFixed(3),
        usedBytes: bytes,
        keys: keys,
        limitMB: limitMB,
        percentageUsed: ((mb / limitMB) * 100).toFixed(1) + '%',
        remainingMB: (limitMB - mb).toFixed(3)
    });
}

/**
 * Sets a value in the cache.
 *
 * @template T The type of the value being cached.
 * @param key The cache key.
 * @param value The value to cache.
 * @param options Cache options, including persistence and expiry.
 */
// Set cache value
export function setCache<T>(key: string, value: T, options: CacheOptions = {}) {
    const entry: CacheEntry<T> = {
        value,
        expiry: options.expiryMs ? now() + options.expiryMs : undefined
    };
    memoryCache.set(key, entry);
    // Optionally persist in localStorage
    if (options.persist && typeof window !== 'undefined') {
        try {
            localStorage.setItem(key, JSON.stringify(entry));
            // Log usage after setting (only in development or when explicitly enabled)
            if (process.env.NODE_ENV === 'development') {
                logLocalStorageUsage();
            }
        } catch (e) {
            logger.warn('Failed to store cache in localStorage', { error: e instanceof Error ? e.message : String(e) });
            // If storage fails, log current usage to help diagnose
            logLocalStorageUsage();
        }
    }
}

/**
 * Retrieves a value from the cache.
 * Checks the in-memory cache first, then localStorage if persistence was used.
 *
 * @template T The expected type of the cached value.
 * @param key The cache key.
 * @returns The cached value if found and not expired, otherwise undefined.
 */
// Get cache value (checks memory first, then localStorage if enabled)
export function getCache<T>(key: string): T | undefined {
    // Check in-memory cache
    const memEntry = memoryCache.get(key);
    if (memEntry) {
        if (!memEntry.expiry || memEntry.expiry > now()) {
            // Cast is safe because we control set/get usage
            return memEntry.value as T;
        } else {
            logger.debug(`Expired in-memory cache for key: ${key}`);
            memoryCache.delete(key); // Expired
        }
    }
    // Check localStorage
    if (typeof window !== 'undefined') {
        try {
            const raw = localStorage.getItem(key);
            if (raw) {
                const entry: CacheEntry<T> = JSON.parse(raw);
                if (!entry.expiry || entry.expiry > now()) {
                    // Sync to memory for faster access next time
                    memoryCache.set(key, entry);
                    return entry.value;
                } else {
                    logger.debug(`Expired localStorage cache for key: ${key}`);
                    localStorage.removeItem(key); // Expired
                }
            }
        } catch (e) {
            logger.warn('Failed to read cache from localStorage', { error: e instanceof Error ? e.message : String(e) });
        }
    }
    return undefined;
}

/**
 * Checks if a valid (non-expired) cache entry exists for the given key.
 *
 * @param key The cache key.
 * @returns True if a valid cache entry exists, false otherwise.
 */
// Check if cache exists and is valid
export function hasCache(key: string): boolean {
    return getCache(key) !== undefined;
}

/**
 * Clears cache entries.
 *
 * @param key Optional. If provided, clears only the entry for this key. 
 *            If omitted, clears the entire cache (both in-memory and localStorage).
 */
// Clear cache (single key or all)
export function clearCache(key?: string) {
    if (key) {
        memoryCache.delete(key);
        if (typeof window !== 'undefined') {
            localStorage.removeItem(key);
        }
    } else {
        memoryCache.clear();
        if (typeof window !== 'undefined') {
            localStorage.clear();
        }
    }
}

/**
 * Utility function to create a namespaced cache key.
 *
 * @param namespace The namespace string (e.g., 'user-settings').
 * @param id The specific identifier within the namespace (e.g., 'theme').
 * @returns A combined cache key string (e.g., 'user-settings:theme').
 */
// Utility for namespacing keys (optional)
export function makeCacheKey(namespace: string, id: string) {
    return `${namespace}:${id}`;
}

/**
 * Clears all cache entries (both in-memory and localStorage) that belong to a specific namespace.
 *
 * @param namespace The namespace whose cache entries should be cleared.
 */
// Clear all cache entries for a given namespace (in-memory and localStorage)
export function clearNamespaceCache(namespace: string) {
    const prefix = `${namespace}:`;
    // Clear from in-memory cache
    for (const key of Array.from(memoryCache.keys())) {
        if (key.startsWith(prefix)) {
            memoryCache.delete(key);
        }
    }
    // Clear from localStorage
    if (typeof window !== 'undefined') {
        Object.keys(localStorage)
            .filter(key => key.startsWith(prefix))
            .forEach(key => localStorage.removeItem(key));
    }
}



