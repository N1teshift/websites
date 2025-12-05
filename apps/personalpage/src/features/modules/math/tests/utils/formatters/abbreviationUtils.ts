/**
 * @file abbreviationUtils.ts
 * @description Provides utility functions for generating standardized abbreviations for mathematical terms,
 *              often used in generating concise test case IDs or descriptive labels.
 *              Supports context-specific abbreviations to ensure consistency and avoid clashes.
 */

/**
 * Defines the possible contexts in which a term might be abbreviated.
 * Using a context helps select the most appropriate abbreviation when a term
 * (like 'positive') might have different meanings or standard short forms.
 */
export type AbbreviationContext =
    | 'numberSet'       // e.g., integer, rational
    | 'rule'            // e.g., positive, nonzero, even
    | 'reprType'        // e.g., decimal, fraction
    | 'range'           // e.g., fullRange, negRange
    | 'collectionRule'  // e.g., increasing, decreasing
    | 'ineqType'        // e.g., less, geq
    | 'combType';       // e.g., addition, multiplication

/**
 * A comprehensive mapping of terms to their abbreviations, organized by context.
 * @internal
 */
const ABBREVIATIONS: Record<AbbreviationContext, Record<string, string>> = {
    numberSet: {
        'integer': 'int',
        'rational': 'rat',
        'irrational': 'irr',
        'real': 'real',
        'natural': 'nat',
    },
    rule: {
        'positive': 'pos',
        'negative': 'neg',
        'nonzero': 'nz',
        'even': 'even',
        'odd': 'odd',
        'square': 'sq',
        'cube': 'cube',
        'prime': 'prime',
        'unit': 'unit',
    },
    reprType: {
        'decimal': 'dec',
        'fraction': 'frac',
        'mixed': 'mix',
        'irrational': 'irr', // Note: Could clash with numberSet if context is omitted
        'logarithm': 'log',
    },
    range: {
        'fullRange': 'fullR',
        'negRange': 'negR',
        'posRange': 'posR',
    },
    collectionRule: {
        'increasing': 'incr',
        'decreasing': 'decr',
        'neq': 'neq',       // Not equal
    },
    ineqType: {
        'less': 'lt',
        'greater': 'gt',
        'leq': 'leq',
        'geq': 'geq',
    },
    combType: {
        'none': 'none',
        'addition': 'add',
        'subtraction': 'sub',
        'multiplication': 'mult',
        'division': 'div',
        'power': 'pow',
        'root_sq_div': 'rsqd',
    },
};

/**
 * A flat mapping of common terms to their general abbreviations.
 * Used as a secondary lookup if a context-specific abbreviation isn't found or if no context is provided.
 * Note potential ambiguities (e.g., 'irr' for irrational numberSet vs reprType) if used without context.
 * @internal
 */
const GENERAL_ABBREVIATIONS: Record<string, string> = {
  'decimal': 'dec',
  'fraction': 'frac',
  'mixed': 'mix',
  'positive': 'pos',
  'negative': 'neg',
  'nonzero': 'nz',
  'logarithm': 'log',
  'even': 'even',
  'odd': 'odd',
  'square': 'sq',
  'cube': 'cube',
  'prime': 'prime',
  'unit': 'unit',
  'integer': 'int',
  'rational': 'rat',
  'irrational': 'irr',
  'real': 'real',
  'natural': 'nat',
  // Add general abbreviations for other contexts if needed, e.g.:
  // 'increasing': 'incr',
  // 'less': 'lt',
  // 'addition': 'add',
};

/**
 * Retrieves a standardized abbreviation for a given term.
 *
 * It first attempts to find an abbreviation specific to the provided `context`.
 * If no context is given or no context-specific abbreviation is found, it checks the
 * `GENERAL_ABBREVIATIONS` map.
 * As a final fallback, if no predefined abbreviation is found, it returns the
 * first three letters of the original term.
 *
 * @param term The term to abbreviate (e.g., 'integer', 'positive', 'less'). Case-sensitive.
 * @param context An optional `AbbreviationContext` to specify the usage context of the term.
 * @returns The standardized abbreviation string, or the first 3 letters of the term as a fallback.
 *
 * @example
 * getAbbreviation('integer', 'numberSet'); // => 'int'
 * getAbbreviation('positive', 'rule');    // => 'pos'
 * getAbbreviation('less', 'ineqType');    // => 'lt'
 * getAbbreviation('increasing');          // Falls back to general or first 3 letters ('inc')
 * getAbbreviation('unknownTerm');         // => 'unk'
 */
export function getAbbreviation(term: string, context?: AbbreviationContext): string {
    // 1. Check context-specific abbreviations
    if (context && ABBREVIATIONS[context] && ABBREVIATIONS[context][term]) {
        return ABBREVIATIONS[context][term];
    }
    // 2. Check general abbreviations
    if (GENERAL_ABBREVIATIONS[term]) {
        return GENERAL_ABBREVIATIONS[term];
    }
    // 3. Fallback to first 3 letters
    return term.substring(0, 3);
} 



