/**
 * @file dateFormatters.ts
 * @description Provides utility functions for formatting dates and timestamps,
 *              including handling various input formats and creating cached formatters.
 */

import { getCache, setCache, makeCacheKey } from '@websites/infrastructure/cache';

/**
 * Formats a timestamp from various potential input formats into a consistent, human-readable string.
 *
 * Supports:
 * - Firestore Timestamp objects (with `seconds` or `_seconds`).
 * - ISO 8601 date strings.
 * - JavaScript `Date` objects.
 * - Numeric timestamps (milliseconds since epoch).
 * - Attempts to handle other object structures with time-related properties.
 *
 * @param timestamp The timestamp data to format. Can be of various types.
 * @returns A formatted date string (e.g., "Mar 15, 10:30 AM") based on the user's locale,
 *          or an error/fallback string ("Invalid date", "Unknown date format") if parsing fails.
 */
export const formatTimestamp = (timestamp: unknown): string => {
    try {
        let date: Date;
        
        // Case 1a: Firestore timestamp with regular seconds and nanoseconds
        if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp && typeof timestamp.seconds === 'number') {
            date = new Date(timestamp.seconds * 1000);
        }
        // Case 1b: Firestore timestamp with underscore _seconds and _nanoseconds
        else if (timestamp && typeof timestamp === 'object' && '_seconds' in timestamp && typeof timestamp._seconds === 'number') {
            date = new Date(timestamp._seconds * 1000);
        }
        // Case 2: ISO string or timestamp string
        else if (typeof timestamp === 'string') {
            date = new Date(timestamp);
        }
        // Case 3: Direct date object
        else if (timestamp instanceof Date) {
            date = timestamp;
        }
        // Case 4: Numeric timestamp
        else if (typeof timestamp === 'number') {
            date = new Date(timestamp);
        }
        // Fallback for other object formats
        else if (timestamp && typeof timestamp === 'object') {
            // Try to extract any property that looks like seconds
            const possibleSeconds = 
                ('seconds' in timestamp ? timestamp.seconds : undefined) || 
                ('_seconds' in timestamp ? timestamp._seconds : undefined) || 
                (typeof timestamp === 'object' && timestamp !== null && 'getSeconds' in timestamp && typeof timestamp.getSeconds === 'function' ? timestamp.getSeconds() : undefined) || 
                (typeof timestamp === 'object' && timestamp !== null && 'getTime' in timestamp && typeof timestamp.getTime === 'function' ? timestamp.getTime() / 1000 : undefined);
                
            if (possibleSeconds && typeof possibleSeconds === 'number') {
                date = new Date(possibleSeconds * 1000);
            } else {
                return "Unknown timestamp format";
            }
        }
        // Complete fallback
        else {
            return "Unknown date format";
        }
        
        // Check if date is valid
        if (!isNaN(date.getTime())) {
            return date.toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        return "Invalid date";
    } catch {
        return "Error";
    }
};

/**
 * Factory function to create a reusable date formatter function.
 * Uses `Intl.DateTimeFormat` for locale-aware formatting.
 *
 * @param options Optional `Intl.DateTimeFormatOptions` to customize the output format.
 *                Defaults to `{ month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }`.
 * @returns A function that takes a `Date` object and returns a formatted string according to the specified options.
 *
 * @example
 * const shortDateFormatter = createDateFormatter({ year: 'numeric', month: 'short', day: 'numeric' });
 * console.log(shortDateFormatter(new Date())); // e.g., "Mar 15, 2024"
 *
 * const timeOnlyFormatter = createDateFormatter({ hour: '2-digit', minute: '2-digit', second: '2-digit' });
 * console.log(timeOnlyFormatter(new Date())); // e.g., "10:30:45 AM"
 */
export const createDateFormatter = (options?: Intl.DateTimeFormatOptions) => {
    const defaultOptions: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    return (date: Date): string => {
        if (!date || isNaN(date.getTime())) return "Invalid date";
        return date.toLocaleString(undefined, finalOptions);
    };
};

/**
 * Higher-order function that wraps a given formatter function with in-memory caching.
 * Reduces redundant computations for frequently formatted identical values.
 *
 * Uses the shared `getCache`, `setCache`, and `makeCacheKey` utilities.
 * The cache is intentionally non-persistent (session-only).
 *
 * @template T The type of the value to be formatted.
 * @template R The type of the formatted result (expected to be a string).
 * @param formatter The original function that performs the formatting (e.g., `(value: T) => R`).
 * @param getKey A function to generate a unique string key from the input value `T`.
 *               Defaults to `String`, which works for primitives but might need customization for objects.
 * @param formatterId A unique identifier string for this specific formatter instance,
 *                    used to namespace cache keys. Defaults to 'default'.
 * @returns A new function with the same signature as the original `formatter`, but with added caching logic.
 */
export const createFormatterWithCache = <T, R extends string>(
    formatter: (value: T) => R,
    getKey: (value: T) => string = String,
    formatterId: string = 'default'
) => {
    // Use a shared namespace for all formatter caches
    const NAMESPACE = 'formatter-cache';
    return (value: T): R => {
        const key = makeCacheKey(NAMESPACE, `${formatterId}:${getKey(value)}`);
        // Only use in-memory cache (persist: false)
        const cached = getCache<R>(key);
        if (cached) {
            return cached;
        }
        const formatted = formatter(value);
        setCache<R>(key, formatted, { persist: false });
        return formatted;
    };
}; 



