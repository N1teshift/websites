/**
 * Abstract base class for all name builders
 * 
 * Defines the common interface and structure that all name builders must implement.
 * Each concrete implementation will handle the specific formatting requirements
 * for generating names of different types of math objects.
 * 
 * @template T - The settings type this name builder works with
 */
export abstract class NameBuilder<T> {
    /**
     * Builds a formatted name string based on the provided settings
     * 
     * @param settings - The settings to use for building the name
     * @returns A formatted name string
     */
    abstract build(settings: Partial<T>): string;
    
    /**
     * Helper method to join parts of a name with proper spacing
     * 
     * @param parts - Array of name parts to join
     * @returns Joined name string
     */
    protected joinParts(parts: string[]): string {
        // Filter out empty parts and join with spaces
        return parts.filter(part => !!part).join(' ');
    }
    
    /**
     * Helper method to format a list as a string with given delimiters
     * 
     * @param items - Array of items to format
     * @param leftDelimiter - Opening delimiter (default: '[')
     * @param rightDelimiter - Closing delimiter (default: ']')
     * @param separator - Item separator (default: ', ')
     * @returns Formatted string of items with delimiters
     */
    protected formatList(
        items: unknown[],
        leftDelimiter: string = '[',
        rightDelimiter: string = ']',
        separator: string = ', '
    ): string {
        if (!items || items.length === 0) return '';
        return `${leftDelimiter}${items.join(separator)}${rightDelimiter}`;
    }
} 



