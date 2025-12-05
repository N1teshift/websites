#!/usr/bin/env node

/**
 * Standardize column naming across all assessment fields
 * 
 * Makes column the single source of truth:
 * - column: Short code (D1, SD1, ND1, KD2, P1, etc.)
 * - assessment_id: Lowercase version of column
 * - assessment_title: Same as column (or column + context)
 * - task_name: Column + descriptive text
 */

import fs from 'fs/promises';

interface Assessment {
    date: string;
    column: string;
    type: string;
    task_name: string;
    score: string;
    comment?: string;
    added: string;
    updated?: string;
    assessment_id?: string;
    assessment_title?: string;
    [key: string]: unknown;
}

interface Student {
    first_name: string;
    last_name: string;
    assessments: Assessment[];
    [key: string]: unknown;
}

interface DataFile {
    metadata: Record<string, unknown>;
    students: Student[];
}

interface StandardizationRule {
    oldColumn: string;
    newColumn: string;
    newAssessmentId: string;
    newAssessmentTitle: string;
    newTaskName: string;
}

const rules: StandardizationRule[] = [
    // Diagnostics: Diag1 → D1, Diag2 → D2
    { oldColumn: 'Diag1', newColumn: 'D1', newAssessmentId: 'd1', newAssessmentTitle: 'D1', newTaskName: 'D1: Diagnostic' },
    { oldColumn: 'Diag2', newColumn: 'D2', newAssessmentId: 'd2', newAssessmentTitle: 'D2', newTaskName: 'D2: Diagnostic' },
    
    // KD: Unit 2 → KD2
    { oldColumn: 'KD', newColumn: 'KD2', newAssessmentId: 'kd2', newAssessmentTitle: 'KD2', newTaskName: 'KD2: Cambridge Unit 2' },
    
    // KD1 stays KD1 but standardize
    { oldColumn: 'KD1', newColumn: 'KD1', newAssessmentId: 'kd1', newAssessmentTitle: 'KD1', newTaskName: 'KD1: Cambridge Unit 1' },
    
    // Generated grade: PG → P1
    { oldColumn: 'PG', newColumn: 'P1', newAssessmentId: 'p1', newAssessmentTitle: 'P1', newTaskName: 'P1: Generated Grade' },
    
    // Tests: Standardize IDs and titles
    { oldColumn: 'SD1', newColumn: 'SD1', newAssessmentId: 'sd1', newAssessmentTitle: 'SD1', newTaskName: 'SD1: Irrational Numbers' },
    { oldColumn: 'SD2', newColumn: 'SD2', newAssessmentId: 'sd2', newAssessmentTitle: 'SD2', newTaskName: 'SD2: Standard Form' },
    { oldColumn: 'SD3', newColumn: 'SD3', newAssessmentId: 'sd3', newAssessmentTitle: 'SD3', newTaskName: 'SD3: Indices' },
    { oldColumn: 'SD4', newColumn: 'SD4', newAssessmentId: 'sd4', newAssessmentTitle: 'SD4', newTaskName: 'SD4: Summative' },
    { oldColumn: 'SD5', newColumn: 'SD5', newAssessmentId: 'sd5', newAssessmentTitle: 'SD5', newTaskName: 'SD5: Summative' },
    
    // Homework: Standardize and renumber (remove gap)
    { oldColumn: 'ND1', newColumn: 'ND1', newAssessmentId: 'nd1', newAssessmentTitle: 'ND1', newTaskName: 'ND1: Homework' },
    { oldColumn: 'ND2', newColumn: 'ND2', newAssessmentId: 'nd2', newAssessmentTitle: 'ND2', newTaskName: 'ND2: Homework' },
    { oldColumn: 'ND3', newColumn: 'ND3', newAssessmentId: 'nd3', newAssessmentTitle: 'ND3', newTaskName: 'ND3: Graded Homework' },
    { oldColumn: 'ND5', newColumn: 'ND4', newAssessmentId: 'nd4', newAssessmentTitle: 'ND4', newTaskName: 'ND4: Reflection' },
    { oldColumn: 'ND6', newColumn: 'ND5', newAssessmentId: 'nd5', newAssessmentTitle: 'ND5', newTaskName: 'ND5: Homework' },
    
    // Classwork: Standardize
    { oldColumn: 'EXT1', newColumn: 'EXT1', newAssessmentId: 'ext1', newAssessmentTitle: 'EXT1', newTaskName: 'EXT1: Exercise Progress' },
    { oldColumn: 'EXT2', newColumn: 'EXT2', newAssessmentId: 'ext2', newAssessmentTitle: 'EXT2', newTaskName: 'EXT2: Exercise Progress' },
    { oldColumn: 'EXT3', newColumn: 'EXT3', newAssessmentId: 'ext3', newAssessmentTitle: 'EXT3', newTaskName: 'EXT3: Exercise Progress' },
    { oldColumn: 'EXT4', newColumn: 'EXT4', newAssessmentId: 'ext4', newAssessmentTitle: 'EXT4', newTaskName: 'EXT4: Exercise Progress' },
    { oldColumn: 'EXT5', newColumn: 'EXT5', newAssessmentId: 'ext5', newAssessmentTitle: 'EXT5', newTaskName: 'EXT5: Exercise Progress' },
    { oldColumn: 'EXT6', newColumn: 'EXT6', newAssessmentId: 'ext6', newAssessmentTitle: 'EXT6', newTaskName: 'EXT6: Exercise Progress' },
    { oldColumn: 'EXT7', newColumn: 'EXT7', newAssessmentId: 'ext7', newAssessmentTitle: 'EXT7', newTaskName: 'EXT7: Exercise Progress' },
    { oldColumn: 'EXT8', newColumn: 'EXT8', newAssessmentId: 'ext8', newAssessmentTitle: 'EXT8', newTaskName: 'EXT8: Exercise Progress' },
    
    // Board solving: Standardize
    { oldColumn: 'LNT1', newColumn: 'LNT1', newAssessmentId: 'lnt1', newAssessmentTitle: 'LNT1', newTaskName: 'LNT1: Board Participation' },
    { oldColumn: 'LNT6', newColumn: 'LNT6', newAssessmentId: 'lnt6', newAssessmentTitle: 'LNT6', newTaskName: 'LNT6: Board Participation' },
    { oldColumn: 'LNT7', newColumn: 'LNT7', newAssessmentId: 'lnt7', newAssessmentTitle: 'LNT7', newTaskName: 'LNT7: Board Participation' },
    { oldColumn: 'LNT8', newColumn: 'LNT8', newAssessmentId: 'lnt8', newAssessmentTitle: 'LNT8', newTaskName: 'LNT8: Board Participation' },
    
    // Social hours: Standardize
    { oldColumn: 'SOC', newColumn: 'SOC', newAssessmentId: 'soc', newAssessmentTitle: 'SOC', newTaskName: 'SOC: Social Hours' },
];

async function main() {
    console.log('🔧 Standardizing Column Names\n');
    console.log('='.repeat(60));
    
    const inputFile = 'progress_report_data_2025-11-05_final.json';
    const outputFile = 'progress_report_data_2025-11-05_standardized.json';
    
    try {
        console.log(`📂 Reading file: ${inputFile}`);
        const data: DataFile = JSON.parse(await fs.readFile(inputFile, 'utf-8'));
        
        let updatedCount = 0;
        const changeLog: Record<string, number> = {};
        
        console.log(`\n🔄 Processing ${data.students.length} students...\n`);
        
        // Build a lookup map
        const ruleMap = new Map(rules.map(r => [r.oldColumn, r]));
        
        for (const student of data.students) {
            for (const assessment of student.assessments) {
                const rule = ruleMap.get(assessment.column);
                
                if (rule) {
                    const changes: string[] = [];
                    
                    // Check what's changing
                    if (assessment.column !== rule.newColumn) {
                        changes.push(`column: ${assessment.column} → ${rule.newColumn}`);
                    }
                    if (assessment.assessment_id !== rule.newAssessmentId) {
                        changes.push(`ID: ${assessment.assessment_id} → ${rule.newAssessmentId}`);
                    }
                    if (assessment.assessment_title !== rule.newAssessmentTitle) {
                        changes.push(`title: ${assessment.assessment_title} → ${rule.newAssessmentTitle}`);
                    }
                    
                    if (changes.length > 0) {
                        // Apply changes
                        assessment.column = rule.newColumn;
                        assessment.assessment_id = rule.newAssessmentId;
                        assessment.assessment_title = rule.newAssessmentTitle;
                        assessment.task_name = rule.newTaskName;
                        assessment.updated = new Date().toISOString();
                        
                        updatedCount++;
                        changeLog[rule.oldColumn] = (changeLog[rule.oldColumn] || 0) + 1;
                    }
                }
                
                // Fix type: participation → board_solving for LNT columns
                if (assessment.column.startsWith('LNT') && assessment.type === 'participation') {
                    assessment.type = 'board_solving';
                    assessment.updated = new Date().toISOString();
                    updatedCount++;
                }
                
                // Normalize LNT scores: "1.0" → "1"
                if (assessment.column.startsWith('LNT')) {
                    const num = parseFloat(assessment.score);
                    if (!isNaN(num) && num === Math.floor(num)) {
                        const normalizedScore = Math.floor(num).toString();
                        if (assessment.score !== normalizedScore) {
                            assessment.score = normalizedScore;
                            assessment.updated = new Date().toISOString();
                            updatedCount++;
                        }
                    }
                }
            }
        }
        
        console.log('📊 Changes by column:');
        Object.entries(changeLog).sort().forEach(([col, count]) => {
            const rule = ruleMap.get(col);
            if (rule && col !== rule.newColumn) {
                console.log(`   ${col} → ${rule.newColumn}: ${count} records`);
            } else {
                console.log(`   ${col}: ${count} records standardized`);
            }
        });
        
        console.log(`\n✅ Total assessments updated: ${updatedCount}`);
        
        // Update metadata
        data.metadata.exported_at = new Date().toISOString();
        data.metadata.export_version = "v10.0-standardized-columns";
        
        console.log(`\n💾 Saving to: ${outputFile}`);
        await fs.writeFile(outputFile, JSON.stringify(data, null, 2), 'utf-8');
        
        console.log('\n' + '='.repeat(60));
        console.log('✅ Standardization completed successfully!');
        console.log('='.repeat(60));
        console.log(`\n📄 Output file: ${outputFile}`);
        console.log(`\n💡 Now upload "${outputFile}" to your dashboard!\n`);
        
        // Print summary of standardization
        console.log('\n📋 Standardization Summary:');
        console.log('   Column naming is now unified:');
        console.log('   - JSON column field = Dashboard display name');
        console.log('   - assessment_id = lowercase column name');
        console.log('   - assessment_title = column name');
        console.log('   - task_name = column + context\n');
        
    } catch (error) {
        const err = error as Error;
        console.error('\n❌ Error:', err.message);
        console.error(err.stack);
        process.exit(1);
    }
}

main();

