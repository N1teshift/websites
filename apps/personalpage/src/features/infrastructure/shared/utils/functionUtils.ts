/**
 * Generic utility functions for function behavior modification
 */

/**
 * Creates a debounced version of a function that delays its execution
 * until after a specified delay has elapsed since the last time it was invoked.
 * 
 * @param fn The function to debounce
 * @param delay The delay in milliseconds
 * @returns A debounced version of the input function
 * 
 * @example
 * const debouncedSearch = debounce((query) => {
 *   // Search logic here
 * }, 500);
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
    fn: T,
    delay: number
): ((...args: Parameters<T>) => void) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    
    return function debouncedFn(...args: Parameters<T>) {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
        }
        
        timeoutId = setTimeout(() => {
            fn(...args);
            timeoutId = null;
        }, delay);
    };
}; 



