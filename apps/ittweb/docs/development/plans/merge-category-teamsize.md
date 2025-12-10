# Plan: Merge `category` and `teamSize` into Single Field

## Problem Statement

Currently, the codebase uses two similar fields for representing team size/format:

- **`teamSize`**: Used for scheduled games (`"1v1" | "2v2" | "3v3" | "4v4" | "5v5" | "6v6" | "custom"`)
- **`category`**: Used for completed games (`"1v1" | "2v2" | "3v3" | "4v4" | "5v5" | "6v6" | "ffa" | string`)

This creates confusion and duplication. Both fields represent the same concept (game format/team size) but are used in different contexts.

## Goals

1. **Unify the field name**: Use a single field name across both scheduled and completed games
2. **Maintain backward compatibility**: Ensure existing data continues to work
3. **Simplify the codebase**: Remove duplicate logic and type definitions
4. **Support all use cases**: Handle "custom" team sizes and "ffa" formats

## Proposed Solution

### Unified Field: `category`

**Rationale**:

- `category` is already used for filtering/analytics across the codebase
- More flexible (supports any string, not just enum values)
- Already used in completed games which are the source of truth

### New Type Definition

```typescript
/**
 * Game category/format - unified for both scheduled and completed games
 * Standard formats: "1v1", "2v2", "3v3", "4v4", "5v5", "6v6", "ffa"
 * Custom formats: Any string (e.g., "2v2v2", "3v3v3v3", "custom-format")
 */
export type GameCategory = string;
```

### Migration Strategy

#### Phase 1: Add `category` to Scheduled Games (Non-Breaking)

1. **Update Types**
   - Add `category?: GameCategory` to `CreateScheduledGame`
   - Keep `teamSize` and `customTeamSize` for backward compatibility
   - Add migration logic to derive `category` from `teamSize` when reading

2. **Update Scheduled Game Creation**
   - When creating scheduled games, populate both `teamSize` (for backward compat) and `category`
   - Derive `category` from `teamSize`:
     - If `teamSize === "custom"` → use `customTeamSize` as `category`
     - Otherwise → use `teamSize` as `category`

3. **Update Display Components**
   - Update `GameLinkedArchiveEntry` to use `category` for scheduled games (with fallback to `teamSize`)
   - Update `ScheduledGameCard` to use `category` (with fallback to `teamSize`)

#### Phase 2: Update All References (Gradual)

1. **Update Forms**
   - `ScheduleGameForm`: Change to use `category` instead of `teamSize`
   - `EditGameForm`: Change to use `category` instead of `teamSize`
   - Remove `customTeamSize` field (use `category` directly for custom values)

2. **Update Services**
   - `scheduledGameService.create.server.ts`: Store `category` instead of `teamSize`
   - `scheduledGameService.update.server.ts`: Update `category` instead of `teamSize`
   - `gameService.utils.ts`: Always use `category` when reading

3. **Update API Endpoints**
   - `/api/games`: Accept `category` instead of `teamSize`
   - Update schemas to validate `category` instead of `teamSize`

#### Phase 3: Data Migration (One-Time)

1. **Migration Script**
   - Create script to migrate existing scheduled games:
     - For each scheduled game with `teamSize`:
       - If `teamSize === "custom"` → set `category = customTeamSize`
       - Otherwise → set `category = teamSize`

2. **Backfill Completed Games**
   - Ensure all completed games have `category` set (should already be the case)

#### Phase 4: Remove Old Fields (Breaking)

1. **Remove from Types**
   - Remove `teamSize` and `customTeamSize` from `Game` interface
   - Remove `TeamSize` type definition
   - Remove `customTeamSize` from all interfaces

2. **Remove from Database**
   - Optional: Create migration to remove `teamSize` and `customTeamSize` fields from Firestore
   - Or leave them for historical reference

3. **Update All References**
   - Remove all references to `teamSize` and `customTeamSize`
   - Update all forms, components, and services

## Implementation Details

### Type Changes

```typescript
// Before
export type TeamSize = "1v1" | "2v2" | "3v3" | "4v4" | "5v5" | "6v6" | "custom";
export type GameCategory = "1v1" | "2v2" | "3v3" | "4v4" | "5v5" | "6v6" | "ffa" | string;

// After
export type GameCategory = string; // Unified type
```

### Helper Functions

```typescript
/**
 * Derive category from teamSize (for backward compatibility)
 */
function deriveCategoryFromTeamSize(
  teamSize?: TeamSize,
  customTeamSize?: string
): GameCategory | undefined {
  if (!teamSize) return undefined;
  if (teamSize === "custom") return customTeamSize;
  return teamSize;
}

/**
 * Get category from game (with fallback to teamSize for backward compat)
 */
function getGameCategory(game: Game): GameCategory | undefined {
  return game.category || deriveCategoryFromTeamSize(game.teamSize, game.customTeamSize);
}
```

### Form Changes

```typescript
// Before
const [teamSize, setTeamSize] = useState<TeamSize>("1v1");
const [customTeamSize, setCustomTeamSize] = useState("");

// After
const [category, setCategory] = useState<GameCategory>("1v1");
// No separate customTeamSize field needed
```

### Display Changes

```typescript
// Before (scheduled games)
{
  game.teamSize === "custom" ? game.customTeamSize : game.teamSize;
}

// After (unified)
{
  game.category || deriveCategoryFromTeamSize(game.teamSize, game.customTeamSize);
}
```

## Testing Strategy

1. **Unit Tests**
   - Test category derivation from teamSize
   - Test backward compatibility helpers
   - Test form validation

2. **Integration Tests**
   - Test scheduled game creation with category
   - Test scheduled game update with category
   - Test display components with both old and new data

3. **Migration Tests**
   - Test migration script on sample data
   - Verify no data loss during migration

## Rollout Plan

1. **Week 1**: Phase 1 - Add category to scheduled games (non-breaking)
2. **Week 2**: Phase 2 - Update all references gradually
3. **Week 3**: Phase 3 - Run data migration
4. **Week 4**: Phase 4 - Remove old fields (after verification)

## Risks & Mitigation

### Risk: Breaking Changes

- **Mitigation**: Keep backward compatibility during Phases 1-3, only remove in Phase 4

### Risk: Data Loss

- **Mitigation**: Test migration script thoroughly, keep backups

### Risk: Inconsistent Data

- **Mitigation**: Use helper functions to normalize data access

## Benefits

1. **Simplified Codebase**: Single field to maintain instead of two
2. **Consistency**: Same field name across scheduled and completed games
3. **Flexibility**: Easier to add new formats without type changes
4. **Clarity**: Less confusion about which field to use

## Files to Update

### Types

- `apps/ittweb/src/features/modules/game-management/games/types/index.ts`

### Services

- `apps/ittweb/src/features/modules/game-management/scheduled-games/lib/scheduledGameService.create.server.ts`
- `apps/ittweb/src/features/modules/game-management/scheduled-games/lib/scheduledGameService.update.server.ts`
- `apps/ittweb/src/features/modules/game-management/games/lib/gameService.utils.ts`

### Components

- `apps/ittweb/src/features/modules/game-management/scheduled-games/components/ScheduleGameForm.tsx`
- `apps/ittweb/src/features/modules/game-management/scheduled-games/components/EditGameForm.tsx`
- `apps/ittweb/src/features/modules/game-management/scheduled-games/components/ScheduledGameCard.tsx`
- `apps/ittweb/src/features/modules/community/archives/display/components/GameLinkedArchiveEntry.tsx`

### API

- `apps/ittweb/src/pages/api/games/index.ts`
- `apps/ittweb/src/features/modules/game-management/games/lib/schemas.ts`

### Migration Script

- `apps/ittweb/scripts/migrations/migrate-teamsize-to-category.ts` (to be created)
