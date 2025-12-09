import { act, renderHook, waitFor } from "@testing-library/react";
import { useStandings } from "../useStandings";
import type { StandingsFilters, StandingsResponse } from "../../types";
import {
  setupMockFetch,
  getMockFetch,
  createSuccessResponse,
  createErrorResponse,
  createNetworkError,
} from "@websites/test-utils/mocks/fetch";

// Mock logger
jest.mock("@websites/infrastructure/logging", () => ({
  logError: jest.fn(),
}));

describe("useStandings", () => {
  const mockStandingsResponse: StandingsResponse = {
    standings: [
      {
        rank: 1,
        name: "Player 1",
        score: 1500,
        wins: 10,
        losses: 5,
        winRate: 66.67,
        games: 15,
      },
      {
        rank: 2,
        name: "Player 2",
        score: 1400,
        wins: 8,
        losses: 7,
        winRate: 53.33,
        games: 15,
      },
    ],
    total: 2,
    page: 1,
    hasMore: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    setupMockFetch();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("fetches standings on mount", () => {
    it("should fetch standings when hook mounts", async () => {
      // Arrange
      const mockFetch = getMockFetch();
      mockFetch.mockResolvedValueOnce(createSuccessResponse(mockStandingsResponse));

      // Act
      const { result } = renderHook(() => useStandings());

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(mockFetch).toHaveBeenCalledWith("/api/standings?");
      expect(result.current.standings).toEqual(mockStandingsResponse.standings);
      expect(result.current.total).toBe(2);
      expect(result.current.page).toBe(1);
      expect(result.current.hasMore).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("should handle empty results", async () => {
      // Arrange
      const mockFetch = getMockFetch();
      mockFetch.mockResolvedValueOnce(
        createSuccessResponse({ standings: [], total: 0, page: 1, hasMore: false })
      );

      // Act
      const { result } = renderHook(() => useStandings());

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.standings).toEqual([]);
      expect(result.current.total).toBe(0);
      expect(result.current.hasMore).toBe(false);
    });

    it("should handle network errors", async () => {
      // Arrange
      const mockFetch = getMockFetch();
      mockFetch.mockRejectedValueOnce(createNetworkError("Network error"));

      // Act
      const { result } = renderHook(() => useStandings());

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe("Network error");
    });
  });

  describe("applies filters", () => {
    it("should apply category filter", async () => {
      // Arrange
      const filters: StandingsFilters = { category: "1v1" };
      const mockFetch = getMockFetch();
      mockFetch.mockResolvedValueOnce(createSuccessResponse(mockStandingsResponse));

      // Act
      const { result } = renderHook(() => useStandings(filters));

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(mockFetch).toHaveBeenCalledWith("/api/standings?category=1v1");
    });

    it("should apply minGames filter", async () => {
      // Arrange
      const filters: StandingsFilters = { minGames: 10 };
      const mockFetch = getMockFetch();
      mockFetch.mockResolvedValueOnce(createSuccessResponse(mockStandingsResponse));

      // Act
      const { result } = renderHook(() => useStandings(filters));

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(mockFetch).toHaveBeenCalledWith("/api/standings?minGames=10");
    });

    it("should apply pagination filters", async () => {
      // Arrange
      const filters: StandingsFilters = { page: 2, limit: 20 };
      const mockFetch = getMockFetch();
      mockFetch.mockResolvedValueOnce(
        createSuccessResponse({ ...mockStandingsResponse, page: 2, hasMore: true })
      );

      // Act
      const { result } = renderHook(() => useStandings(filters));

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(mockFetch).toHaveBeenCalledWith("/api/standings?page=2&limit=20");
      expect(result.current.page).toBe(2);
      expect(result.current.hasMore).toBe(true);
    });

    it("should apply multiple filters", async () => {
      // Arrange
      const filters: StandingsFilters = {
        category: "1v1",
        minGames: 10,
        page: 1,
        limit: 20,
      };
      const mockFetch = getMockFetch();
      mockFetch.mockResolvedValueOnce(createSuccessResponse(mockStandingsResponse));

      // Act
      const { result } = renderHook(() => useStandings(filters));

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      const callUrl = mockFetch.mock.calls[0][0] as string;
      expect(callUrl).toContain("category=1v1");
      expect(callUrl).toContain("minGames=10");
      expect(callUrl).toContain("page=1");
      expect(callUrl).toContain("limit=20");
    });

    it("should refetch when filters change", async () => {
      // Arrange
      const mockFetch = getMockFetch();
      mockFetch.mockResolvedValue(createSuccessResponse(mockStandingsResponse));

      // Act
      const { result, rerender } = renderHook(({ filters }) => useStandings(filters), {
        initialProps: { filters: { category: "1v1" } },
      });

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Change filter
      rerender({ filters: { category: "2v2" } });

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenLastCalledWith("/api/standings?category=2v2");
    });
  });

  describe("handles loading state", () => {
    it("should set loading to true during fetch", async () => {
      // Arrange
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      let resolveFetch: (value: Response) => void;
      const fetchPromise = new Promise<Response>((resolve) => {
        resolveFetch = resolve;
      });
      mockFetch.mockReturnValueOnce(fetchPromise);

      // Act
      const { result } = renderHook(() => useStandings());

      // Assert
      expect(result.current.loading).toBe(true);

      // Resolve fetch
      resolveFetch!({
        ok: true,
        json: async () => ({
          success: true,
          data: mockStandingsResponse,
        }),
      } as Response);

      await waitFor(() => expect(result.current.loading).toBe(false));
    });

    it("should set loading to false after fetch completes", async () => {
      // Arrange
      const mockFetch = getMockFetch();
      mockFetch.mockResolvedValueOnce(createSuccessResponse(mockStandingsResponse));

      // Act
      const { result } = renderHook(() => useStandings());

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.loading).toBe(false);
    });
  });

  describe("handles error state", () => {
    it("should handle HTTP error responses", async () => {
      // Arrange
      const mockFetch = getMockFetch();
      mockFetch.mockResolvedValueOnce(
        createErrorResponse(
          500,
          "Internal Server Error",
          "Failed to fetch standings: Internal Server Error"
        )
      );

      // Act
      const { result } = renderHook(() => useStandings());

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toContain("Failed to fetch standings");
    });

    it("should handle API error responses", async () => {
      // Arrange
      const mockFetch = getMockFetch();
      // Note: API can return success: false even with ok: true
      mockFetch.mockResolvedValueOnce({
        ...createSuccessResponse(mockStandingsResponse),
        json: async () => ({
          success: false,
          error: "Invalid filters provided",
        }),
      });

      // Act
      const { result } = renderHook(() => useStandings());

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe("Invalid filters provided");
    });
  });

  describe("refetch function", () => {
    it("should allow manual refetch", async () => {
      // Arrange
      const mockFetch = getMockFetch();
      mockFetch.mockResolvedValue(createSuccessResponse(mockStandingsResponse));

      // Act
      const { result } = renderHook(() => useStandings());

      await waitFor(() => expect(result.current.loading).toBe(false));
      const initialCallCount = mockFetch.mock.calls.length;

      // Manual refetch
      act(() => {
        result.current.refetch();
      });

      // Assert
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(mockFetch.mock.calls.length).toBeGreaterThan(initialCallCount);
    });
  });
});
