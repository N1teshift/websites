/**
 * Dynamic Column Mapper
 * Automatically detects and maps column types based on naming patterns
 */

import { ColumnMapping } from '../types/StudentDataTypes';
import Logger from '@websites/infrastructure/logging/logger';

export interface DynamicColumnInfo {
    columnName: string;
    baseType: 'EXT' | 'ND' | 'SD' | 'LNT' | 'KD' | 'D' | 'PD' | 'TVARK' | 'TAIS' | 'UNKNOWN';
    number?: number;
    subtype?: 'P' | 'MYP' | 'C' | 'C1' | 'C2' | 'K' | 'T';
    date?: string; // For PD columns with dates
    mapping: ColumnMapping[string];
}

/**
 * Detect column type and generate appropriate mapping
 */
export function detectColumnType(columnName: string): DynamicColumnInfo | null {
    const col = columnName.trim();
    
    // EXT pattern: EXT1, EXT2, ..., EXT99
    const extMatch = col.match(/^EXT(\d+)$/);
    if (extMatch) {
        const num = parseInt(extMatch[1]);
        return {
            columnName: col,
            baseType: 'EXT',
            number: num,
            mapping: {
                type: 'classwork',
                task_name: `EXT${num}: Exercise Progress`,
                description: `Exercise progress tracking ${num}`
            }
        };
    }
    
    // LNT pattern: LNT1, LNT2, ..., LNT99
    const lntMatch = col.match(/^LNT(\d+)$/);
    if (lntMatch) {
        const num = parseInt(lntMatch[1]);
        return {
            columnName: col,
            baseType: 'LNT',
            number: num,
            mapping: {
                type: 'participation',
                task_name: `LNT${num}: Board Participation`,
                description: `Board solving participation ${num}`
            }
        };
    }
    
    // ND complex pattern: NDX, NDX K, NDX T
    const ndMatch = col.match(/^ND(\d+)(\s+([KT]))?$/);
    if (ndMatch) {
        const num = parseInt(ndMatch[1]);
        const subtype = ndMatch[3] as 'K' | 'T' | undefined;
        
        if (subtype === 'K') {
            // Comment column
            return {
                columnName: col,
                baseType: 'ND',
                number: num,
                subtype: 'K',
                mapping: {
                    type: 'comment',
                    parent_column: `ND${num}`,
                    description: `Comment for homework ND${num}`
                }
            };
        } else if (subtype === 'T') {
            // Score column (for ND6+)
            return {
                columnName: col,
                baseType: 'ND',
                number: num,
                subtype: 'T',
                mapping: {
                    type: 'homework_score',
                    parent_column: `ND${num}`,
                    description: `Score for homework ND${num}`
                }
            };
        } else {
            // Main ND column (on-time tracking)
            return {
                columnName: col,
                baseType: 'ND',
                number: num,
                mapping: {
                    type: 'homework',
                    task_name: `ND${num}: Homework`,
                    description: `Homework ${num}`
                }
            };
        }
    }
    
    // SD pattern: SDX P, SDX MYP, SDX C, SDX C1, SDX C2
    const sdMatch = col.match(/^SD(\d+)(\s+(P|MYP|C1?|C2?))?$/);
    if (sdMatch) {
        const num = parseInt(sdMatch[1]);
        const subtype = sdMatch[3] as 'P' | 'MYP' | 'C' | 'C1' | 'C2' | undefined;
        
        if (subtype) {
            // Sub-score column
            let summativeSubtype: 'percentage' | 'myp' | 'cambridge' = 'percentage';
            if (subtype === 'MYP') {
                summativeSubtype = 'myp';
            } else if (subtype === 'C' || subtype === 'C1' || subtype === 'C2') {
                summativeSubtype = 'cambridge';
            }
            
            return {
                columnName: col,
                baseType: 'SD',
                number: num,
                subtype: subtype as 'P' | 'MYP' | 'C' | 'C1' | 'C2',
                mapping: {
                    type: 'summative',
                    task_name: `Test ${num}`,
                    description: `Test ${num} - ${subtype}`,
                    summative_subtype: summativeSubtype
                }
            };
        } else {
            // Main SD column (shouldn't exist in new format, but handle it)
            return {
                columnName: col,
                baseType: 'SD',
                number: num,
                mapping: {
                    type: 'summative',
                    task_name: `Test ${num}`,
                    description: `Test ${num}`
                }
            };
        }
    }
    
    // KD pattern: KDX, KDX P, KDX MYP, KDX C, KDX C1, KDX C2, KDX C3, KDX C4, etc.
    const kdMatch = col.match(/^KD(\d+)(\s+(P|MYP|C\d*))$/);
    if (kdMatch) {
        const num = parseInt(kdMatch[1]);
        const subtypeRaw = kdMatch[3];
        
        if (subtypeRaw) {
            let summativeSubtype: 'percentage' | 'myp' | 'cambridge' = 'percentage';
            let subtype: 'P' | 'MYP' | 'C' | 'C1' | 'C2' = 'P';
            
            if (subtypeRaw === 'MYP') {
                summativeSubtype = 'myp';
                subtype = 'MYP';
            } else if (subtypeRaw === 'P') {
                summativeSubtype = 'percentage';
                subtype = 'P';
            } else if (subtypeRaw.startsWith('C')) {
                summativeSubtype = 'cambridge';
                if (subtypeRaw === 'C1') subtype = 'C1';
                else if (subtypeRaw === 'C2') subtype = 'C2';
                else subtype = 'C';
            }
            
            return {
                columnName: col,
                baseType: 'KD',
                number: num,
                subtype: subtype,
                mapping: {
                    type: 'summative',
                    task_name: `KD${num}: Cambridge Unit ${num}`,
                    description: `Cambridge summative ${num} - ${subtypeRaw}`,
                    summative_subtype: summativeSubtype
                }
            };
        } else {
            return {
                columnName: col,
                baseType: 'KD',
                number: num,
                mapping: {
                    type: 'summative',
                    task_name: `KD${num}: Cambridge Unit ${num}`,
                    description: `Cambridge summative ${num}`
                }
            };
        }
    }
    
    // D pattern: D1, D2 (Diagnostic)
    const dMatch = col.match(/^D(\d+)$/);
    if (dMatch) {
        const num = parseInt(dMatch[1]);
        return {
            columnName: col,
            baseType: 'D',
            number: num,
            mapping: {
                type: 'diagnostic',
                task_name: `D${num}: Diagnostic`,
                description: `Diagnostic assessment ${num}`
            }
        };
    }
    
    // TVARK - Notebook organization tracking
    if (col === 'TVARK') {
        return {
            columnName: col,
            baseType: 'TVARK',
            mapping: {
                type: 'tracking',
                task_name: 'Notebook Organization',
                description: 'Notebook order tracking (1=organized, 0=disorganized)',
                tracking_attribute: 'notebook_organization'
            }
        };
    }
    
    // TAIS - Corrections tracking
    if (col === 'TAIS') {
        return {
            columnName: col,
            baseType: 'TAIS',
            mapping: {
                type: 'tracking',
                task_name: 'Corrections Practice',
                description: 'Corrections witnessed tracking (1=corrects, 0=does not correct)',
                tracking_attribute: 'reflective_practice'
            }
        };
    }
    
    // PD pattern: PDX_YYYY-MM-DD, PDX P_YYYY-MM-DD, PDX MYP_YYYY-MM-DD, PDX C_YYYY-MM-DD
    // Examples: PD3_2025-10-21, PD3 P_2025-10-21, PD3 MYP_2025-10-21, PD3 C_2025-10-21
    const pdMatch = col.match(/^PD(\d+)(\s+(P|MYP|C))?[_\s](\d{4}-\d{2}-\d{2})$/);
    if (pdMatch) {
        const num = parseInt(pdMatch[1]);
        const subtype = pdMatch[3] as 'P' | 'MYP' | 'C' | undefined;
        const date = pdMatch[4];
        
        if (subtype) {
            // Sub-score column (P, MYP, or C)
            return {
                columnName: col,
                baseType: 'PD',
                number: num,
                subtype: subtype as 'P' | 'MYP' | 'C',
                date: date,
                mapping: {
                    type: 'pd_assessment',
                    task_name: `PD${num}: Cambridge Practice`,
                    description: `PD${num} assessment on ${date} - ${subtype}`,
                    pd_subtype: subtype
                }
            };
        } else {
            // Main PD column (just the C score, for backwards compatibility)
            return {
                columnName: col,
                baseType: 'PD',
                number: num,
                date: date,
                mapping: {
                    type: 'pd_assessment',
                    task_name: `PD${num}: Cambridge Practice`,
                    description: `PD${num} assessment on ${date}`
                }
            };
        }
    }
    
    return null;
}

/**
 * Generate mappings for all columns in a sheet
 */
export function generateDynamicMappings(columnNames: string[]): Map<string, DynamicColumnInfo> {
    const mappings = new Map<string, DynamicColumnInfo>();
    
    for (const columnName of columnNames) {
        const info = detectColumnType(columnName);
        if (info) {
            mappings.set(columnName, info);
            Logger.debug('Detected column type', {
                column: columnName,
                baseType: info.baseType,
                type: info.mapping.type
            });
        } else {
            Logger.warn('Unknown column type', { columnName });
        }
    }
    
    Logger.info('Generated dynamic mappings', {
        total: columnNames.length,
        mapped: mappings.size,
        unmapped: columnNames.length - mappings.size
    });
    
    return mappings;
}

/**
 * Merge static and dynamic mappings
 */
export function mergeMappings(
    staticMappings: ColumnMapping,
    dynamicMappings: Map<string, DynamicColumnInfo>
): ColumnMapping {
    const merged: ColumnMapping = { ...staticMappings };
    
    for (const [columnName, info] of Array.from(dynamicMappings)) {
        // Only add if not already in static mappings
        if (!merged[columnName]) {
            merged[columnName] = info.mapping;
        }
    }
    
    return merged;
}




