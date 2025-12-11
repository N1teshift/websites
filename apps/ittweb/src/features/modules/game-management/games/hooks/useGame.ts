import type { GameWithPlayers } from "../types";
import { createUrlDataFetchHook } from "@websites/infrastructure/hooks";
import { swrKeys } from "@websites/infrastructure/cache";

const useGameHook = createUrlDataFetchHook<GameWithPlayers, string>(
  (id: string) => `/api/games/${id}`,
  {
    useSWR: true,
    swrKey: (id: string) => (id ? swrKeys.game(id) : null),
    swrConfig: {
      // Static data - cache for 5 minutes (300000ms)
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000,
    },
    enabled: (id) => !!id,
    handle404: false,
    // Removed cacheBust - SWR will handle caching properly
    componentName: "useGame",
    operationName: "fetchGame",
  }
);

interface UseGameResult {
  game: GameWithPlayers | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void | Promise<void>;
}

export function useGame(id: string): UseGameResult {
  const { data, loading, error, refetch } = useGameHook(id);

  return {
    game: data,
    loading,
    error,
    refetch,
  };
}
