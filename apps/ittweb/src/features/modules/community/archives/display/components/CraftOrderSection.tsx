import React, { useMemo } from "react";
import { CraftOrderDisplay } from "@/features/modules/shared/components/CraftOrderDisplay";
import { getSuccessfulCrafts, groupCraftsByTeam } from "@/features/modules/shared/utils/craftUtils";
import type { GameWithPlayers } from "@/features/modules/game-management/games/types";
import type { CraftEvent } from "@/features/modules/game-management/lib/mechanics/replay/types";

interface CraftOrderSectionProps {
  game: GameWithPlayers;
}

/**
 * Display crafting order grouped by winners and losers
 */
export function CraftOrderSection({ game }: CraftOrderSectionProps) {
  const craftOrder = useMemo(() => {
    if (!game.craftEvents || game.craftEvents.length === 0) {
      return null;
    }

    // Filter to only SUCCESS events
    const successfulCrafts = getSuccessfulCrafts(game.craftEvents as CraftEvent[]);

    if (successfulCrafts.length === 0) {
      return null;
    }

    // Group by team
    const craftsByTeam = groupCraftsByTeam(successfulCrafts);

    // Determine which teams are winners and losers
    const winners = game.players?.filter((p) => p.flag === "winner") || [];
    const losers = game.players?.filter((p) => p.flag === "loser") || [];

    // Get unique team numbers for winners and losers
    const winnerTeams = new Set(
      winners
        .map((p) => (typeof p.team === "number" ? p.team : undefined))
        .filter((t): t is number => t !== undefined)
    );
    const loserTeams = new Set(
      losers
        .map((p) => (typeof p.team === "number" ? p.team : undefined))
        .filter((t): t is number => t !== undefined)
    );

    // Separate crafts by winner/loser teams
    const winnerCrafts: CraftEvent[] = [];
    const loserCrafts: CraftEvent[] = [];

    for (const [team, crafts] of craftsByTeam.entries()) {
      if (winnerTeams.has(team)) {
        winnerCrafts.push(...crafts);
      } else if (loserTeams.has(team)) {
        loserCrafts.push(...crafts);
      }
    }

    // Fallback: If we have crafts but couldn't match them to teams,
    // show all crafts in chronological order
    // This handles cases where players don't have team numbers set
    if (winnerCrafts.length === 0 && loserCrafts.length === 0 && successfulCrafts.length > 0) {
      // If we can't match teams, show all crafts sorted by time
      // For 1v1 games, we'll show them all in the winners column as a fallback
      if (winners.length > 0) {
        winnerCrafts.push(...successfulCrafts);
      } else if (losers.length > 0) {
        loserCrafts.push(...successfulCrafts);
      } else {
        // No winners/losers, but show crafts anyway
        winnerCrafts.push(...successfulCrafts);
      }
    }

    // Sort by time within each group
    winnerCrafts.sort((a, b) => a.timeSeconds - b.timeSeconds);
    loserCrafts.sort((a, b) => a.timeSeconds - b.timeSeconds);

    return {
      winnerCrafts,
      loserCrafts,
      hasWinnerCrafts: winnerCrafts.length > 0,
      hasLoserCrafts: loserCrafts.length > 0,
    };
  }, [game.craftEvents, game.players]);

  if (!craftOrder || (!craftOrder.hasWinnerCrafts && !craftOrder.hasLoserCrafts)) {
    return null;
  }

  return (
    <div className="mt-4 space-y-2">
      <div className="text-xs font-semibold text-amber-400 mb-2">Crafting Order</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {craftOrder.hasWinnerCrafts && (
          <div className="bg-green-500/10 border border-green-500/20 rounded p-2">
            <CraftOrderDisplay crafts={craftOrder.winnerCrafts} />
          </div>
        )}
        {craftOrder.hasLoserCrafts && (
          <div className="bg-red-500/10 border border-red-500/20 rounded p-2">
            <CraftOrderDisplay crafts={craftOrder.loserCrafts} />
          </div>
        )}
      </div>
    </div>
  );
}
