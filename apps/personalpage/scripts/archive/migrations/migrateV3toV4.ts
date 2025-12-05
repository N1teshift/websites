#!/usr/bin/env node

/**
 * Bulk migrate all student JSON files from v3 to v4 schema
 * 
 * This script:
 * 1. Loads all v3 student JSON files
 * 2. Converts assessments to v4 format:
 *    - Renames summative_details → evaluation_details
 *    - Changes participation → board_solving
 *    - Changes SD columns from summative → test
 *    - Adds assessment_id and assessment_title
 * 3. Updates academic year to 2025-2026
 * 4. Sets enrolled_date to null
 * 5. Updates schema version to 4.0
 * 6. Saves updated files
 * 
 * Usage: npx tsx scripts/migrateV3toV4.ts
 */

import fs from 'fs/promises';
import path from 'path';

interface AssessmentV3 {
    date: string;
    column: string;
    type: string;
    task_name: string;
    score: string;
    comment: string;
    added: string;
    updated?: string;
    summative_details?: {
        percentage_score?: number;
        myp_score?: number;
        cambridge_score?: number;
    };
}

interface AssessmentV4 {
    date: string;
    column: string;
    type: string;
    task_name: string;
    score: string;
    comment: string;
    added: string;
    updated?: string;
    evaluation_details?: {
        percentage_score?: number | null;
        myp_score?: number | null;
        cambridge_score?: number | null;
    };
    assessment_id?: string | null;
    assessment_title?: string | null;
}

interface StudentV3 {
    id: string;
    first_name: string;
    last_name: string;
    class_name: string;
    academic: {
        year: string;
        grade: number;
        class_id: string;
        enrolled_date: string;
    };
    assessments: AssessmentV3[];
    metadata?: {
        schema_version?: string;
        created_at?: string;
        updated_at?: string;
    };
    [key: string]: any;
}

interface StudentV4 extends Omit<StudentV3, 'assessments' | 'academic'> {
    academic: {
        year: string;
        grade: number;
        class_id: string;
        enrolled_date: null;
    };
    assessments: AssessmentV4[];
}

/**
 * Generate assessment_id based on column and type
 */
function generateAssessmentId(column: string, type: string): string | null {
    const col = column.toLowerCase();
    
    if (type === 'homework') {
        return `homework-${col}`;
    } else if (type === 'classwork') {
        return `classwork-${col}`;
    } else if (type === 'diagnostic') {
        return `diagnostic-${col.replace('diag', '')}`;
    } else if (type === 'board_solving') {
        return `board-solving-${col}`;
    } else if (type === 'consultation') {
        return `consultation-${col}`;
    } else if (type === 'summative') {
        return `summative-${col}`;
    } else if (type === 'test') {
        return `test-${col}`;
    }
    
    return null;
}

/**
 * Generate assessment_title based on column and task name
 */
function generateAssessmentTitle(column: string, taskName: string): string {
    if (taskName && taskName !== column) {
        return taskName;
    }
    
    const col = column.toUpperCase();
    
    if (col.startsWith('ND')) {
        return `Homework ${col}`;
    } else if (col.startsWith('EXT')) {
        return `Classwork ${col}`;
    } else if (col.startsWith('DIAG')) {
        return `Diagnostic Assessment ${col.replace('DIAG', '')}`;
    } else if (col.startsWith('LNT')) {
        return `Board Solving ${col}`;
    } else if (col.startsWith('KONS')) {
        return `Consultation ${col}`;
    } else if (col.startsWith('KD')) {
        return `Summative ${col}`;
    } else if (col.startsWith('SD')) {
        return `Test ${col.replace('SD', '')}`;
    }
    
    return column;
}

/**
 * Migrate a single assessment from v3 to v4
 */
function migrateAssessment(assessment: AssessmentV3): AssessmentV4 {
    let assessmentType = assessment.type;
    
    // 1. Rename "participation" to "board_solving"
    if (assessmentType === 'participation') {
        assessmentType = 'board_solving';
    }
    
    // 2. Convert SD columns from "summative" to "test" type
    if (assessment.column.match(/^SD\d+$/) && assessmentType === 'summative') {
        assessmentType = 'test';
    }
    
    const v4Assessment: AssessmentV4 = {
        date: assessment.date,
        column: assessment.column,
        type: assessmentType,
        task_name: assessment.task_name,
        score: assessment.score,
        comment: assessment.comment,
        added: assessment.added,
        updated: assessment.updated,
        assessment_id: generateAssessmentId(assessment.column, assessmentType),
        assessment_title: generateAssessmentTitle(assessment.column, assessment.task_name)
    };
    
    // 3. Rename "summative_details" to "evaluation_details"
    if (assessment.summative_details) {
        v4Assessment.evaluation_details = {
            percentage_score: assessment.summative_details.percentage_score ?? null,
            myp_score: assessment.summative_details.myp_score ?? null,
            cambridge_score: assessment.summative_details.cambridge_score ?? null
        };
    }
    
    return v4Assessment;
}

/**
 * Migrate a single student from v3 to v4
 */
function migrateStudent(student: StudentV3): StudentV4 {
    const v4Student: StudentV4 = {
        ...student,
        academic: {
            year: '2025-2026', // Updated academic year
            grade: student.academic.grade,
            class_id: student.academic.class_id,
            enrolled_date: null // Set to null
        },
        assessments: student.assessments.map(migrateAssessment),
        metadata: {
            ...student.metadata,
            schema_version: '4.0',
            updated_at: new Date().toISOString()
        }
    };
    
    return v4Student;
}

/**
 * Main migration function
 */
async function migrate() {
    console.log('📦 Bulk Student Data Migration v3 → v4\n');
    console.log('='.repeat(70));
    
    try {
        const dataDir = path.join(process.cwd(), 'src/features/modules/edtech/progressReport/student-data/data');
        
        console.log(`\n📂 Data directory: ${dataDir}\n`);
        
        // Read all JSON files
        const files = await fs.readdir(dataDir);
        const jsonFiles = files.filter(f => f.endsWith('.json') && !f.startsWith('_'));
        
        console.log(`📖 Found ${jsonFiles.length} student files\n`);
        
        // Create backup directory
        const backupDir = path.join(process.cwd(), `backups/v3_backup_${new Date().toISOString().split('T')[0]}`);
        await fs.mkdir(backupDir, { recursive: true });
        console.log(`💾 Backup directory: ${backupDir}\n`);
        
        let v3Count = 0;
        let v4Count = 0;
        let migratedCount = 0;
        let errorCount = 0;
        let participationRenamed = 0;
        let sdConverted = 0;
        let detailsRenamed = 0;
        
        // Process each file
        for (const file of jsonFiles) {
            try {
                const filePath = path.join(dataDir, file);
                const content = await fs.readFile(filePath, 'utf-8');
                const student: StudentV3 = JSON.parse(content);
                
                // Check schema version
                const version = student.metadata?.schema_version;
                
                if (version === '4.0') {
                    v4Count++;
                    console.log(`✓ ${file} - Already v4, skipping`);
                    continue;
                } else if (version !== '3.0') {
                    console.log(`⚠ ${file} - Unknown version (${version}), skipping`);
                    continue;
                }
                
                v3Count++;
                
                // Create backup
                const backupPath = path.join(backupDir, file);
                await fs.copyFile(filePath, backupPath);
                
                // Count changes
                student.assessments.forEach(a => {
                    if (a.type === 'participation') participationRenamed++;
                    if (a.column.match(/^SD\d+$/) && a.type === 'summative') sdConverted++;
                    if (a.summative_details) detailsRenamed++;
                });
                
                // Migrate
                const v4Student = migrateStudent(student);
                
                // Save
                await fs.writeFile(filePath, JSON.stringify(v4Student, null, 2), 'utf-8');
                
                migratedCount++;
                console.log(`✓ ${file} - Migrated to v4`);
                
            } catch (error) {
                errorCount++;
                console.error(`✗ ${file} - Error:`, error instanceof Error ? error.message : error);
            }
        }
        
        // Summary
        console.log('\n' + '='.repeat(70));
        console.log('✅ Migration Complete!\n');
        console.log(`📊 Statistics:`);
        console.log(`   Total files found: ${jsonFiles.length}`);
        console.log(`   Already v4: ${v4Count}`);
        console.log(`   v3 files found: ${v3Count}`);
        console.log(`   Successfully migrated: ${migratedCount}`);
        console.log(`   Errors: ${errorCount}`);
        console.log(`\n📝 Changes made:`);
        console.log(`   "participation" → "board_solving": ${participationRenamed} assessments`);
        console.log(`   SD columns "summative" → "test": ${sdConverted} assessments`);
        console.log(`   "summative_details" → "evaluation_details": ${detailsRenamed} assessments`);
        console.log(`   Academic year updated: ${migratedCount} students (2024-2025 → 2025-2026)`);
        console.log(`   enrolled_date set to null: ${migratedCount} students`);
        console.log(`   assessment_id and assessment_title added: ${migratedCount} students`);
        console.log(`\n📁 Backup location: ${backupDir}`);
        console.log('\n' + '='.repeat(70));
        console.log('\n✨ Next steps:');
        console.log('   1. Verify migrated files in data directory');
        console.log('   2. Test Excel import with dashboard');
        console.log('   3. Export new master JSON with v4 format\n');
        
    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        if (error instanceof Error) {
            console.error(`   ${error.message}`);
        }
        process.exit(1);
    }
}

migrate();


