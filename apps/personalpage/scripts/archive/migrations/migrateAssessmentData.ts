/**
 * Migration Script: Fix Assessment Data Structure
 * 
 * Changes:
 * 1. Standardize assessment IDs (remove prefixes from ext9-12, sd6-8)
 * 2. Migrate ND1, ND2, ND4, ND5: score → on_time, score = null
 * 3. Add completed_on_time field
 */

import * as fs from 'fs';
import * as path from 'path';
import Logger from '../../../src/features/infrastructure/logging/logger';

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
    evaluation_details?: {
        percentage_score?: number | null;
        myp_score?: number | null;
        cambridge_score?: number | null;
        cambridge_score_1?: number | null;
        cambridge_score_2?: number | null;
    };
    on_time?: number;
    completed_on_time?: number;
}

interface StudentData {
    id: string;
    first_name: string;
    last_name: string;
    assessments?: Assessment[];
    [key: string]: any;
}

interface ProgressReportData {
    students: StudentData[];
    [key: string]: any;
}

async function migrateAssessmentData(inputPath: string, outputPath: string): Promise<void> {
    Logger.info('Starting assessment data migration', { inputPath, outputPath });
    
    // Read input file
    const fileContent = fs.readFileSync(inputPath, 'utf-8');
    const data: ProgressReportData = JSON.parse(fileContent);
    
    let totalAssessments = 0;
    let idsFixed = 0;
    let ndMigrated = 0;
    
    // Process each student
    for (const student of data.students) {
        if (!student.assessments) continue;
        
        for (const assessment of student.assessments) {
            totalAssessments++;
            
            // Fix 1: Standardize assessment IDs
            if (assessment.assessment_id) {
                const oldId = assessment.assessment_id;
                let newId = oldId;
                
                // Remove "classwork-" prefix from EXT9-12
                if (oldId.startsWith('classwork-ext')) {
                    newId = oldId.replace('classwork-', '');
                    idsFixed++;
                }
                
                // Remove "test-" prefix from SD6-8
                if (oldId.startsWith('test-sd')) {
                    newId = oldId.replace('test-', '');
                    idsFixed++;
                }
                
                assessment.assessment_id = newId;
            }
            
            // Fix 2: Migrate ND1, ND2, ND4, ND5 structure
            // Check if it's a homework type assessment (ND1, ND2, ND4, ND5)
            const isHomework = assessment.type === 'homework' || 
                              assessment.type === 'homework_reflection';
            const isOldND = assessment.column && 
                           (assessment.column === 'ND1' || 
                            assessment.column === 'ND2' || 
                            assessment.column === 'ND4' || 
                            assessment.column === 'ND5');
            
            if (isHomework && isOldND && assessment.on_time === undefined) {
                // Migrate: score → on_time (ONLY for binary 0/1 values)
                const scoreValue = assessment.score;
                
                // Only migrate if score is 0 or 1 (binary completion tracking)
                if (scoreValue === '1' || scoreValue === '0') {
                    if (scoreValue === '1') {
                        assessment.on_time = 1;
                        assessment.completed_on_time = 1;
                    } else {
                        assessment.on_time = 0;
                        assessment.completed_on_time = 0;
                    }
                    
                    // Set score to null (no actual grade for these)
                    assessment.score = '';
                    
                    ndMigrated++;
                    
                    Logger.debug('Migrated ND assessment', {
                        student: `${student.first_name} ${student.last_name}`,
                        column: assessment.column,
                        old_score: scoreValue,
                        on_time: assessment.on_time,
                        completed_on_time: assessment.completed_on_time
                    });
                } else {
                    // ND4 has actual SCORES (graded reflection), keep as is
                    Logger.debug('Skipping ND4 with score (graded reflection)', {
                        student: `${student.first_name} ${student.last_name}`,
                        column: assessment.column,
                        score: scoreValue
                    });
                }
            }
            
            // Fix 3: ND3 is graded homework - leave score as is, add on_time if not present
            const isND3 = assessment.column === 'ND3' && assessment.type === 'homework_graded';
            if (isND3 && assessment.on_time === undefined) {
                // Assume ND3 submissions are on time if they have a score
                assessment.on_time = assessment.score && assessment.score !== '' ? 1 : 0;
                assessment.completed_on_time = assessment.on_time;
            }
        }
    }
    
    // Write output file
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
    
    Logger.info('✅ Migration completed successfully', {
        totalStudents: data.students.length,
        totalAssessments,
        idsFixed,
        ndMigrated,
        outputPath
    });
    
    console.log('\n📊 Migration Summary:');
    console.log(`✅ Students processed: ${data.students.length}`);
    console.log(`✅ Assessments checked: ${totalAssessments}`);
    console.log(`✅ Assessment IDs fixed: ${idsFixed}`);
    console.log(`✅ ND assessments migrated: ${ndMigrated}`);
    console.log(`\n📁 Output saved to: ${outputPath}`);
}

// Main execution
const inputFile = process.argv[2] || 'progress_report_data_2025-11-09.json';
const outputFile = process.argv[3] || 'progress_report_data_2025-11-09_migrated.json';

migrateAssessmentData(inputFile, outputFile)
    .then(() => {
        console.log('\n✨ Migration script completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    });

