import type Player from "w3gjs/dist/types/Player";
import type { CreateGame } from "@/features/modules/game-management/games/types";

export interface ParsedReplay {
  randomseed?: number;
  winningTeamId?: number;
  winnerTeamId?: number;
  duration?: number;
  gamename?: string;
  map?: {
    path?: string;
    file?: string;
  };
  creator?: string;
  players?: Player[];
  w3mmd?: unknown[];
}

export interface PlayerWithResult extends Player {
  result?: string;
  status?: string;
  won?: boolean;
}

/**
 * ITT-specific player stats from metadata payload
 */
export interface ITTPlayerStats {
  slotIndex: number;
  name: string;
  trollClass?: string;
  team?: number;
  result?: string; // WIN, LOSS, LEAVE, DRAW, etc.
  damageTroll: number;
  selfHealing: number;
  allyHealing: number;
  goldAcquired: number;
  meatEaten: number;
  killsElk: number;
  killsHawk: number;
  killsSnake: number;
  killsWolf: number;
  killsBear: number;
  killsPanther: number;
  items?: number[]; // Item IDs
  itemCharges?: number[]; // Item charges/stacks (parallel array to items, schema v6+)
}

/**
 * Building event from metadata payload (schema v7+)
 */
export interface BuildingEvent {
  team: number;
  timeSeconds: number;
  buildingId: number;
  status: "START" | "FINISH" | "CANCEL" | "DESTROY";
}

/**
 * Craft event from metadata payload (schema v8+)
 */
export interface CraftEvent {
  team: number;
  timeSeconds: number;
  itemId: number;
  status: "SUCCESS" | "FAIL";
}

/**
 * Parsed ITT metadata from W3MMD custom messages
 */
export interface ITTMetadata {
  version?: string;
  schema?: number;
  payload?: string;
  players: ITTPlayerStats[];
  buildingEvents?: BuildingEvent[]; // Building events (schema v7+)
  craftEvents?: CraftEvent[]; // Craft events (schema v8+)
}

export interface ReplayParserOptions {
  scheduledGameId?: number;
  fallbackDatetime?: string;
  // Category is always derived from replay by analyzing team composition
}

export interface ParsingSummary {
  success: boolean;
  gameData: {
    playersDetected: number;
    playersWithStats: number;
    playersWithITTStats: number;
    winners: number;
    losers: number;
    drawers: number;
  };
  metadata: {
    w3mmdFound: boolean;
    w3mmdActionCount: number;
    ittMetadataFound: boolean;
    ittSchemaVersion?: number;
    ittVersion?: string;
  };
  warnings: string[];
}

export interface ReplayParserResult {
  gameData: CreateGame;
  w3mmd: {
    raw: Array<{
      missionKey: string;
      key: string;
      value: number;
      filename: string;
    }>;
    lookup: Record<string, Record<string, number>>;
  };
  ittMetadata?: ITTMetadata;
  summary?: ParsingSummary;
}
