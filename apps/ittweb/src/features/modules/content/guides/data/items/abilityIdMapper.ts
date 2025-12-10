/**
 * Maps a raw ability ID from game data to an ability slug/id
 * Raw IDs might be in various formats (e.g., from replay data, item ability arrays)
 *
 * @param rawAbilityId - The raw ability ID from game data
 * @returns The ability slug/id if found, undefined otherwise
 */
export function getAbilitySlugFromRawId(rawAbilityId: string): string | undefined {
  if (!rawAbilityId) return undefined;

  // Normalize the raw ID (trim, lowercase for comparison)
  const normalized = rawAbilityId.trim().toLowerCase();

  // Direct match: if the raw ID is already a valid slug format
  // This is a placeholder - in practice, you might have a mapping table
  // For now, return the raw ID if it looks valid (contains alphanumeric/hyphens)
  if (/^[a-z0-9-:]+$/i.test(normalized)) {
    return rawAbilityId; // Return original to preserve casing
  }

  return undefined;
}

/**
 * Searches through abilities to find a match by ID or name
 *
 * @param rawAbilityId - The raw ability ID to search for
 * @param abilities - Array of ability objects with id and name
 * @returns The ability ID if found, undefined otherwise
 */
export function findAbilitySlugByRawId(
  rawAbilityId: string,
  abilities: Array<{ id: string; name: string }>
): string | undefined {
  if (!rawAbilityId || !abilities || abilities.length === 0) {
    return undefined;
  }

  const normalizedRaw = rawAbilityId.trim().toLowerCase();

  // Try exact ID match (case-insensitive)
  const exactMatch = abilities.find((ab) => ab.id.toLowerCase() === normalizedRaw);
  if (exactMatch) {
    return exactMatch.id;
  }

  // Try name match (case-insensitive, partial)
  const nameMatch = abilities.find(
    (ab) =>
      ab.name.toLowerCase().includes(normalizedRaw) || normalizedRaw.includes(ab.name.toLowerCase())
  );
  if (nameMatch) {
    return nameMatch.id;
  }

  // Try partial ID match (e.g., raw ID might be a substring)
  const partialMatch = abilities.find(
    (ab) =>
      ab.id.toLowerCase().includes(normalizedRaw) || normalizedRaw.includes(ab.id.toLowerCase())
  );
  if (partialMatch) {
    return partialMatch.id;
  }

  return undefined;
}
