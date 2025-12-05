/**
 * Import dataJ.xlsx (Teacher J - English) - Dynamic column detection
 * Detects column positions dynamically per sheet to handle column shifts
 */

import ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
import { 
    StudentData, 
    ProgressReportData,
    Assessment
} from '../src/features/modules/edtech/progressReport/types/ProgressReportTypes';
import Logger from '../src/features/infrastructure/logging/logger';

interface SheetColumnMap {
    // Diagnostic tests
    d1_p1?: number; d1_p2?: number; d1_p3?: number; d1_total?: number; d1_percent?: number;
    d2_p1?: number; d2_p2?: number; d2_p3?: number; d2_total?: number; d2_percent?: number;
    d3_p1?: number; d3_p2?: number; d3_p3?: number; d3_total?: number; d3_percent?: number;
    
    // Unit tests - will be detected dynamically
    [key: string]: number | undefined;
}

function detectColumnPositions(worksheet: ExcelJS.Worksheet): SheetColumnMap {
    const row1 = worksheet.getRow(1);
    const row2 = worksheet.getRow(2);
    const colMap: SheetColumnMap = {};
    
    // Helper to get cell value as string
    const getCellVal = (cell: ExcelJS.Cell): string => {
        if (cell.value === null || cell.value === undefined) return '';
        if (typeof cell.value === 'object') {
            if ('text' in cell.value) return String(cell.value.text).trim();
            if ('result' in cell.value) return String(cell.value.result).trim();
            return '';
        }
        return String(cell.value).trim();
    };
    
    // Find unit test sections by scanning row1 for "UNIT X" or "Unit X TEST" markers
    const unitRanges: { unitNum: number; startCol: number; endCol: number }[] = [];
    let currentUnit: { unitNum: number; startCol: number } | null = null;
    
    for (let col = 1; col <= 120; col++) {
        const section = getCellVal(row1.getCell(col)).toLowerCase();
        
        // Check if this is a unit marker
        const unitMatch = section.match(/unit\s*(\d+)/i);
        if (unitMatch) {
            const unitNum = parseInt(unitMatch[1]);
            
            // If we have a current unit, close it
            if (currentUnit && currentUnit.unitNum !== unitNum) {
                unitRanges.push({ ...currentUnit, endCol: col - 1 });
            }
            
            // Start a new unit if we don't have one or it's different
            if (!currentUnit || currentUnit.unitNum !== unitNum) {
                currentUnit = { unitNum, startCol: col };
            }
        }
    }
    
    // Close the last unit
    if (currentUnit) {
        unitRanges.push({ ...currentUnit, endCol: 120 });
    }
    
    // Now map columns within each unit range
    for (const range of unitRanges) {
        const prefix = `t${range.unitNum}_`;
        let foundPercent = false;
        
        for (let col = range.startCol; col <= range.endCol && col <= 120; col++) {
            const header = getCellVal(row2.getCell(col)).toLowerCase();
            
            if (!header) continue;
            
            if (header.includes('listen') && (header.includes('1') || header.includes('and 2'))) {
                if (!colMap[`${prefix}lis1`]) colMap[`${prefix}lis1`] = col;
            } else if (header.includes('listen') && header.includes('2')) {
                colMap[`${prefix}lis2`] = col;
            } else if (header.includes('listening') && !header.includes('1') && !header.includes('2')) {
                if (!colMap[`${prefix}lis1`]) colMap[`${prefix}lis1`] = col;
            } else if (header.includes('list 1')) {
                colMap[`${prefix}lis1`] = col;
            } else if (header.includes('list 2')) {
                colMap[`${prefix}lis2`] = col;
            } else if (header.includes('read')) {
                colMap[`${prefix}read`] = col;
            } else if ((header.includes('voc') && header.includes('1')) || (header.includes('voc') && header.includes('and 2'))) {
                if (!colMap[`${prefix}voc1`]) colMap[`${prefix}voc1`] = col;
            } else if (header.includes('voc') && header.includes('2')) {
                colMap[`${prefix}voc2`] = col;
            } else if (header.includes('voc') && !header.includes('1') && !header.includes('2')) {
                if (!colMap[`${prefix}voc1`]) colMap[`${prefix}voc1`] = col;
            } else if ((header.includes('gr') || header.includes('grammar')) && header.includes('1')) {
                colMap[`${prefix}gr1`] = col;
            } else if ((header.includes('gr') || header.includes('grammar')) && header.includes('2')) {
                colMap[`${prefix}gr2`] = col;
            } else if ((header.includes('gr') || header.includes('grammar')) && header.includes('3')) {
                colMap[`${prefix}gr3`] = col;
            } else if ((header.includes('gr') || header.includes('grammar')) && !header.includes('1') && !header.includes('2') && !header.includes('3')) {
                if (!colMap[`${prefix}gr1`]) colMap[`${prefix}gr1`] = col;
            } else if (header.includes('total')) {
                colMap[`${prefix}total`] = col;
            } else if (header === '%' && !foundPercent) {
                colMap[`${prefix}percent`] = col;
                foundPercent = true;
            }
        }
    }
    
    // Diagnostic tests - scan for "Diagnostic TEST" in row1
    let inDiag1 = false, inDiag2 = false, inDiag3 = false;
    let foundD1Percent = false, foundD2Percent = false, foundD3Percent = false;
    
    for (let col = 1; col <= 120; col++) {
        const section = getCellVal(row1.getCell(col)).toLowerCase();
        const header = getCellVal(row2.getCell(col)).toLowerCase();
        
        // Track which diagnostic section we're in
        if (section.includes('diagnostic test 1')) {
            inDiag1 = true; inDiag2 = false; inDiag3 = false;
            foundD1Percent = false;
        } else if (section.includes('diagnostic test 2')) {
            inDiag1 = false; inDiag2 = true; inDiag3 = false;
            foundD2Percent = false;
        } else if (section.includes('diagnostic test 3')) {
            inDiag1 = false; inDiag2 = false; inDiag3 = true;
            foundD3Percent = false;
        }
        
        // Map diagnostic columns
        if (inDiag1) {
            if ((header.includes('reading') || header.includes('1 paper')) && !colMap.d1_p1) colMap.d1_p1 = col;
            else if ((header.includes('listening') || header.includes('2paper')) && !colMap.d1_p2) colMap.d1_p2 = col;
            else if ((header.includes('writing') || header.includes('3 paper')) && !colMap.d1_p3) colMap.d1_p3 = col;
            else if (header.includes('total') && !colMap.d1_total) colMap.d1_total = col;
            else if (header === '%' && !foundD1Percent) { colMap.d1_percent = col; foundD1Percent = true; }
        } else if (inDiag2) {
            if ((header.includes('reading') || header.includes('1 paper')) && !colMap.d2_p1) colMap.d2_p1 = col;
            else if ((header.includes('listening') || header.includes('2paper')) && !colMap.d2_p2) colMap.d2_p2 = col;
            else if ((header.includes('writing') || header.includes('3 paper')) && !colMap.d2_p3) colMap.d2_p3 = col;
            else if (header.includes('total') && !colMap.d2_total) colMap.d2_total = col;
            else if (header === '%' && !foundD2Percent) { colMap.d2_percent = col; foundD2Percent = true; }
        } else if (inDiag3) {
            if ((header.includes('reading') || header.includes('1 paper')) && !colMap.d3_p1) colMap.d3_p1 = col;
            else if ((header.includes('listening') || header.includes('2paper')) && !colMap.d3_p2) colMap.d3_p2 = col;
            else if ((header.includes('writing') || header.includes('3 paper')) && !colMap.d3_p3) colMap.d3_p3 = col;
            else if (header.includes('total') && !colMap.d3_total) colMap.d3_total = col;
            else if (header === '%' && !foundD3Percent) { colMap.d3_percent = col; foundD3Percent = true; }
        }
    }
    
    return colMap;
}

async function importDataJ(filePath: string, outputPath: string): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    Logger.info('Starting dataJ.xlsx import (v2 - dynamic columns)');
    console.log('='.repeat(80));
    console.log('IMPORTING: dataJ.xlsx (Teacher J - English) - Dynamic Column Detection');
    console.log('='.repeat(80));
    
    const allStudents: StudentData[] = [];
    let studentIdCounter = 1;
    
    // Process each sheet (class)
    workbook.eachSheet((worksheet) => {
        const className = worksheet.name.trim();
        Logger.info(`Processing sheet: ${className}`);
        console.log(`\nProcessing Sheet: "${className}"`);
        console.log('-'.repeat(80));
        
        // Detect column positions for this sheet
        const colMap = detectColumnPositions(worksheet);
        console.log(`Detected columns for ${className}:`, Object.keys(colMap).length, 'columns');
        
        // Extract grade from class name
        const gradeMatch = className.match(/^(\d+)\s+/);
        const grade = gradeMatch ? parseInt(gradeMatch[1]) : 3;
        
        let studentsProcessed = 0;
        
        // Process each student row (starting from row 3)
        for (let rowNum = 3; rowNum <= worksheet.rowCount; rowNum++) {
            const row = worksheet.getRow(rowNum);
            
            // Get student name from column 2
            const nameFull = getCellValue(row.getCell(2));
            
            if (!nameFull || nameFull === '') {
                continue;
            }
            
            const nameParts = String(nameFull).trim().split(/\s+/);
            const firstName = nameParts[0];
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
            
            const studentId = `teacher_j_${String(studentIdCounter).padStart(4, '0')}`;
            studentIdCounter++;
            
            const assessments: Assessment[] = [];
            const currentDate = new Date().toISOString();
            
            // Process diagnostic tests
            for (let dNum = 1; dNum <= 3; dNum++) {
                const assessment = extractDiagnostic(row, dNum, colMap, currentDate);
                if (assessment) assessments.push(assessment);
            }
            
            // Process unit tests
            for (let tNum = 1; tNum <= 7; tNum++) {
                const assessment = extractUnitTest(row, tNum, colMap, currentDate);
                if (assessment) assessments.push(assessment);
            }
            
            const student: StudentData = {
                id: studentId,
                first_name: firstName,
                last_name: lastName,
                class_name: className,
                academic: {
                    year: '2024-2025',
                    grade: grade,
                    class_id: className.toLowerCase().replace(/\s+/g, '_'),
                    enrolled_date: null
                },
                assessments: assessments,
                created: currentDate
            };
            
            allStudents.push(student);
            studentsProcessed++;
        }
        
        Logger.info(`Processed ${studentsProcessed} students from ${className}`);
        console.log(`✓ Processed ${studentsProcessed} students from "${className}"`);
    });
    
    const outputData: ProgressReportData = {
        metadata: {
            exported_at: new Date().toISOString(),
            schema_version: '5.0',
            total_students: allStudents.length,
            export_version: 'teacher_j_v2',
            teacher_type: 'J',
            teacher_name: 'Teacher J (English)'
        },
        students: allStudents
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
    
    Logger.info('Import complete', { 
        totalStudents: allStudents.length,
        outputFile: outputPath 
    });
    console.log('\n' + '='.repeat(80));
    console.log('IMPORT COMPLETE');
    console.log('='.repeat(80));
    console.log(`Total students imported: ${allStudents.length}`);
    console.log(`Output file: ${outputPath}`);
    console.log('='.repeat(80));
}

function extractDiagnostic(
    row: ExcelJS.Row,
    testNum: number,
    colMap: SheetColumnMap,
    currentDate: string
): Assessment | null {
    const p1Col = colMap[`d${testNum}_p1`];
    const p2Col = colMap[`d${testNum}_p2`];
    const p3Col = colMap[`d${testNum}_p3`];
    const totalCol = colMap[`d${testNum}_total`];
    const percentCol = colMap[`d${testNum}_percent`];
    
    if (!p1Col || !p2Col || !p3Col) return null;
    
    const p1Score = getNumericValue(row.getCell(p1Col));
    const p2Score = getNumericValue(row.getCell(p2Col));
    const p3Score = getNumericValue(row.getCell(p3Col));
    const total = totalCol ? getNumericValue(row.getCell(totalCol)) : null;
    const percent = percentCol ? getNumericValue(row.getCell(percentCol)) : null;
    
    // Max scores for diagnostic tests
    const p1Max = 34, p2Max = 17, p3Max = 20;
    const p1Percent = p1Score !== null ? (p1Score / p1Max) * 100 : null;
    const p2Percent = p2Score !== null ? (p2Score / p2Max) * 100 : null;
    const p3Percent = p3Score !== null ? (p3Score / p3Max) * 100 : null;
    
    return {
        date: currentDate.split('T')[0],
        column: `D${testNum}`,
        type: 'diagnostic',
        task_name: `Diagnostic TEST ${testNum}`,
        score: total !== null ? String(total) : '',
        comment: '',
        added: currentDate,
        assessment_id: `d${testNum}`,
        assessment_title: `Diagnostic TEST ${testNum}`,
        
        paper1_score: p1Score,
        paper1_max: p1Max,
        paper1_percent: p1Percent,
        paper2_score: p2Score,
        paper2_max: p2Max,
        paper2_percent: p2Percent,
        paper3_score: p3Score,
        paper3_max: p3Max,
        paper3_percent: p3Percent,
        
        total_score: total,
        total_max: p1Max + p2Max + p3Max,
        total_percent: percent
    };
}

function extractUnitTest(
    row: ExcelJS.Row,
    testNum: number,
    colMap: SheetColumnMap,
    currentDate: string
): Assessment | null {
    const prefix = `t${testNum}_`;
    
    const lis1Col = colMap[`${prefix}lis1`];
    const lis2Col = colMap[`${prefix}lis2`];
    const readCol = colMap[`${prefix}read`];
    const voc1Col = colMap[`${prefix}voc1`];
    const voc2Col = colMap[`${prefix}voc2`];
    const gr1Col = colMap[`${prefix}gr1`];
    const gr2Col = colMap[`${prefix}gr2`];
    const gr3Col = colMap[`${prefix}gr3`];
    const totalCol = colMap[`${prefix}total`];
    const percentCol = colMap[`${prefix}percent`];
    
    const lis1 = lis1Col ? getNumericValue(row.getCell(lis1Col)) : null;
    const lis2 = lis2Col ? getNumericValue(row.getCell(lis2Col)) : null;
    const read = readCol ? getNumericValue(row.getCell(readCol)) : null;
    const voc1 = voc1Col ? getNumericValue(row.getCell(voc1Col)) : null;
    const voc2 = voc2Col ? getNumericValue(row.getCell(voc2Col)) : null;
    const gr1 = gr1Col ? getNumericValue(row.getCell(gr1Col)) : null;
    const gr2 = gr2Col ? getNumericValue(row.getCell(gr2Col)) : null;
    const gr3 = gr3Col ? getNumericValue(row.getCell(gr3Col)) : null;
    const total = totalCol ? getNumericValue(row.getCell(totalCol)) : null;
    const percent = percentCol ? getNumericValue(row.getCell(percentCol)) : null;
    
    // Only create if there's any data
    const hasData = lis1 !== null || lis2 !== null || read !== null || voc1 !== null || 
                    voc2 !== null || gr1 !== null || gr2 !== null || gr3 !== null || total !== null;
    
    if (!hasData) return null;
    
    return {
        date: currentDate.split('T')[0],
        column: `T${testNum}`,
        type: 'summative',
        task_name: `Unit ${testNum} TEST`,
        score: total !== null ? String(total) : '',
        comment: '',
        added: currentDate,
        assessment_id: `t${testNum}`,
        assessment_title: `Unit ${testNum} TEST`,
        
        lis1,
        lis2,
        read,
        voc1,
        voc2,
        gr1,
        gr2,
        gr3,
        
        total_score: total,
        total_max: null, // Don't have max scores easily available
        total_percent: percent
    };
}

function getCellValue(cell: ExcelJS.Cell): string {
    if (cell.value === null || cell.value === undefined) return '';
    
    if (typeof cell.value === 'object') {
        if ('result' in cell.value) return String(cell.value.result || '');
        if ('text' in cell.value) return String(cell.value.text || '');
        return '';
    }
    
    return String(cell.value).trim();
}

function getNumericValue(cell: ExcelJS.Cell): number | null {
    const value = getCellValue(cell);
    
    if (value === '' || value === 'n' || value === 'N/A') return null;
    
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
}

// Run the import
const excelPath = path.join(process.cwd(), 'dataJ.xlsx');
const outputPath = path.join(process.cwd(), 'master_student_data_J_v5_fixed.json');

importDataJ(excelPath, outputPath)
    .then(() => {
        console.log('\n✓ Import successful!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n✗ Import failed:', error);
        process.exit(1);
    });

