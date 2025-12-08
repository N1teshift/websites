/**
 * @file Defines the abstract base class for test case ID builders.
 */

/**
 * Abstract base class for generating unique, descriptive, and human-readable ID strings
 * for test cases based on their configuration settings.
 *
 * Concrete implementations handle the specific logic and formatting for different
 * mathematical object types (e.g., Coefficient, Term, Equation).
 *
 * @template T The type of the settings object (e.g., `CoefficientSettings`, `TermSettings`)
 *             that the concrete builder will use to generate the ID.
 */
export abstract class IdBuilder<T> {
  /**
   * Abstract method to build the unique ID string.
   * Subclasses must implement this to generate an ID based on the specific properties
   * of the settings object `T` and an optional category.
   *
   * @param settings A partial settings object representing the configuration of the test case.
   * @param category An optional category string that might be incorporated into the ID.
   * @returns A formatted unique ID string for the test case.
   */
  abstract build(settings: Partial<T>, category?: string): string;

  /**
   * Helper method to join non-empty parts of an ID string with a separator.
   *
   * @param parts An array of potential ID components (strings or numbers).
   *              Null, undefined, and empty string parts will be filtered out.
   * @param separator The separator character to use between parts. Defaults to `_`.
   * @returns The joined ID string.
   * @protected
   */
  protected joinParts(
    parts: (string | number | undefined | null)[],
    separator: string = "_"
  ): string {
    // Filter out null, undefined, and empty strings before joining
    return parts
      .filter((part) => part !== undefined && part !== null && part !== "")
      .join(separator);
  }

  /**
   * Helper method to sanitize a string for safe use in IDs (e.g., filenames, URL slugs).
   * Replaces whitespace with underscores and removes most non-alphanumeric characters
   * (preserving underscores and hyphens).
   *
   * @param text The input string to sanitize.
   * @returns The sanitized string.
   * @protected
   */
  protected sanitizeForId(text: string): string {
    // Replace spaces with underscores, then remove invalid characters
    return text.replace(/\s+/g, "_").replace(/[^\w\d_-]/g, "");
  }

  /**
   * Helper method to format an array of items into a delimited string representation.
   * Example: `formatList([1, 2, 3])` might return `"[1,2,3]"`.
   *
   * @param items The array of items to format.
   * @param leftDelimiter The opening delimiter. Defaults to `[`.
   * @param rightDelimiter The closing delimiter. Defaults to `]`.
   * @param separator The separator between items. Defaults to `,`.
   * @returns A formatted string representation of the list, or an empty string if the input array is null or empty.
   * @protected
   */
  protected formatList(
    items: unknown[] | undefined | null,
    leftDelimiter: string = "[",
    rightDelimiter: string = "]",
    separator: string = "" // Default to no separator for tighter packing
  ): string {
    if (!items || items.length === 0) return "";
    // Join items, ensuring they are converted to strings
    const joinedItems = items.map((item) => String(item)).join(separator);
    return `${leftDelimiter}${joinedItems}${rightDelimiter}`;
  }
}
