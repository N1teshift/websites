import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Assessment {
    date: string;
    column: string;
    type: string;
    task_name: string;
    score: string;
    comment: string;
    added: string;
    updated?: string;
    assessment_id?: string;
    assessment_title?: string;
    evaluation_details?: any;
}

interface Student {
    id: string;
    first_name: string;
    last_name: string;
    class_name: string;
    academic: any;
    profile: any;
    assessments: Assessment[];
}

interface DataFile {
    metadata: any;
    students: Student[];
}

interface DeletionRule {
    date?: string;
    column?: string;
    assessment_id?: string;
    assessment_title?: string;
    type?: string;
    description: string;
}

/**
 * Define which assessments to delete
 * Add or modify rules as needed
 */
const DELETION_RULES: DeletionRule[] = [
    {
        type: 'consultation',
        description: 'All Consultation data'
    }
];

/**
 * Check if an assessment matches a deletion rule
 */
function matchesRule(assessment: Assessment, rule: DeletionRule): boolean {
    // Check date
    if (rule.date && assessment.date !== rule.date) {
        return false;
    }
    
    // Check column
    if (rule.column && assessment.column !== rule.column) {
        return false;
    }
    
    // Check assessment_id
    if (rule.assessment_id && assessment.assessment_id !== rule.assessment_id) {
        return false;
    }
    
    // Check assessment_title (case-insensitive partial match)
    if (rule.assessment_title && 
        !assessment.assessment_title?.toLowerCase().includes(rule.assessment_title.toLowerCase())) {
        return false;
    }
    
    // Check type
    if (rule.type && assessment.type !== rule.type) {
        return false;
    }
    
    return true;
}

/**
 * Delete assessments matching the rules
 */
async function deleteAssessments() {
    console.log('🗑️  Deleting Assessments from Database\n');
    
    const inputFilePath = path.join(__dirname, '..', 'progress_report_data_2025-11-03_v18_final.json');
    const outputFilePath = path.join(__dirname, '..', 'progress_report_data_2025-11-03_v19_final.json');
    
    // Read the file
    console.log(`📖 Reading: ${inputFilePath}\n`);
    const rawData = fs.readFileSync(inputFilePath, 'utf-8');
    const data: DataFile = JSON.parse(rawData);
    
    let totalDeleted = 0;
    const deletionStats: { [key: string]: number } = {};
    
    // Initialize stats
    DELETION_RULES.forEach(rule => {
        deletionStats[rule.description] = 0;
    });
    
    // Process each student
    data.students.forEach(student => {
        const originalCount = student.assessments.length;
        
        // Filter out assessments that match any deletion rule
        student.assessments = student.assessments.filter(assessment => {
            for (const rule of DELETION_RULES) {
                if (matchesRule(assessment, rule)) {
                    deletionStats[rule.description]++;
                    totalDeleted++;
                    return false; // Delete this assessment
                }
            }
            return true; // Keep this assessment
        });
        
        const deletedCount = originalCount - student.assessments.length;
        if (deletedCount > 0) {
            console.log(`   ${student.first_name} ${student.last_name}: -${deletedCount} assessments`);
        }
    });
    
    // Update metadata
    data.metadata.schema_version = '4.5';
    data.metadata.export_version = 'v9.0-cleaned';
    data.metadata.exported_at = new Date().toISOString();
    
    // Write the updated data
    console.log(`\n💾 Writing: ${outputFilePath}`);
    fs.writeFileSync(outputFilePath, JSON.stringify(data, null, 2), 'utf-8');
    
    console.log('\n✅ Deletion Complete!\n');
    console.log('📊 Deletion Summary:');
    console.log('─'.repeat(80));
    
    Object.entries(deletionStats).forEach(([description, count]) => {
        if (count > 0) {
            console.log(`   ✓ ${description}: ${count} entries deleted`);
        } else {
            console.log(`   ⚠ ${description}: 0 entries found (already deleted or not present)`);
        }
    });
    
    console.log('─'.repeat(80));
    console.log(`   TOTAL DELETED: ${totalDeleted} assessments\n`);
    console.log(`📄 Output file: ${outputFilePath}`);
    console.log('\n💡 To add more deletion rules, edit the DELETION_RULES array in this script.');
}

deleteAssessments().catch(console.error);

