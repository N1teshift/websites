import axios from 'axios';
import { createComponentLogger } from '@websites/infrastructure/logging';

const logger = createComponentLogger('ApiRequest');

// Base configuration
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

/**
 * Centralized API request utility using Axios.
 * Provides consistent error handling, logging, and request configuration.
 * 
 * @template T The expected response type
 * @param url The endpoint URL (relative to base URL)
 * @param method HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param payload Optional request payload
 * @param config Optional Axios configuration
 * @returns Promise resolving to the response data
 */
export const apiRequest = async <T = unknown>(
    url: string,
    method: string = 'GET',
    payload?: Record<string, unknown>,
    config?: Record<string, unknown>
): Promise<T> => {
    // For internal API routes, use relative URLs when baseURL is empty
    const fullUrl = url.startsWith('http') ? url : (baseURL ? `${baseURL}${url}` : url);

    const requestConfig: Record<string, unknown> = {
        method,
        url: fullUrl,
        headers: {
            'Content-Type': 'application/json',
            ...(config?.headers as Record<string, string> || {}),
        },
        ...config,
    };

    if (payload && method !== 'GET') {
        requestConfig.data = payload;
    }

    try {
        logger.debug('Making API request', {
            method,
            url: fullUrl,
            hasPayload: !!payload,
        });

        const response = await axios(requestConfig);

        logger.debug('API request successful', {
            method,
            url: fullUrl,
            status: response.status,
        });

        return response.data as T;
    } catch (error) {
        logger.error('API request failed', error instanceof Error ? error : new Error(String(error)), {
            method,
            url: fullUrl,
            status: axios.isAxiosError(error) ? error.response?.status : 'unknown',
        });
        throw error;
    }
};

/**
 * Generic fetch utility function using shared apiRequest.
 * Provides a consistent interface for API calls with standardized error handling.
 * 
 * @template T The expected type of the data in the response.
 * @param url The URL to fetch data from.
 * @param method The HTTP method to use.
 * @param payload Optional request payload.
 * @returns A promise that resolves to an object containing either the fetched data or an error message.
 */
export const fetchData = async <T>(
    url: string,
    method: string = 'GET',
    payload?: Record<string, unknown>
): Promise<{ data: T | null; error: string | null }> => {
    try {
        const data: T = await apiRequest<T>(url, method, payload);
        return { data, error: null };
    } catch (error) {
        // Try to extract the actual error message from the API response
        let errorMsg = "Unknown error";

        if (axios.isAxiosError(error)) {
            // If the API returned an error response with a body, use that
            if (error.response?.data) {
                const responseData = error.response.data;
                if (typeof responseData === 'object' && responseData !== null) {
                    // Check for common error field names
                    if ('error' in responseData && typeof responseData.error === 'string') {
                        errorMsg = responseData.error;
                    } else if ('message' in responseData && typeof responseData.message === 'string') {
                        errorMsg = responseData.message;
                    } else {
                        errorMsg = `Request failed with status ${error.response.status}`;
                    }
                } else if (typeof responseData === 'string') {
                    errorMsg = responseData;
                } else {
                    errorMsg = `Request failed with status ${error.response.status}`;
                }
            } else {
                errorMsg = error.message || `Request failed with status ${error.response?.status || 'unknown'}`;
            }
        } else if (error instanceof Error) {
            errorMsg = error.message;
        }

        logger.error(`Error at ${url}`, error instanceof Error ? error : new Error(errorMsg), {
            url,
            status: axios.isAxiosError(error) ? error.response?.status : undefined,
            responseData: axios.isAxiosError(error) ? error.response?.data : undefined
        });
        return { data: null, error: errorMsg };
    }
};

/**
 * Generic save utility function using shared apiRequest.
 * Provides a consistent interface for save operations with standardized error handling.
 * 
 * @template T The expected type of the response data (usually void for save operations).
 * @param url The URL to save data to.
 * @param payload The data to save.
 * @param method The HTTP method to use (defaults to POST).
 * @returns A promise that resolves to an object containing either success status or an error message.
 */
export const saveData = async <T = void>(
    url: string,
    payload: Record<string, unknown>,
    method: string = 'POST'
): Promise<{ success: boolean; data?: T; error: string | null }> => {
    try {
        if (!payload || typeof payload !== "object") {
            throw new Error("Invalid or missing payload.");
        }

        const data: T = await apiRequest<T>(url, method, payload);
        return { success: true, data, error: null };
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        logger.error(`Error saving data at ${url}`, error instanceof Error ? error : new Error(errorMsg), { url });
        return { success: false, error: errorMsg };
    }
};
