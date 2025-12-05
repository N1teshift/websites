/**
 * Utility functions for determining cell background colors based on score values
 * 
 * COLOR SCHEMES:
 * 
 * 1. Binary/Fractional (0-1 scale):
 *    - 1 = light green
 *    - 0.5 = light yellow
 *    - 0 = light red
 *    Used for: Cambridge scores (C columns), Diagnostic (D columns), Homework ND columns
 * 
 * 2. 10/10 System:
 *    - 10,9,8 = light green
 *    - 7,6,5 = light yellow
 *    - 4,3,2,1 = light red
 *    Used for: KD1, KD2, ND3, P1 (sav_darb), KD1P, KD2P, and other 10-point assessments
 * 
 * 3. MYP 8-point System:
 *    - 8,7,6 = light green
 *    - 5,4 = light yellow
 *    - 3,2,1,0 = light red
 *    Used for: Any column with "MYP" (KD1MYP, SD1MYP, SD2MYP, etc.)
 * 
 * 4. Custom Schemes:
 *    - SD1P: 0,1,2,3 red | 4,5,6 yellow | 7,8 green
 *    - SD2P: 0,1,2 red | 3,4 yellow | 5,6 green
 *    - SD3P: 0,1,2,3,4 red | 5,6 yellow | 7-18 green
 *    - SD4P: 0,1,2,3,4 red | 5-10 yellow | 11-16 green
 *    - SD5P: 0,1,2,3 red | 4,5,6 yellow | 7,8 green (same as SD1P)
 *    - SD6P: 0,1,2,3,4,5 red | 6,7,8,9 yellow | 10,11 green
 */

export type CellColorClass = '' | 'bg-green-100' | 'bg-yellow-100' | 'bg-red-100';

// Binary coloring for homework ND columns (ND1, ND2, ND4, ND5, ND6)
export function getCellColorForBinaryND(value: string): CellColorClass {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '';
    
    if (numValue === 1 || value.trim() === '1') {
        return 'bg-green-100';
    } else if (numValue === 0 || value.trim() === '0') {
        return 'bg-red-100';
    }
    return '';
}

// Binary coloring for diagnostic assessments (D1, D2, etc.)
export function getCellColorForDiagnostic(value: string): CellColorClass {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '';
    
    if (numValue === 1 || value.trim() === '1') {
        return 'bg-green-100';
    } else if (numValue === 0 || value.trim() === '0') {
        return 'bg-red-100';
    }
    return '';
}

// Binary/Fractional coloring for Cambridge scores (SD1C, SD2C, SD1C1, SD1C2, etc.)
export function getCellColorForCambridgeSD(value: string): CellColorClass {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '';
    
    if (numValue === 1) return 'bg-green-100';
    if (numValue === 0.5) return 'bg-yellow-100';
    if (numValue === 0) return 'bg-red-100';
    return '';
}

// MYP 8-point system for MYP columns (KD1MYP, SD1MYP, SD2MYP, SD3MYP, etc.)
export function getCellColorForMYPSD(value: string): CellColorClass {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '';
    
    // MYP 8-point system: 8,7,6 = green | 5,4 = yellow | 3,2,1,0 = red
    if (numValue >= 6 && numValue <= 8) return 'bg-green-100';
    if (numValue >= 4 && numValue < 6) return 'bg-yellow-100';
    if (numValue >= 0 && numValue < 4) return 'bg-red-100';
    return '';
}

// Custom coloring for SD1P: 0,1,2,3 red | 4,5,6 yellow | 7,8 green
export function getCellColorForSD1P(value: string): CellColorClass {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '';
    
    if (numValue >= 7 && numValue <= 8) return 'bg-green-100';
    if (numValue >= 4 && numValue <= 6) return 'bg-yellow-100';
    if (numValue >= 0 && numValue <= 3) return 'bg-red-100';
    return '';
}

// Custom coloring for SD2P: 0,1,2 red | 3,4 yellow | 5,6 green
export function getCellColorForSD2P(value: string): CellColorClass {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '';
    
    if (numValue >= 5 && numValue <= 6) return 'bg-green-100';
    if (numValue >= 3 && numValue <= 4) return 'bg-yellow-100';
    if (numValue >= 0 && numValue <= 2) return 'bg-red-100';
    return '';
}

// Custom coloring for SD3P: 0,1,2,3,4 red | 5,6 yellow | 7,8,9,...,18 green
export function getCellColorForSD3P(value: string): CellColorClass {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '';
    
    if (numValue >= 7 && numValue <= 18) return 'bg-green-100';
    if (numValue >= 5 && numValue <= 6) return 'bg-yellow-100';
    if (numValue >= 0 && numValue <= 4) return 'bg-red-100';
    return '';
}

// Custom coloring for SD4P: 0,1,2,3,4 red | 5,6,7,8,9,10 yellow | 11,12,13,14,15,16 green
export function getCellColorForSD4P(value: string): CellColorClass {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '';
    
    if (numValue >= 11 && numValue <= 16) return 'bg-green-100';
    if (numValue >= 5 && numValue <= 10) return 'bg-yellow-100';
    if (numValue >= 0 && numValue <= 4) return 'bg-red-100';
    return '';
}

// Custom coloring for SD5P: 0,1,2,3 red | 4,5,6 yellow | 7,8 green (same as SD1P)
export function getCellColorForSD5P(value: string): CellColorClass {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '';
    
    if (numValue >= 7 && numValue <= 8) return 'bg-green-100';
    if (numValue >= 4 && numValue <= 6) return 'bg-yellow-100';
    if (numValue >= 0 && numValue <= 3) return 'bg-red-100';
    return '';
}

// Custom coloring for SD6P: 0,1,2,3,4,5 red | 6,7,8,9 yellow | 10,11 green
export function getCellColorForSD6P(value: string): CellColorClass {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '';
    
    if (numValue >= 10 && numValue <= 11) return 'bg-green-100';
    if (numValue >= 6 && numValue <= 9) return 'bg-yellow-100';
    if (numValue >= 0 && numValue <= 5) return 'bg-red-100';
    return '';
}

// 10/10 system for general assessments (KD1, KD2, ND3, P1, etc.)
export function getCellColorForScoreBased(value: string): CellColorClass {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '';
    
    // 10/10 system: 10,9,8 = green | 7,6,5 = yellow | 4,3,2,1 = red
    if (numValue >= 8 && numValue <= 10) return 'bg-green-100';
    if (numValue >= 5 && numValue < 8) return 'bg-yellow-100';
    if (numValue >= 1 && numValue < 5) return 'bg-red-100';
    return '';
}

export interface ColumnStyleRules {
    binaryND: string[];
    scoreBased: string[];
    cambridgeSD: string[];
    mypSD: string[];
}

export const DEFAULT_COLUMN_STYLE_RULES: ColumnStyleRules = {
    binaryND: ['ND1', 'ND2', 'ND4', 'ND5', 'ND6'],
    scoreBased: ['KD1', 'KD2', 'ND3', 'KD1P', 'KD2P'],
    cambridgeSD: ['SD1C', 'SD2C', 'SD3C', 'SD1C1', 'SD1C2', 'SD2C1', 'SD2C2', 'SD3C1', 'SD3C2'],
    mypSD: ['SD1MYP', 'SD2MYP', 'SD3MYP']
};

export function getCellColorClass(
    columnLabel: string,
    assessmentId: string,
    displayValue: string,
    rules: ColumnStyleRules = DEFAULT_COLUMN_STYLE_RULES
): CellColorClass {
    if (!displayValue || displayValue === '' || displayValue === '-') {
        return '';
    }

    // Check diagnostic columns (D1, D2, etc.)
    const isDiagnostic = columnLabel.match(/^D\d+$/i) !== null || 
                         assessmentId.toLowerCase().includes('diagnostic');
    if (isDiagnostic) {
        return getCellColorForDiagnostic(displayValue);
    }

    // Check binary ND columns
    const isBinaryND = rules.binaryND.includes(columnLabel) || 
                       rules.binaryND.some(nd => assessmentId.toUpperCase().includes(nd));
    if (isBinaryND) {
        return getCellColorForBinaryND(displayValue);
    }

    // Check Cambridge SD columns
    const isCambridgeSD = rules.cambridgeSD.includes(columnLabel) ||
                          (columnLabel.match(/^SD\d+C\d?$/) !== null);
    if (isCambridgeSD) {
        return getCellColorForCambridgeSD(displayValue);
    }

    // Check MYP columns (any column with MYP in the label)
    // This includes: KD1MYP, SD1MYP, SD2MYP, SD3MYP, etc.
    const isMYPSD = columnLabel.toUpperCase().includes('MYP') ||
                    rules.mypSD.includes(columnLabel);
    if (isMYPSD) {
        return getCellColorForMYPSD(displayValue);
    }

    // Check specific SD percentage columns (custom coloring)
    if (columnLabel === 'SD1P') {
        return getCellColorForSD1P(displayValue);
    }
    if (columnLabel === 'SD2P') {
        return getCellColorForSD2P(displayValue);
    }
    if (columnLabel === 'SD3P') {
        return getCellColorForSD3P(displayValue);
    }
    if (columnLabel === 'SD4P') {
        return getCellColorForSD4P(displayValue);
    }
    if (columnLabel === 'SD5P') {
        return getCellColorForSD5P(displayValue);
    }
    if (columnLabel === 'SD6P') {
        return getCellColorForSD6P(displayValue);
    }

    // Check score-based columns (10/10 system)
    // This includes: KD1, KD2, ND3, P1 (sav_darb), KD1P, KD2P, etc.
    const isScoreBased = columnLabel === 'P1' ||
                         rules.scoreBased.some(col => columnLabel === col || columnLabel.startsWith(col)) ||
                         assessmentId.toUpperCase().includes('ND3') ||
                         assessmentId.toUpperCase().includes('KD1') ||
                         assessmentId.toUpperCase().includes('KD2') ||
                         assessmentId === 'p1';
    if (isScoreBased) {
        return getCellColorForScoreBased(displayValue);
    }

    return '';
}




