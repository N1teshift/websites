#!/usr/bin/env node

/**
 * Merge duplicate student records
 * Usage: npx tsx scripts/mergeDuplicateStudent.ts <correctLastName> <incorrectLastName> <firstName>
 * Example: npx tsx scripts/mergeDuplicateStudent.ts "Krungelevičiūtė" "Krunglevičiūtė" "Julija"
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { StudentData, Assessment } from '../../src/features/modules/edtech/progressReport/types/ProgressReportTypes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../src/features/modules/edtech/progressReport/student-data/data');

async function mergeDuplicateStudent() {
    const args = process.argv.slice(2);

    if (args.length < 3) {
        console.error('❌ Error: Missing arguments');
        console.log('\nUsage: npx tsx scripts/mergeDuplicateStudent.ts <correctLastName> <incorrectLastName> <firstName>');
        console.log('Example: npx tsx scripts/mergeDuplicateStudent.ts "Krungelevičiūtė" "Krunglevičiūtė" "Julija"');
        process.exit(1);
    }

    const [correctLastName, incorrectLastName, firstName] = args;

    console.log('🔄 Merging Duplicate Student\n');
    console.log('='.repeat(60));
    console.log(`First Name: ${firstName}`);
    console.log(`Correct Last Name: ${correctLastName}`);
    console.log(`Incorrect Last Name: ${incorrectLastName}`);
    console.log('='.repeat(60));
    console.log();

    try {
        // Build file paths
        const correctFilePath = path.join(DATA_DIR, `${firstName}_${correctLastName}.json`);
        const incorrectFilePath = path.join(DATA_DIR, `${firstName}_${incorrectLastName}.json`);

        // Check if both files exist
        let correctExists = false;
        let incorrectExists = false;

        try {
            await fs.access(correctFilePath);
            correctExists = true;
        } catch {}

        try {
            await fs.access(incorrectFilePath);
            incorrectExists = true;
        } catch {}

        if (!correctExists && !incorrectExists) {
            console.error('❌ Error: Neither student file exists');
            process.exit(1);
        }

        if (!incorrectExists) {
            console.log('✅ No duplicate found. Only the correct student exists.');
            process.exit(0);
        }

        // Load both files
        let correctStudent: StudentData | null = null;
        let incorrectStudent: StudentData;

        if (correctExists) {
            const correctContent = await fs.readFile(correctFilePath, 'utf-8');
            correctStudent = JSON.parse(correctContent);
            console.log(`✅ Loaded correct student file: ${path.basename(correctFilePath)}`);
        }

        const incorrectContent = await fs.readFile(incorrectFilePath, 'utf-8');
        incorrectStudent = JSON.parse(incorrectContent);
        console.log(`✅ Loaded incorrect student file: ${path.basename(incorrectFilePath)}`);
        console.log();

        if (!correctStudent) {
            // Just rename the incorrect file
            console.log('📝 Renaming incorrect file to correct name...');
            incorrectStudent.last_name = correctLastName;
            await fs.writeFile(correctFilePath, JSON.stringify(incorrectStudent, null, 2), 'utf-8');
            await fs.unlink(incorrectFilePath);
            console.log('✅ File renamed successfully!');
        } else {
            // Merge assessments
            console.log('🔀 Merging assessments...');
            
            if (!correctStudent.assessments) {
                correctStudent.assessments = [];
            }

            const incorrectAssessments = incorrectStudent.assessments || [];
            let mergedCount = 0;
            let duplicateCount = 0;

            for (const assessment of incorrectAssessments) {
                // Check if this assessment already exists in the correct student
                const exists = correctStudent.assessments.some(
                    a => a.date === assessment.date && a.column === assessment.column
                );

                if (!exists) {
                    correctStudent.assessments.push(assessment);
                    mergedCount++;
                } else {
                    duplicateCount++;
                }
            }

            console.log(`  ✅ Merged ${mergedCount} assessments`);
            if (duplicateCount > 0) {
                console.log(`  ⚠️  Skipped ${duplicateCount} duplicate assessments`);
            }
            console.log();

            // Save merged data
            await fs.writeFile(correctFilePath, JSON.stringify(correctStudent, null, 2), 'utf-8');
            console.log(`✅ Saved merged data to: ${path.basename(correctFilePath)}`);

            // Delete the incorrect file
            await fs.unlink(incorrectFilePath);
            console.log(`🗑️  Deleted duplicate file: ${path.basename(incorrectFilePath)}`);
        }

        console.log();
        console.log('='.repeat(60));
        console.log('✅ Merge complete!');
        console.log('='.repeat(60));
        console.log();
        console.log('📌 Next steps:');
        console.log('1. Run: npx tsx scripts/exportStudentData.ts progress_report_data_YYYY-MM-DD.json');
        console.log('2. Upload the new JSON to your dashboard');
        console.log();

        process.exit(0);

    } catch (error: any) {
        console.error();
        console.error('='.repeat(60));
        console.error('❌ MERGE FAILED');
        console.error('='.repeat(60));
        console.error();
        console.error(error.message || error);
        console.error();
        process.exit(1);
    }
}

mergeDuplicateStudent();

