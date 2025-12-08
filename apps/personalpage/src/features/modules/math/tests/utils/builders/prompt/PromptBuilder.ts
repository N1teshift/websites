/**
 * Abstract base class for all prompt builders
 *
 * Defines the common interface and structure that all prompt builders must implement.
 * Each concrete implementation will handle the specific formatting requirements
 * for different types of math objects.
 *
 * @template T - The settings type this prompt builder works with
 */
export abstract class PromptBuilder<T> {
  /**
   * Builds a formatted prompt string based on the provided settings
   *
   * @param settings - The settings to use for building the prompt
   * @param promptStart - Optional starting phrase for the prompt (defaults to "Give me a")
   * @returns A formatted prompt string
   */
  abstract build(settings: Partial<T>, promptStart?: string): string;

  /**
   * Helper method to get the appropriate indefinite article ("a" or "an")
   * based on the word that follows
   *
   * @param word - The word that follows the article
   * @returns "a" or "an" depending on the word
   */
  protected getIndefiniteArticle(word: string): string {
    // Simple check for vowel sounds
    const vowels = ["a", "e", "i", "o", "u"];
    return vowels.includes(word.toLowerCase()[0]) ? "an" : "a";
  }

  /**
   * Helper method to convert a value to plural form if count > 1
   *
   * @param word - The word to potentially pluralize
   * @param count - The count that determines if pluralization is needed
   * @returns The original word or its plural form
   */
  protected pluralize(word: string, count: number): string {
    return count > 1 ? `${word}s` : word;
  }

  /**
   * Helper method to format a list of items in a grammatically correct way
   *
   * @param items - Array of items to format
   * @returns Formatted string (e.g., "x, y, and z")
   */
  protected formatList(items: string[]): string {
    if (items.length === 0) return "";
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} and ${items[1]}`;

    const lastItem = items[items.length - 1];
    const otherItems = items.slice(0, -1).join(", ");
    return `${otherItems}, and ${lastItem}`;
  }
}
