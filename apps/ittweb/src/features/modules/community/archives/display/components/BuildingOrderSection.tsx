import React, { useMemo } from "react";
import { BuildingOrderDisplay } from "@/features/modules/shared/components/BuildingOrderDisplay";
import {
  getFinishedBuildings,
  groupBuildingsByTeam,
} from "@/features/modules/shared/utils/buildingUtils";
import type { GameWithPlayers } from "@/features/modules/game-management/games/types";
import type { BuildingEvent } from "@/features/modules/game-management/lib/mechanics/replay/types";

interface BuildingOrderSectionProps {
  game: GameWithPlayers;
}

/**
 * Display building order grouped by winners and losers
 */
export function BuildingOrderSection({ game }: BuildingOrderSectionProps) {
  const buildingOrder = useMemo(() => {
    if (!game.buildingEvents || game.buildingEvents.length === 0) {
      return null;
    }

    // Filter to only FINISH events
    const finishedBuildings = getFinishedBuildings(game.buildingEvents as BuildingEvent[]);

    if (finishedBuildings.length === 0) {
      return null;
    }

    // Group by team
    const buildingsByTeam = groupBuildingsByTeam(finishedBuildings);

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

    // Separate buildings by winner/loser teams
    const winnerBuildings: BuildingEvent[] = [];
    const loserBuildings: BuildingEvent[] = [];

    for (const [team, buildings] of buildingsByTeam.entries()) {
      if (winnerTeams.has(team)) {
        winnerBuildings.push(...buildings);
      } else if (loserTeams.has(team)) {
        loserBuildings.push(...buildings);
      }
    }

    // Fallback: If we have buildings but couldn't match them to teams,
    // show all buildings in chronological order
    // This handles cases where players don't have team numbers set
    if (
      winnerBuildings.length === 0 &&
      loserBuildings.length === 0 &&
      finishedBuildings.length > 0
    ) {
      // If we can't match teams, show all buildings sorted by time
      // For 1v1 games, we'll show them all in the winners column as a fallback
      if (winners.length > 0) {
        winnerBuildings.push(...finishedBuildings);
      } else if (losers.length > 0) {
        loserBuildings.push(...finishedBuildings);
      } else {
        // No winners/losers, but show buildings anyway
        winnerBuildings.push(...finishedBuildings);
      }
    }

    // Sort by time within each group
    winnerBuildings.sort((a, b) => a.timeSeconds - b.timeSeconds);
    loserBuildings.sort((a, b) => a.timeSeconds - b.timeSeconds);

    return {
      winnerBuildings,
      loserBuildings,
      hasWinnerBuildings: winnerBuildings.length > 0,
      hasLoserBuildings: loserBuildings.length > 0,
    };
  }, [game.buildingEvents, game.players]);

  if (!buildingOrder || (!buildingOrder.hasWinnerBuildings && !buildingOrder.hasLoserBuildings)) {
    return null;
  }

  return (
    <div className="mt-4 space-y-2">
      <div className="text-xs font-semibold text-amber-400 mb-2">Building Order</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {buildingOrder.hasWinnerBuildings && (
          <div className="bg-green-500/10 border border-green-500/20 rounded p-2">
            <BuildingOrderDisplay buildings={buildingOrder.winnerBuildings} />
          </div>
        )}
        {buildingOrder.hasLoserBuildings && (
          <div>
            <BuildingOrderDisplay buildings={buildingOrder.loserBuildings} />
          </div>
        )}
      </div>
    </div>
  );
}
