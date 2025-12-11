import type { PlayerProfile, PlayerSearchFilters } from "../types";
import { createDataFetchHook } from "@websites/infrastructure/hooks";
import { swrKeys } from "@websites/infrastructure/cache";

interface UsePlayerStatsParams {
  name: string;
  filters?: PlayerSearchFilters;
}

const usePlayerStatsHook = createDataFetchHook<PlayerProfile, UsePlayerStatsParams>({
  fetchFn: async ({ name, filters }) => {
    const queryParams = new URLSearchParams();
    if (filters?.category) queryParams.append("category", filters.category);
    if (filters?.startDate) queryParams.append("startDate", filters.startDate);
    if (filters?.endDate) queryParams.append("endDate", filters.endDate);
    if (filters?.includeGames) queryParams.append("includeGames", "true");

    const response = await fetch(
      `/api/players/${encodeURIComponent(name)}?${queryParams.toString()}`
    );

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
        error: `Failed to fetch player: ${response.statusText}`,
      } as any;
    }

    return response.json();
  },
  useSWR: true,
  swrKey: ({ name, filters }) => {
    if (!name) return null;
    // Convert filters to Record<string, string> format for swrKeys
    const filterParams: Record<string, string> = {};
    if (filters?.category) filterParams.category = filters.category;
    if (filters?.startDate) filterParams.startDate = filters.startDate;
    if (filters?.endDate) filterParams.endDate = filters.endDate;
    if (filters?.includeGames) filterParams.includeGames = "true";
    return swrKeys.player(name, filterParams);
  },
  swrConfig: {
    // Static data - cache for 5 minutes (300000ms)
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 300000,
  },
  enabled: ({ name }) => !!name,
  componentName: "usePlayerStats",
  operationName: "fetchPlayer",
});

interface UsePlayerStatsResult {
  player: PlayerProfile | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void | Promise<void>;
}

export function usePlayerStats(name: string, filters?: PlayerSearchFilters): UsePlayerStatsResult {
  const { data, loading, error, refetch } = usePlayerStatsHook({ name, filters });

  return {
    player: data,
    loading,
    error,
    refetch,
  };
}
