/**
 * Import dataJ.xlsx (Teacher J - English) and create student JSON with assessments array
 * Maps diagnostic tests to 'diagnostic' type and unit tests to 'summative' type
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

interface DiagnosticTest {
    testId: string;
    testName: string;
    testNumber: number;
    paper1Col: number;
    paper1Max: number;
    paper2Col: number;
    paper2Max: number;
    paper3Col: number;
    paper3Max: number;
    totalCol: number;
    percentCol: number;
}

interface UnitTest {
    testId: string;
    testName: string;
    testNumber: number;
    attributes: {
        name: string;
        field: 'lis1' | 'lis2' | 'read' | 'voc1' | 'voc2' | 'gr1' | 'gr2' | 'gr3';
        col: number;
        max?: number;
    }[];
    totalCol: number;
    percentCol: number;
}

// Diagnostic test configurations
const DIAGNOSTIC_TESTS: DiagnosticTest[] = [
    {
        testId: 'D1',
        testName: 'Diagnostic TEST 1',
        testNumber: 1,
        paper1Col: 18, paper1Max: 34,
        paper2Col: 20, paper2Max: 17,
        paper3Col: 22, paper3Max: 20,
        totalCol: 24,
        percentCol: 25
    },
    {
        testId: 'D2',
        testName: 'Diagnostic TEST 2',
        testNumber: 2,
        paper1Col: 27, paper1Max: 34,
        paper2Col: 29, paper2Max: 17,
        paper3Col: 31, paper3Max: 20,
        totalCol: 33,
        percentCol: 34
    },
    {
        testId: 'D3',
        testName: 'Diagnostic TEST 3',
        testNumber: 3,
        paper1Col: 36, paper1Max: 34,
        paper2Col: 38, paper2Max: 17,
        paper3Col: 40, paper3Max: 20,
        totalCol: 42,
        percentCol: 43
    }
];

// Unit test configurations (based on analysis)
const UNIT_TESTS: UnitTest[] = [
    {
        testId: 'T1',
        testName: 'Unit 1 TEST',
        testNumber: 1,
        attributes: [
            { name: 'Listening', field: 'lis1', col: 45 },
            { name: 'Reading', field: 'read', col: 46 },
            { name: 'VOC 1', field: 'voc1', col: 47 },
            { name: 'VOC 2', field: 'voc2', col: 48 },
            { name: 'GR 1', field: 'gr1', col: 49 },
            { name: 'GR 2', field: 'gr2', col: 50 }
        ],
        totalCol: 51,
        percentCol: 52
    },
    {
        testId: 'T2',
        testName: 'Unit 2 TEST',
        testNumber: 2,
        attributes: [
            { name: 'Listening 1 and 2', field: 'lis1', col: 54, max: 13 },
            { name: 'VOC 1 and 2', field: 'voc1', col: 55, max: 10 },
            { name: 'Grammar 1 and 2', field: 'gr1', col: 56, max: 10 },
            { name: 'Reading', field: 'read', col: 57, max: 5 }
        ],
        totalCol: 58,
        percentCol: 59
    },
    {
        testId: 'T3',
        testName: 'Unit 3 TEST',
        testNumber: 3,
        attributes: [
            { name: 'Listening 1 and 2', field: 'lis1', col: 61, max: 13 },
            { name: 'Read', field: 'read', col: 62, max: 5 },
            { name: 'Voc', field: 'voc1', col: 63, max: 10 },
            { name: 'GR', field: 'gr1', col: 64, max: 10 }
        ],
        totalCol: 65,
        percentCol: 66
    },
    {
        testId: 'T4',
        testName: 'Unit 4 TEST',
        testNumber: 4,
        attributes: [
            { name: 'Listening 1 and 2', field: 'lis1', col: 68, max: 9 },
            { name: 'Voc', field: 'voc1', col: 69, max: 10 },
            { name: 'GR', field: 'gr1', col: 70, max: 10 },
            { name: 'Read', field: 'read', col: 71, max: 7 }
        ],
        totalCol: 72,
        percentCol: 73
    },
    {
        testId: 'T5',
        testName: 'Unit 5 TEST',
        testNumber: 5,
        attributes: [
            { name: 'List 1', field: 'lis1', col: 75, max: 5 },
            { name: 'List 2', field: 'lis2', col: 76, max: 5 },
            { name: 'Voc1', field: 'voc1', col: 77, max: 5 },
            { name: 'Voc 2', field: 'voc2', col: 78, max: 5 },
            { name: 'Gr 1', field: 'gr1', col: 79, max: 7 },
            { name: 'Gr 2', field: 'gr2', col: 80, max: 5 },
            { name: 'Reading', field: 'read', col: 81, max: 8 }
        ],
        totalCol: 82,
        percentCol: 83
    },
    {
        testId: 'T6',
        testName: 'Unit 6 TEST',
        testNumber: 6,
        attributes: [
            { name: 'List 1', field: 'lis1', col: 85 },
            { name: 'List 2', field: 'lis2', col: 86 },
            { name: 'Voc 1', field: 'voc1', col: 87 },
            { name: 'Voc 2', field: 'voc2', col: 88 },
            { name: 'Gr 1', field: 'gr1', col: 89 },
            { name: 'Gr 2', field: 'gr2', col: 90 },
            { name: 'Gr 3', field: 'gr3', col: 91 },
            { name: 'Reading', field: 'read', col: 92 }
        ],
        totalCol: 93,
        percentCol: 94
    },
    {
        testId: 'T7',
        testName: 'Unit 7 TEST',
        testNumber: 7,
        attributes: [
            { name: 'List 1', field: 'lis1', col: 96, max: 5 },
            { name: 'List 2', field: 'lis2', col: 97, max: 4 },
            { name: 'Voc1', field: 'voc1', col: 98, max: 5 },
            { name: 'Voc 2', field: 'voc2', col: 99, max: 5 },
            { name: 'Gr 1', field: 'gr1', col: 100, max: 5 },
            { name: 'Gr 2', field: 'gr2', col: 101, max: 5 },
            { name: 'Reading', field: 'read', col: 102, max: 14 }
        ],
        totalCol: 103,
        percentCol: 104
    }
];

async function importDataJ(filePath: string, outputPath: string): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    Logger.info('Starting dataJ.xlsx import');
    console.log('='.repeat(80));
    console.log('IMPORTING: dataJ.xlsx (Teacher J - English)');
    console.log('='.repeat(80));
    
    const allStudents: StudentData[] = [];
    let studentIdCounter = 1;
    
    // Process each sheet (class)
    workbook.eachSheet((worksheet) => {
        const className = worksheet.name.trim();
        Logger.info(`Processing sheet: ${className}`);
        console.log(`\nProcessing Sheet: "${className}"`);
        console.log('-'.repeat(80));
        
        // Extract grade from class name (e.g., "3 Algirdas" -> grade 3)
        const gradeMatch = className.match(/^(\d+)\s+/);
        const grade = gradeMatch ? parseInt(gradeMatch[1]) : 3;
        
        let studentsProcessed = 0;
        
        // Process each student row (starting from row 3)
        for (let rowNum = 3; rowNum <= worksheet.rowCount; rowNum++) {
            const row = worksheet.getRow(rowNum);
            
            // Get student name from column 2 (Name/Surname combined)
            const nameFull = getCellValue(row.getCell(2));
            
            if (!nameFull || nameFull === '') {
                continue; // Skip empty rows
            }
            
            // Split name (format can be "FirstName LastName" or "FirstName")
            const nameParts = String(nameFull).trim().split(/\s+/);
            const firstName = nameParts[0];
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
            
            const studentId = `teacher_j_${String(studentIdCounter).padStart(4, '0')}`;
            studentIdCounter++;
            
            // Process all assessments for this student
            const assessments: Assessment[] = [];
            const currentDate = new Date().toISOString();
            
            // Process diagnostic tests
            for (const diag of DIAGNOSTIC_TESTS) {
                const assessment = extractDiagnosticTest(row, diag, currentDate);
                if (assessment) {
                    assessments.push(assessment);
                }
            }
            
            // Process unit tests
            for (const unit of UNIT_TESTS) {
                const assessment = extractUnitTest(row, unit, currentDate);
                if (assessment) {
                    assessments.push(assessment);
                }
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
    
    // Create final data structure
    const outputData: ProgressReportData = {
        metadata: {
            exported_at: new Date().toISOString(),
            schema_version: '5.0',
            total_students: allStudents.length,
            export_version: 'teacher_j_v1',
            teacher_type: 'J',
            teacher_name: 'Teacher J (English)'
        },
        students: allStudents
    };
    
    // Write to file
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

function extractDiagnosticTest(
    row: ExcelJS.Row, 
    diag: DiagnosticTest, 
    currentDate: string
): Assessment | null {
    const paper1 = getNumericValue(row.getCell(diag.paper1Col));
    const paper2 = getNumericValue(row.getCell(diag.paper2Col));
    const paper3 = getNumericValue(row.getCell(diag.paper3Col));
    const total = getNumericValue(row.getCell(diag.totalCol));
    const percent = getNumericValue(row.getCell(diag.percentCol));
    
    // Calculate percentages for individual papers
    const paper1Percent = paper1 !== null ? (paper1 / diag.paper1Max) * 100 : null;
    const paper2Percent = paper2 !== null ? (paper2 / diag.paper2Max) * 100 : null;
    const paper3Percent = paper3 !== null ? (paper3 / diag.paper3Max) * 100 : null;
    
    const totalMax = diag.paper1Max + diag.paper2Max + diag.paper3Max;
    
    // Create assessment even if no data (for D2, D3 which are future tests)
    const assessment: Assessment = {
        date: currentDate.split('T')[0],
        column: diag.testId,
        type: 'diagnostic',
        task_name: diag.testName,
        score: total !== null ? String(total) : '',
        comment: '',
        added: currentDate,
        assessment_id: diag.testId.toLowerCase(),
        assessment_title: diag.testName,
        
        // Paper scores
        paper1_score: paper1,
        paper1_max: diag.paper1Max,
        paper1_percent: paper1Percent,
        paper2_score: paper2,
        paper2_max: diag.paper2Max,
        paper2_percent: paper2Percent,
        paper3_score: paper3,
        paper3_max: diag.paper3Max,
        paper3_percent: paper3Percent,
        
        // Totals
        total_score: total,
        total_max: totalMax,
        total_percent: percent
    };
    
    return assessment;
}

function extractUnitTest(
    row: ExcelJS.Row, 
    unit: UnitTest, 
    currentDate: string
): Assessment | null {
    // Extract all attribute values
    const attributeValues: { [key: string]: number | null } = {};
    let hasAnyData = false;
    let totalMax = 0;
    
    for (const attr of unit.attributes) {
        const value = getNumericValue(row.getCell(attr.col));
        attributeValues[attr.field] = value;
        
        if (value !== null) {
            hasAnyData = true;
        }
        
        if (attr.max) {
            totalMax += attr.max;
        }
    }
    
    const total = getNumericValue(row.getCell(unit.totalCol));
    const percent = getNumericValue(row.getCell(unit.percentCol));
    
    // Only create assessment if there's data
    if (!hasAnyData && total === null) {
        return null;
    }
    
    const assessment: Assessment = {
        date: currentDate.split('T')[0],
        column: unit.testId,
        type: 'summative',
        task_name: unit.testName,
        score: total !== null ? String(total) : '',
        comment: '',
        added: currentDate,
        assessment_id: unit.testId.toLowerCase(),
        assessment_title: unit.testName,
        
        // Individual attributes
        lis1: attributeValues['lis1'] || null,
        lis2: attributeValues['lis2'] || null,
        read: attributeValues['read'] || null,
        voc1: attributeValues['voc1'] || null,
        voc2: attributeValues['voc2'] || null,
        gr1: attributeValues['gr1'] || null,
        gr2: attributeValues['gr2'] || null,
        gr3: attributeValues['gr3'] || null,
        
        // Totals
        total_score: total,
        total_max: totalMax > 0 ? totalMax : null,
        total_percent: percent
    };
    
    return assessment;
}

function getCellValue(cell: ExcelJS.Cell): string {
    if (cell.value === null || cell.value === undefined) {
        return '';
    }
    
    if (typeof cell.value === 'object') {
        if ('result' in cell.value) {
            return String(cell.value.result || '');
        }
        if ('text' in cell.value) {
            return String(cell.value.text || '');
        }
        return '';
    }
    
    return String(cell.value).trim();
}

function getNumericValue(cell: ExcelJS.Cell): number | null {
    const value = getCellValue(cell);
    
    if (value === '' || value === 'n' || value === 'N/A') {
        return null;
    }
    
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
}

// Run the import
const excelPath = path.join(process.cwd(), 'dataJ.xlsx');
const outputPath = path.join(process.cwd(), 'master_student_data_J_v5.json');

importDataJ(excelPath, outputPath)
    .then(() => {
        console.log('\n✓ Import successful!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n✗ Import failed:', error);
        process.exit(1);
    });

