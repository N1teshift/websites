/**
 * Fetch mocking utilities for testing
 *
 * Provides helpers to create properly structured Response objects for fetch mocks
 * that match the Fetch API specification.
 */

export interface MockFetchResponseOptions {
  ok?: boolean;
  status?: number;
  statusText?: string;
  data?: unknown;
  headers?: Record<string, string>;
  error?: string;
}

/**
 * Creates a mock Response object that matches the Fetch API Response interface
 *
 * @example
 * // Success response
 * const mockResponse = createMockFetchResponse({
 *   ok: true,
 *   status: 200,
 *   data: { success: true, data: { id: 1 } }
 * });
 *
 * // Error response
 * const errorResponse = createMockFetchResponse({
 *   ok: false,
 *   status: 404,
 *   statusText: 'Not Found',
 *   error: 'Resource not found'
 * });
 */
export function createMockFetchResponse(
  options: MockFetchResponseOptions = {},
): Response {
  const {
    ok = true,
    status = ok ? 200 : 500,
    statusText = ok ? "OK" : "Internal Server Error",
    data,
    headers = {},
    error,
  } = options;

  // Create the JSON body based on error or data
  const jsonBody = error
    ? { success: false, error }
    : data !== undefined
      ? { success: true, data }
      : { success: ok };

  // Create Headers object
  const responseHeaders = new Headers();
  Object.entries(headers).forEach(([key, value]) => {
    responseHeaders.set(key, value);
  });

  // Create a proper Response object
  return {
    ok,
    status,
    statusText,
    headers: responseHeaders,
    redirected: false,
    type: "default" as ResponseType,
    url: "",
    clone: jest.fn(() => createMockFetchResponse(options)),
    json: jest.fn().mockResolvedValue(jsonBody),
    text: jest.fn().mockResolvedValue(JSON.stringify(jsonBody)),
    blob: jest.fn().mockResolvedValue(new Blob([JSON.stringify(jsonBody)])),
    arrayBuffer: jest
      .fn()
      .mockResolvedValue(new ArrayBuffer(JSON.stringify(jsonBody).length)),
    formData: jest.fn().mockResolvedValue(new FormData()),
    body: null,
    bodyUsed: false,
  } as unknown as Response;
}

/**
 * Creates a mock fetch function that can be used with jest
 *
 * @example
 * // Setup
 * global.fetch = createMockFetch();
 *
 * // In tests
 * const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
 * mockFetch.mockResolvedValueOnce(createMockFetchResponse({ ok: true, data: { id: 1 } }));
 */
export function createMockFetch(): jest.MockedFunction<typeof fetch> {
  return jest.fn() as jest.MockedFunction<typeof fetch>;
}

/**
 * Sets up a default mock fetch for tests
 * Returns a success response by default, but can be overridden per test
 *
 * @example
 * beforeEach(() => {
 *   setupMockFetch();
 * });
 *
 * it('should handle success', async () => {
 *   const mockFetch = getMockFetch();
 *   mockFetch.mockResolvedValueOnce(createMockFetchResponse({ ok: true, data: { id: 1 } }));
 *   // ... test code
 * });
 */
export function setupMockFetch(): jest.MockedFunction<typeof fetch> {
  global.fetch = createMockFetch();
  return global.fetch as jest.MockedFunction<typeof fetch>;
}

/**
 * Gets the current mock fetch function
 * Throws if fetch hasn't been mocked
 */
export function getMockFetch(): jest.MockedFunction<typeof fetch> {
  if (!global.fetch || typeof jest === "undefined") {
    throw new Error("Fetch has not been mocked. Call setupMockFetch() first.");
  }
  return global.fetch as jest.MockedFunction<typeof fetch>;
}

/**
 * Helper to create a success response with data
 */
export function createSuccessResponse<T>(data: T): Response {
  return createMockFetchResponse({
    ok: true,
    status: 200,
    statusText: "OK",
    data,
  });
}

/**
 * Helper to create an error response
 */
export function createErrorResponse(
  status: number,
  statusText: string,
  error?: string,
): Response {
  return createMockFetchResponse({
    ok: false,
    status,
    statusText,
    error: error || statusText,
  });
}

/**
 * Helper to create a network error (rejected promise)
 */
export function createNetworkError(message = "Network request failed"): Error {
  return new Error(message);
}
