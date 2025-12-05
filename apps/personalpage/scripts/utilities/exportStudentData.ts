#!/usr/bin/env node

/**
 * Export all student data as a single master JSON file (v3 format)
 * 
 * Usage: npx tsx scripts/exportStudentData.ts <output-file-path>
 * Example: npx tsx scripts/exportStudentData.ts master_student_data_v3.json
 */

import { StudentDataManagerV3 } from '../../src/features/modules/edtech/progressReport/student-data/utils/studentDataManagerV3';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
    console.log('📦 Student Data Exporter (v3)\n');
    console.log('='.repeat(60));
    
    // Get output file path from command line
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.error('❌ Error: No output file specified');
        console.log('\nUsage: npx tsx scripts/exportStudentData.ts <output-file-path>');
        console.log('Example: npx tsx scripts/exportStudentData.ts master_student_data_v3.json');
        process.exit(1);
    }
    
    const outputPath = resolve(args[0]);
    
    console.log(`📁 Output file: ${outputPath}`);
    console.log(`📁 Data directory: src/features/modules/edtech/progressReport/student-data/data/`);
    console.log('='.repeat(60));
    console.log();
    
    try {
        // Create manager instance
        const manager = new StudentDataManagerV3();
        
        // Export collection
        console.log('⏳ Exporting student data collection...\n');
        const count = await manager.exportToMasterFile(outputPath);
        
        // Display results
        console.log('='.repeat(60));
        console.log('✅ Export completed successfully!');
        console.log('='.repeat(60));
        console.log();
        console.log(`📄 Students exported: ${count}`);
        console.log(`📄 File saved: ${outputPath}`);
        console.log();
        
        process.exit(0);
        
    } catch (error: any) {
        console.error();
        console.error('='.repeat(60));
        console.error('❌ EXPORT FAILED');
        console.error('='.repeat(60));
        console.error();
        console.error(error.message || error);
        console.error();
        process.exit(1);
    }
}

main();
