import React from "react";
import Link from "next/link";
import { formatEloChange } from "@/features/modules/shared/utils";
import { AnimalKillsDisplay } from "@/features/modules/shared/components";
import { PlayerItems } from "@/features/modules/game-management/games/components";
import ClassIcon from "@/features/modules/content/guides/components/ClassIcon";
import { BASE_TROLL_CLASSES } from "@/features/modules/content/guides/data/units/classes";
import { DERIVED_CLASSES } from "@/features/modules/content/guides/data/units/derivedClasses";
import type { GameWithPlayers, GamePlayer } from "@/features/modules/game-management/games/types";

interface GamePlayersSectionProps {
  game: GameWithPlayers;
}

/**
 * Get total animal kills for a player
 */
function getTotalAnimalKills(player: GamePlayer): number {
  return (
    (player.killsElk || 0) +
    (player.killsHawk || 0) +
    (player.killsSnake || 0) +
    (player.killsWolf || 0) +
    (player.killsBear || 0) +
    (player.killsPanther || 0)
  );
}

/**
 * Check if player has any ITT stats
 */
function hasITTStats(player: GamePlayer): boolean {
  return (
    player.damageDealt !== undefined ||
    player.selfHealing !== undefined ||
    player.allyHealing !== undefined ||
    player.meatEaten !== undefined ||
    player.goldAcquired !== undefined ||
    player.killsElk !== undefined ||
    player.killsHawk !== undefined ||
    player.killsSnake !== undefined ||
    player.killsWolf !== undefined ||
    player.killsBear !== undefined ||
    player.killsPanther !== undefined
  );
}

/**
 * Format a number for display
 */
function formatStat(value: number | undefined): string {
  if (value === undefined || value === null) return "-";
  return value.toLocaleString();
}

/**
 * Player stat badge component
 */
function PlayerStatBadge({
  icon,
  value,
  label,
}: {
  icon: string;
  value: number | undefined;
  label: string;
}) {
  if (value === undefined || value === null || value === 0) return null;
  return (
    <div className="flex items-center gap-1 text-xs">
      <span>{icon}</span>
      <span className="text-amber-300">{formatStat(value)}</span>
      <span className="text-gray-500">{label}</span>
    </div>
  );
}

/**
 * Convert class name to slug and get class data (handles base classes, subclasses, and superclasses)
 */
function getClassDataFromName(
  className: string | undefined
): { slug: string; name: string; iconSrc?: string } | undefined {
  if (!className) return undefined;

  const normalized = className.toLowerCase().trim();

  // First try exact match by name in base classes
  const baseMatch = BASE_TROLL_CLASSES.find((c) => c.name.toLowerCase() === normalized);
  if (baseMatch) {
    return { slug: baseMatch.slug, name: baseMatch.name, iconSrc: baseMatch.iconSrc };
  }

  // Try matching by slug in base classes (in case it's already a slug)
  const baseSlugMatch = BASE_TROLL_CLASSES.find((c) => c.slug.toLowerCase() === normalized);
  if (baseSlugMatch) {
    return { slug: baseSlugMatch.slug, name: baseSlugMatch.name, iconSrc: baseSlugMatch.iconSrc };
  }

  // Try exact match by name in derived classes
  const derivedMatch = DERIVED_CLASSES.find((c) => c.name.toLowerCase() === normalized);
  if (derivedMatch) {
    return { slug: derivedMatch.slug, name: derivedMatch.name, iconSrc: derivedMatch.iconSrc };
  }

  // Try matching by slug in derived classes
  const derivedSlugMatch = DERIVED_CLASSES.find((c) => c.slug.toLowerCase() === normalized);
  if (derivedSlugMatch) {
    return {
      slug: derivedSlugMatch.slug,
      name: derivedSlugMatch.name,
      iconSrc: derivedSlugMatch.iconSrc,
    };
  }

  // Try partial match (e.g., "Gurubashi Warrior" might match "gurubashi-warrior")
  const normalizedWithHyphens = normalized.replace(/\s+/g, "-");
  const partialBaseMatch = BASE_TROLL_CLASSES.find(
    (c) => c.slug.toLowerCase() === normalizedWithHyphens
  );
  if (partialBaseMatch) {
    return {
      slug: partialBaseMatch.slug,
      name: partialBaseMatch.name,
      iconSrc: partialBaseMatch.iconSrc,
    };
  }

  const partialDerivedMatch = DERIVED_CLASSES.find(
    (c) => c.slug.toLowerCase() === normalizedWithHyphens
  );
  if (partialDerivedMatch) {
    return {
      slug: partialDerivedMatch.slug,
      name: partialDerivedMatch.name,
      iconSrc: partialDerivedMatch.iconSrc,
    };
  }

  // Handle shapeshifter forms (these are transformations, not actual classes)
  const shapeshifterForms: Record<string, { slug: string; name: string; iconSrc: string }> = {
    "tiger form": { slug: "tiger-form", name: "Tiger Form", iconSrc: "/icons/itt/BTNTiger.png" },
    "panther form": {
      slug: "panther-form",
      name: "Panther Form",
      iconSrc: "/icons/itt/BTNPanther.png",
    },
    "bear form": { slug: "bear-form", name: "Bear Form", iconSrc: "/icons/itt/btngrizzlybear.png" },
    "wolf form": { slug: "wolf-form", name: "Wolf Form", iconSrc: "/icons/itt/btndirewolf.png" },
    "dire wolf": { slug: "dire-wolf", name: "Dire Wolf", iconSrc: "/icons/itt/btndirewolf.png" },
    "dire bear": { slug: "dire-bear", name: "Dire Bear", iconSrc: "/icons/itt/btngrizzlybear.png" },
  };

  const formMatch = shapeshifterForms[normalized];
  if (formMatch) {
    return formMatch;
  }

  return undefined;
}

/**
 * Player card with detailed stats
 */
function PlayerCard({ player, isWinner }: { player: GamePlayer; isWinner: boolean }) {
  const hasStats = hasITTStats(player);
  const totalKills = getTotalAnimalKills(player);
  const classData = getClassDataFromName(player.class);

  return (
    <div
      className={`p-2 rounded border ${isWinner ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"}`}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          {classData && (
            <ClassIcon
              slug={classData.slug}
              name={classData.name}
              size={40}
              className="flex-shrink-0"
            />
          )}
          <Link
            href={`/players/${encodeURIComponent(player.name)}`}
            onClick={(e) => e.stopPropagation()}
            className={`text-sm font-medium hover:underline ${isWinner ? "text-green-300" : "text-red-300"}`}
          >
            {player.name}
          </Link>
        </div>
        {player.elochange !== undefined && (
          <span className={`text-xs font-semibold ${isWinner ? "text-green-400" : "text-red-400"}`}>
            {formatEloChange(player.elochange)}
          </span>
        )}
      </div>

      {(hasStats || player.items !== undefined) && (
        <div className="mt-2 pt-2 border-t border-amber-500/10 space-y-1">
          {hasStats && (
            <>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                <PlayerStatBadge icon="🗡️" value={player.damageDealt} label="DMG" />
                <PlayerStatBadge icon="💚" value={player.selfHealing} label="Heal" />
                <PlayerStatBadge icon="💙" value={player.allyHealing} label="Ally" />
                <PlayerStatBadge icon="🥩" value={player.meatEaten} label="Meat" />
                <PlayerStatBadge icon="💰" value={player.goldAcquired} label="Gold" />
              </div>

              {/* Animal kills breakdown */}
              {totalKills > 0 && (
                <div className="mt-1.5">
                  <AnimalKillsDisplay
                    kills={{
                      elk: player.killsElk,
                      hawk: player.killsHawk,
                      snake: player.killsSnake,
                      wolf: player.killsWolf,
                      bear: player.killsBear,
                      panther: player.killsPanther,
                    }}
                    compact={true}
                    showLabels={false}
                  />
                </div>
              )}
            </>
          )}

          {/* Player items - show even if empty (with empty slots) */}
          {player.items !== undefined && (
            <div className="mt-1.5">
              <PlayerItems items={player.items} showEmptySlots={true} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function GamePlayersSection({ game }: GamePlayersSectionProps) {
  if (!game.players || game.players.length === 0) {
    return null;
  }

  const winners = game.players.filter((p) => p.flag === "winner");
  const losers = game.players.filter((p) => p.flag === "loser");
  const drawers = game.players.filter((p) => p.flag === "drawer");

  return (
    <div className="mt-4 space-y-2">
      {/* Winners and Losers side by side for compact display */}
      {(winners.length > 0 || losers.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {winners.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-green-400 mb-1.5">Winners</div>
              <div className="space-y-1.5">
                {winners.map((player) => (
                  <PlayerCard key={player.id} player={player} isWinner={true} />
                ))}
              </div>
            </div>
          )}
          {losers.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-red-400 mb-1.5">Losers</div>
              <div className="space-y-1.5">
                {losers.map((player) => (
                  <PlayerCard key={player.id} player={player} isWinner={false} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {drawers.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-yellow-400 mb-1.5">Draw</div>
          <div className="space-y-1.5">
            {drawers.map((player) => (
              <PlayerCard key={player.id} player={player} isWinner={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
