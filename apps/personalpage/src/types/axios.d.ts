/**
 * @module axios
 * Augments the 'axios' module to provide more specific types or handle module resolution nuances.
 */
declare module "axios" {
  /**
   * Represents the response of an Axios request.
   * @template T The type of the response data.
   */
  export interface AxiosResponse<T = unknown> {
    /** The data returned by the server. */
    data: T;
    /** The HTTP status code from the server response. */
    status: number;
    /** The HTTP status message from the server response. */
    statusText: string;
    /** The headers sent by the server in response. */
    headers: Record<string, string>;
    /** The config object used for the request. */
    config: unknown;
  }

  /**
   * Represents an error that occurred during an Axios request.
   * @template T The type of the response data associated with the error, if available.
   */
  export interface AxiosError<T = unknown> extends Error {
    /** The config object used for the request that resulted in the error. */
    config: unknown;
    /** Optional error code (e.g., 'ECONNABORTED'). */
    code?: string;
    /** The request object that was sent. */
    request?: unknown;
    /** The response object received from the server, if any. */
    response?: AxiosResponse<T>;
    /** A boolean flag indicating that the error originated from Axios. */
    isAxiosError: boolean;
  }

  /**
   * Represents an Axios instance, callable as a function to make requests.
   */
  export interface AxiosInstance {
    /**
     * Makes an HTTP request.
     * @param config The request configuration.
     * @returns A promise that resolves with the AxiosResponse.
     */
    (config: unknown): Promise<AxiosResponse>;
    /**
     * Type guard to check if an error is an AxiosError.
     * @param error The error object to check.
     * @returns True if the error is an AxiosError, false otherwise.
     */
    isAxiosError(error: unknown): error is AxiosError;
  }

  /** Default Axios instance. */
  const axios: AxiosInstance;
  export default axios;

  /**
   * Type guard function to check if an error is an AxiosError.
   * @param error The error object to check.
   * @returns True if the error is an AxiosError, false otherwise.
   */
  export function isAxiosError(error: unknown): error is AxiosError;
}
