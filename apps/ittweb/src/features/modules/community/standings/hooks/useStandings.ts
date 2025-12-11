import type { StandingsResponse, StandingsFilters } from "../types";
import { createDataFetchHook } from "@websites/infrastructure/hooks";
import { swrKeys } from "@websites/infrastructure/cache";

const useStandingsHook = createDataFetchHook<StandingsResponse, StandingsFilters>({
  fetchFn: async (filters) => {
    const queryParams = new URLSearchParams();
    if (filters.category) queryParams.append("category", filters.category);
    if (filters.minGames) queryParams.append("minGames", filters.minGames.toString());
    if (filters.page) queryParams.append("page", filters.page.toString());
    if (filters.limit) queryParams.append("limit", filters.limit.toString());

    const response = await fetch(`/api/standings?${queryParams.toString()}`);

    if (!response.ok) {
      // Try to parse error from response
      try {
        const errorData = await response.json();
        if (errorData.error) {
          return { success: false, error: errorData.error } as any;
        }
      } catch {
        // If parsing fails, use status text
      }
      return {
        success: false,
        error: `Failed to fetch standings: ${response.statusText}`,
      } as any;
    }

    return response.json();
  },
  useSWR: true,
  swrKey: (filters) => {
    // Convert filters to Record<string, string> format for swrKeys
    const filterParams: Record<string, string> = {};
    if (filters.category) filterParams.category = filters.category;
    if (filters.minGames) filterParams.minGames = filters.minGames.toString();
    if (filters.page) filterParams.page = filters.page.toString();
    if (filters.limit) filterParams.limit = filters.limit.toString();
    return swrKeys.standings(filterParams);
  },
  swrConfig: {
    // Static data - cache for 5 minutes (300000ms)
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 300000,
  },
  componentName: "useStandings",
  operationName: "fetchStandings",
});

interface UseStandingsResult {
  standings: StandingsResponse["standings"];
  loading: boolean;
  error: Error | null;
  total: number;
  page: number;
  hasMore: boolean;
  refetch: () => void | Promise<void>;
}

export function useStandings(filters: StandingsFilters = {}): UseStandingsResult {
  const { data, loading, error, refetch } = useStandingsHook(filters);

  return {
    standings: data?.standings ?? [],
    loading,
    error,
    total: data?.total ?? 0,
    page: data?.page ?? (filters.page || 1),
    hasMore: data?.hasMore ?? false,
    refetch,
  };
}
