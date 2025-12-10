/**
 * Remove battle tag from player name
 * Converts "Scatman33#2333" to "Scatman33"
 *
 * @param playerName - The player name that may contain a battle tag
 * @returns The player name without the battle tag
 */
export function removeBattleTag(playerName: string): string {
  if (!playerName) return playerName;

  // Remove everything from # onwards (battle tag)
  const hashIndex = playerName.indexOf("#");
  if (hashIndex === -1) {
    return playerName; // No battle tag found
  }

  return playerName.substring(0, hashIndex);
}
