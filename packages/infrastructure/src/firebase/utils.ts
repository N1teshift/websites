/**
 * Firebase Utility Functions
 *
 * Client-safe utility functions that don't import server-only code.
 * These can be safely used in both client and server contexts.
 */

/**
 * Check if we're running on the server
 * This is client-safe and doesn't import any server-only code
 */
export function isServerSide(): boolean {
  return typeof window === "undefined";
}
